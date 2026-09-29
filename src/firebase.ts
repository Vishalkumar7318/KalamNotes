import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  orderBy,
  deleteDoc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { NotebookDocument, HistoryItem } from './types';

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication & Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Cloud Firestore using provisioned database ID
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Validate Connection to Firestore on boot as specified in Firebase Skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network restricted.');
    }
  }
}
testConnection();

/**
 * Sign in using Google OAuth with Firebase
 */
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Persist user profile in Firestore
  if (user) {
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          id: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Student',
          photoURL: user.photoURL || '',
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Failed to sync user profile to Firestore:', err);
    }
  }

  return user;
}

/**
 * Sign out current user from Firebase
 */
export async function logOutFirebase(): Promise<void> {
  await signOut(auth);
}

/**
 * Save notebook document to Firestore under users/{userId}/notebooks/{notebookId}
 */
export async function saveNotebookToFirestore(
  userId: string,
  docData: NotebookDocument
): Promise<void> {
  if (!userId || !docData?.id) return;
  const notebookRef = doc(db, 'users', userId, 'notebooks', docData.id);
  const payload = {
    ...docData,
    userId,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  await setDoc(notebookRef, payload, { merge: true });
}

/**
 * Load all user-saved notebooks from Firestore
 */
export async function getUserNotebooksFromFirestore(userId: string): Promise<HistoryItem[]> {
  if (!userId) return [];
  try {
    const colRef = collection(db, 'users', userId, 'notebooks');
    const snapshot = await getDocs(colRef);
    const items: HistoryItem[] = [];

    snapshot.forEach((snap) => {
      const data = snap.data() as any;
      if (data && data.pages) {
        items.push({
          id: data.id || snap.id,
          topic: data.topic || data.title,
          title: data.title || 'Untitled Note',
          targetPages: data.targetPages || data.pages.length || 1,
          timestamp: data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now(),
          doc: data as NotebookDocument,
        });
      }
    });

    // Sort latest first
    return items.sort((a, b) => b.timestamp - a.timestamp);
  } catch (err) {
    console.error('Failed to load notebooks from Firestore:', err);
    return [];
  }
}

/**
 * Delete a notebook from Firestore
 */
export async function deleteNotebookFromFirestore(userId: string, notebookId: string): Promise<void> {
  if (!userId || !notebookId) return;
  const notebookRef = doc(db, 'users', userId, 'notebooks', notebookId);
  await deleteDoc(notebookRef);
}
