import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  onSnapshot, 
  updateDoc, 
  increment, 
  setDoc, 
  getDoc, 
  getDocFromServer,
  query, 
  where, 
  getDocs, 
  limit,
  getCountFromServer
} from 'firebase/firestore';
import { db, auth } from '../firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firestore connection test successful');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore appears to be offline. Data will sync once a connection is established.");
    }
  }
}
testConnection();

// Generate a random session ID for the visit
const SESSION_ID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const generateCode = () => Math.floor(1000 + Math.random() * 9000).toString();

const isCodeUnique = async (code: string) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('code', '==', code));
  const snap = await getDocs(q);
  return snap.empty;
};

const getUniqueCode = async (): Promise<string> => {
  let code = generateCode();
  let attempts = 0;
  while (!(await isCodeUnique(code)) && attempts < 10) {
    code = generateCode();
    attempts++;
  }
  return code;
};

const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "Mobile";
  return "Desktop";
};

export interface TrackingProperties {
  [key: string]: any;
}

export const getUTMParams = () => {
  const params = new URLSearchParams(window.location.search);
  const utms: Record<string, string> = {};
  
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
    const val = params.get(key);
    if (val) utms[key] = val;
  });
  
  return utms;
};

// Retrieve resolved campaignId from session
export const getCampaignId = (): string | null => {
  return sessionStorage.getItem('campaign_id');
};

// Initialize campaign resolution on app load
export const initializeCampaign = async () => {
  const utms = getUTMParams();
  if (Object.keys(utms).length === 0) return;

  // Potential API call to resolve based on UTMs
  console.log('Resolving campaign for UTMs:', utms);
};

const cleanData = (data: any): any => {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(cleanData);
  if (data instanceof Date) return data;
  
  // Check if it's a Firestore FieldValue or similar special object
  // These usually don't have a standard constructor or have specific internal properties
  if (data.constructor?.name === 'FieldValue' || data._methodName) return data;

  const cleaned: any = {};
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (value !== undefined) {
      cleaned[key] = cleanData(value);
    }
  });
  return cleaned;
};

// Constants
const SESSION_START_TIME = typeof window !== 'undefined' ? (window as any).SESSION_START || Date.now() : Date.now();

// Helper to get consistent Session ID across all scripts
const getBFSessionId = () => {
  if (typeof window === 'undefined') return "server";
  let sid = localStorage.getItem('bf_sid');
  if (!sid) {
    // Use crypto.randomUUID if available, otherwise fallback to robust random string
    sid = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : 's_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('bf_sid', sid);
  }
  return sid;
};

export const trackEvent = async (eventName: string, properties: TrackingProperties = {}) => {
  const sessionId = getBFSessionId();
  const timestamp = new Date().toISOString();
  
  const standardizedProperties = {
    ...properties,
    session_duration: Math.floor((Date.now() - SESSION_START_TIME) / 1000),
    device: getDeviceType(),
    url: window.location.href,
    path: window.location.pathname,
    referrer: document.referrer || "",
    language: properties.language || localStorage.getItem('bidflow_lang') || navigator.language || 'en'
  };

  // Log to Firestore
  try {
    const eventsRef = collection(db, 'events');
    await addDoc(eventsRef, {
      session_id: sessionId,
      event_name: eventName,
      timestamp: timestamp,
      firestore_timestamp: serverTimestamp(),
      properties: standardizedProperties
    });
  } catch (e) {
    console.warn('Failed to log event to Firestore:', e);
  }

  // Also send to direct API via Navigator.sendBeacon for secondary analytics
  const BIDFLOW_API = '/api/events';
  const payload = JSON.stringify({
    session_id: sessionId,
    event_name: eventName,
    timestamp: timestamp,
    properties: standardizedProperties
  });

  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    const blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon(BIDFLOW_API, blob);
  } else if (typeof fetch !== 'undefined') {
    fetch(BIDFLOW_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
      mode: 'cors'
    }).catch(() => {});
  }
};

export const trackSessionStart = () => {
  const utms = getUTMParams();
  const getOS = () => {
    const userAgent = window.navigator.userAgent;
    if (userAgent.indexOf("Win") !== -1) return "Windows";
    if (userAgent.indexOf("Mac") !== -1) return "macOS";
    if (userAgent.indexOf("X11") !== -1) return "UNIX";
    if (userAgent.indexOf("Linux") !== -1) return "Linux";
    if (/Android/.test(userAgent)) return "Android";
    if (/iPhone|iPad|iPod/.test(userAgent)) return "iOS";
    return "Unknown";
  };

  const getBrowser = () => {
    const ua = navigator.userAgent;
    if (ua.indexOf("Firefox") > -1) return "Firefox";
    if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) return "Opera";
    if (ua.indexOf("Trident") > -1) return "Internet Explorer";
    if (ua.indexOf("Edge") > -1 || ua.indexOf("Edg") > -1) return "Edge";
    if (ua.indexOf("Chrome") > -1) return "Chrome";
    if (ua.indexOf("Safari") > -1) return "Safari";
    return "Unknown";
  };

  const currentLang = localStorage.getItem('bidflow_lang') || navigator.language || 'en';

  trackEvent('session_start', {
    user_agent: navigator.userAgent,
    os: getOS(),
    browser: getBrowser(),
    device_type: getDeviceType() === 'Mobile' ? 'Mobile' : (getDeviceType() === 'Tablet' ? 'Mobile' : 'Desktop'),
    language: currentLang,
    ...utms,
    referrer: document.referrer || "direct"
  });
};

// Simplified Scroll Depth Tracking - Using unified thresholds
if (typeof window !== 'undefined') {
  const trackedThresholds = new Set();
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const b = document.body;
    const st = 'scrollTop';
    const sh = 'scrollHeight';
    const scrollPercent = Math.round((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight) * 100) || 0;
    
    [25, 50, 75, 100].forEach(threshold => {
      if (scrollPercent >= threshold && !trackedThresholds.has(threshold)) {
        trackedThresholds.add(threshold);
        trackEvent('scroll_depth', { percentage: threshold });
      }
    });
  });
}

export const saveUserRegistration = async (userData: any) => {
  try {
    const email = userData.email.toLowerCase();
    const userRef = doc(db, 'users', email);
    
    // Check if user already exists using the email as ID
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      console.log('User with this email already exists');
      return { success: false, alreadyExists: true };
    }

    // Generate unique 4-digit code
    const uniqueCode = await getUniqueCode();

    const utms = getUTMParams();
    const SESSION_DURATION = Math.floor((Date.now() - (typeof window !== 'undefined' ? (window as any).SESSION_START || Date.now() : Date.now())) / 1000);
    
    // Calculate live engagement metrics
    let liveScroll = 0;
    let liveVideo = 0;
    let siteLang = 'en';
    if (typeof window !== 'undefined') {
      const metrics = (window as any).bidflow_metrics;
      if (metrics) {
        liveScroll = metrics.maxScroll || 0;
        liveVideo = metrics.totalVideoTime || 0;
        siteLang = metrics.lang || 'en';
        if (metrics.videoStartTime > 0) {
          liveVideo += (Date.now() - metrics.videoStartTime) / 1000;
        }
      } else {
        const h = document.documentElement;
        const b = document.body;
        const st = 'scrollTop';
        const sh = 'scrollHeight';
        liveScroll = Math.round((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight) * 100) || 0;
        
        if (window.bidflow && typeof window.bidflow.getVideoWatchTime === 'function') {
          liveVideo = window.bidflow.getVideoWatchTime();
        }
      }
    }

    const data = cleanData({
      ...userData,
      email: email, 
      code: uniqueCode,
      timestamp: new Date().toISOString(),
      firestore_timestamp: serverTimestamp(),
      session_id: localStorage.getItem('bf_sid') || getBFSessionId(),
      campaign_id: getCampaignId(),
      
      // Standardized properties for dashboard
      utm_source: utms.utm_source || "",
      utm_campaign: utms.utm_campaign || "",
      utm_medium: utms.utm_medium || "",
      device: getDeviceType(),
      language: siteLang || navigator.language || 'en',
      session_duration: SESSION_DURATION,
      scroll: liveScroll,
      scroll_depth: liveScroll,
      video_duration: Math.round(liveVideo),
      video_watch_time: Math.round(liveVideo),
      url: window.location.href,
      path: window.location.pathname
    });

    await setDoc(userRef, data, { merge: true });
    
    // Update public counters
    const counterRef = doc(db, 'stats', 'counters');
    const roleKey = userData.role === 'buyer' ? 'buyers' : 'suppliers';
    
    try {
      await updateDoc(counterRef, {
        [roleKey]: increment(1),
        total: increment(1)
      });
    } catch (e) {
      // If document doesn't exist, create it
      await setDoc(counterRef, {
        buyers: userData.role === 'buyer' ? 1 : 0,
        suppliers: userData.role === 'supplier' ? 1 : 0,
        total: 1
      }, { merge: true });
    }

    console.log('User registration saved:', data);
    return { success: true, code: uniqueCode };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'users');
    return { success: false, error };
  }
};

export const subscribeToCounters = (callback: (data: { buyers: number; suppliers: number; total?: number }) => void) => {
  const counterRef = doc(db, 'stats', 'counters');
  
  // Also try to get a quick actual count from the users collection as a fallback/initial value
  const usersRef = collection(db, 'users');
  getCountFromServer(usersRef).then(snapshot => {
    const total = snapshot.data().count;
    // We don't know the exact split without more queries, so we set total
    callback({ buyers: 0, suppliers: 0, total: total });
  }).catch(err => {
    console.debug('Fallback count failed (likely permissions):', err);
  });

  return onSnapshot(counterRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as { buyers: number; suppliers: number; total?: number });
    }
  }, (error) => {
    // If it's a permission error, it might just be a regular user
    if (error.code !== 'permission-denied') {
      handleFirestoreError(error, OperationType.LIST, 'stats/counters');
    }
  });
};

export const initializeCounters = async () => {
  // Always try to seed administrators first, independently of counter permissions
  await seedAdministrators();

  try {
    const counterRef = doc(db, 'stats', 'counters');
    
    // Aggregation queries require read access to 'users' collection
    // This part might fail for non-admins, so we wrap it tightly
    const buyersQuery = query(collection(db, 'users'), where('role', '==', 'buyer'));
    const suppliersQuery = query(collection(db, 'users'), where('role', '==', 'supplier'));
    
    const [buyersSnap, suppliersSnap] = await Promise.all([
      getCountFromServer(buyersQuery),
      getCountFromServer(suppliersQuery)
    ]);
    
    const actualBuyers = buyersSnap.data().count;
    const actualSuppliers = suppliersSnap.data().count;
    const totalActual = actualBuyers + actualSuppliers;

    // We can also double check total without roles to be safe
    const totalQuery = query(collection(db, 'users'));
    const totalSnap = await getCountFromServer(totalQuery);
    const absoluteTotal = totalSnap.data().count;

    await setDoc(counterRef, {
      buyers: actualBuyers,
      suppliers: actualSuppliers,
      total: absoluteTotal,
      lastReconciled: serverTimestamp()
    }, { merge: true });
    
    console.log(`Counters reconciled: Buyers=${actualBuyers}, Suppliers=${actualSuppliers}, Total=${absoluteTotal}`);
  } catch (error) {
    // We expect this to fail for regular visitors who are not admins
    console.log('Counter reconciliation skipped (expected for non-admins)');
  }
};

export const seedAdministrators = async () => {
  try {
    const admins = [
      {
        email: "anechka.akpoyan95@gmail.com",
        password: "bidflow2025",
        role: "ADMIN",
        updatedAt: new Date().toISOString()
      },
      {
        email: "shintender.am@gmail.com",
        password: "bidflow2025",
        role: "ADMIN",
        updatedAt: new Date().toISOString()
      }
    ];

    for (const admin of admins) {
      const adminRef = doc(db, 'admins', admin.email);
      const adminDoc = await getDoc(adminRef);
      
      if (!adminDoc.exists()) {
        await setDoc(adminRef, admin);
        console.log(`Admin account created: ${admin.email}`);
      }
    }
  } catch (error) {
    console.warn('Failed to seed administrators:', error);
  }
};