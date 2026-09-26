import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { firebaseConfig, cloudEnabled } from "./firebase-config.js";

let app = null;
let auth = null;
let db = null;
let ready = false;

function configLooksValid() {
  return Boolean(
    cloudEnabled &&
      firebaseConfig?.apiKey &&
      firebaseConfig?.projectId &&
      firebaseConfig?.authDomain &&
      firebaseConfig?.appId
  );
}

export function isCloudConfigured() {
  return configLooksValid();
}

export function initCloud() {
  if (!configLooksValid()) {
    ready = false;
    return false;
  }
  if (ready) return true;
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  ready = true;
  return true;
}

export function watchAuth(callback) {
  if (!ready || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle() {
  if (!ready || !auth) throw new Error("Cloud auth is not configured.");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, provider);
}

export async function signOutUser() {
  if (!ready || !auth) return;
  await signOut(auth);
}

function userDoc(uid) {
  return doc(db, "users", uid);
}

export async function loadCloudProgress(uid) {
  if (!ready || !db || !uid) return { progress: {}, updatedAt: null };
  const snap = await getDoc(userDoc(uid));
  if (!snap.exists()) return { progress: {}, updatedAt: null };
  const data = snap.data() || {};
  const progress = data.progress && typeof data.progress === "object" ? data.progress : {};
  let updatedAt = null;
  if (data.updatedAt?.toDate) {
    updatedAt = data.updatedAt.toDate().toISOString();
  } else if (typeof data.updatedAt === "string") {
    updatedAt = data.updatedAt;
  }
  return { progress, updatedAt };
}

export async function saveCloudProgress(uid, progress) {
  if (!ready || !db || !uid) return;
  await setDoc(
    userDoc(uid),
    {
      progress,
      updatedAt: serverTimestamp(),
      email: auth?.currentUser?.email || null,
      displayName: auth?.currentUser?.displayName || null,
    },
    { merge: true }
  );
}

/**
 * Merge local + cloud progress.
 * Starts from cloud so deletions (topic/subject resets) are respected.
 * Local-only entries are kept only if newer than the last cloud write.
 */
export function mergeProgress(local, cloud, cloudUpdatedAt = null) {
  const cloudTime = cloudUpdatedAt ? Date.parse(cloudUpdatedAt) || 0 : 0;
  const out = { ...(cloud || {}) };

  for (const [id, entry] of Object.entries(local || {})) {
    if (!entry || !entry.status) continue;
    const localAt = Date.parse(entry.at || 0) || 0;
    const cur = out[id];

    if (!cur) {
      // Cloud deleted this key (or never had it). Keep local only if it's newer than cloud snapshot.
      if (!cloudTime || localAt > cloudTime) out[id] = entry;
      continue;
    }

    if (cur.status === "solved" && entry.status !== "solved") continue;
    if (entry.status === "solved" && cur.status !== "solved") {
      out[id] = entry;
      continue;
    }
    const curAt = Date.parse(cur.at || 0) || 0;
    if (localAt >= curAt) out[id] = entry;
  }
  return out;
}
