import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase
const isPlaceholder = !firebaseConfig.projectId || firebaseConfig.projectId.includes('remixed-project-id');

export const isFirebaseConfigured = !isPlaceholder;

if (isPlaceholder) {
  console.warn('Firebase is using placeholder configuration. Real-time features and tracking will be disabled until valid credentials are provided in firebase-applet-config.json.');
}

const app = initializeApp(firebaseConfig);

// Initialize Firestore with the specific database ID
if (isFirebaseConfigured) {
  console.log('Initializing Firestore with database ID:', firebaseConfig.firestoreDatabaseId);
}
// If firestoreDatabaseId is empty or "(default)", getFirestore(app) is used.
// Otherwise, it uses the specific ID.
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);