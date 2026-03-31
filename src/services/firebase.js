import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

// Firebase configuration — replace with your project credentials
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'opp-lifestyle.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'opp-lifestyle',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'opp-lifestyle.appspot.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId: process.env.FIREBASE_APP_ID || 'YOUR_APP_ID',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ─── AUTH OPERATIONS ────────────────────────────────────────────────────────

export const registerUser = async (email, password, displayName) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  return credential.user;
};

export const loginUser = async (email, password) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

export const logoutUser = () => signOut(auth);

export const onAuthChanged = (callback) => onAuthStateChanged(auth, callback);

// ─── USER OPERATIONS ────────────────────────────────────────────────────────

export const createUserProfile = async (uid, data) => {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    isVerified: false,
    isAdmin: false,
    reputationScore: 0,
    badges: [],
    dues: { status: 'unpaid', lastPaid: null },
    onboardingComplete: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateUserProfile = async (uid, data) => {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const subscribeToUser = (uid, callback) =>
  onSnapshot(doc(db, 'users', uid), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });

export const getAllMembers = async () => {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const verifyMember = async (uid, adminUid) => {
  await updateDoc(doc(db, 'users', uid), {
    isVerified: true,
    verifiedAt: serverTimestamp(),
    verifiedBy: adminUid,
    'dues.status': 'paid',
    'dues.lastPaid': serverTimestamp(),
  });
  await adjustReputation(uid, 50, 'dues_paid');
};

// ─── REPUTATION OPERATIONS ──────────────────────────────────────────────────

export const adjustReputation = async (uid, points, reason) => {
  await updateDoc(doc(db, 'users', uid), {
    reputationScore: increment(points),
  });
  await addDoc(collection(db, 'reputationLog'), {
    uid,
    points,
    reason,
    timestamp: serverTimestamp(),
  });
};

// ─── FEED OPERATIONS ────────────────────────────────────────────────────────

export const createPost = async (data) => {
  return addDoc(collection(db, 'posts'), {
    ...data,
    likes: [],
    comments: 0,
    createdAt: serverTimestamp(),
  });
};

export const subscribeToPosts = (callback) =>
  onSnapshot(
    query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50)),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );

export const likePost = async (postId, uid) => {
  await updateDoc(doc(db, 'posts', postId), { likes: arrayUnion(uid) });
};

export const unlikePost = async (postId, uid) => {
  await updateDoc(doc(db, 'posts', postId), { likes: arrayRemove(uid) });
};

// ─── BUSINESS MARKETPLACE ───────────────────────────────────────────────────

export const createVendorListing = async (data) => {
  return addDoc(collection(db, 'vendors'), {
    ...data,
    vouches: [],
    rating: 0,
    createdAt: serverTimestamp(),
  });
};

export const getVendors = async (category = null) => {
  const q = category
    ? query(collection(db, 'vendors'), where('category', '==', category))
    : collection(db, 'vendors');
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const vouchVendor = async (vendorId, uid, vendorOwnerId) => {
  await updateDoc(doc(db, 'vendors', vendorId), { vouches: arrayUnion(uid) });
  await adjustReputation(vendorOwnerId, 10, 'vouch_received');
};

// ─── MATCHMAKER ─────────────────────────────────────────────────────────────

export const submitVibe = async (fromUid, toUid) => {
  // Store as a private doc only readable by admins / Cloud Functions
  await setDoc(doc(db, 'vibes', `${fromUid}_${toUid}`), {
    from: fromUid,
    to: toUid,
    timestamp: serverTimestamp(),
  });
  // Check for mutual match
  const reverseSnap = await getDoc(doc(db, 'vibes', `${toUid}_${fromUid}`));
  if (reverseSnap.exists()) {
    // Create a match
    const matchId = [fromUid, toUid].sort().join('_');
    await setDoc(doc(db, 'matches', matchId), {
      users: [fromUid, toUid],
      matchedAt: serverTimestamp(),
      notified: false,
    });
    return true; // mutual match
  }
  return false;
};

export const getMyMatches = async (uid) => {
  const snap = await getDocs(
    query(collection(db, 'matches'), where('users', 'array-contains', uid))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ─── FINANCIAL / PURSE ──────────────────────────────────────────────────────

export const getPurseStats = async () => {
  const snap = await getDoc(doc(db, 'purse', 'stats'));
  return snap.exists() ? snap.data() : { carnivalTotal: 0, medicalTotal: 0, paidMembers: [] };
};

export const subscribeToPurse = (callback) =>
  onSnapshot(doc(db, 'purse', 'stats'), (snap) => {
    if (snap.exists()) callback(snap.data());
  });

export const recordContribution = async (uid, amount, fund, reference) => {
  await addDoc(collection(db, 'contributions'), {
    uid,
    amount,
    fund,
    reference,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
};

// ─── EVENTS / CARNIVAL ──────────────────────────────────────────────────────

export const rsvpEvent = async (eventId, uid, status) => {
  await setDoc(doc(db, 'events', eventId, 'rsvps', uid), {
    uid,
    status, // 'attending' | 'maybe' | 'not_attending'
    updatedAt: serverTimestamp(),
  });
};

export const getEventRsvps = async (eventId) => {
  const snap = await getDocs(collection(db, 'events', eventId, 'rsvps'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ─── CHAT ────────────────────────────────────────────────────────────────────

export const sendMessage = async (roomId, message) => {
  await addDoc(collection(db, 'rooms', roomId, 'messages'), {
    ...message,
    createdAt: serverTimestamp(),
  });
};

export const subscribeToMessages = (roomId, callback) =>
  onSnapshot(
    query(
      collection(db, 'rooms', roomId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100)
    ),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );

// ─── STORAGE ─────────────────────────────────────────────────────────────────

export const uploadMedia = async (uri, path) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
};

export const deleteMedia = async (path) => {
  await deleteObject(ref(storage, path));
};

// ─── ADMIN ───────────────────────────────────────────────────────────────────

export const getAdminStats = async () => {
  const usersSnap = await getDocs(collection(db, 'users'));
  const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return {
    totalMembers: users.length,
    verifiedMembers: users.filter((u) => u.isVerified).length,
    pendingVerification: users.filter((u) => !u.isVerified).length,
    paidDues: users.filter((u) => u.dues?.status === 'paid').length,
  };
};

export const banMember = async (uid, reason, adminUid) => {
  await updateDoc(doc(db, 'users', uid), {
    isBanned: true,
    bannedReason: reason,
    bannedBy: adminUid,
    bannedAt: serverTimestamp(),
  });
};

// Re-export Firebase helpers for convenience
export {
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
};
