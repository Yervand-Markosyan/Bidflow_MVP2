import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// If firestoreDatabaseId is empty or "(default)", getFirestore(app) is used.
// Otherwise, it uses the specific ID.
const databaseId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

// Use initializeFirestore with experimentalAutoDetectLongPolling enabled.
// This forces Firestore to fall back to HTTP long polling if the primary WebSockets
// connection is blocked or timed out by firewalls, local ISPs, or restricted proxies.
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
}, databaseId);

export const auth = getAuth(app);
