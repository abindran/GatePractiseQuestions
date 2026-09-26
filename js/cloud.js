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
  if (!ready || !db || !uid) return {};
  const snap = await getDoc(userDoc(uid));
  if (!snap.exists()) return {};
  const data = snap.data() || {};
  return data.progress && typeof data.progress === "object" ? data.progress : {};
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

/** Prefer solved over tried; keep newest timestamp on ties of same status. */
export function mergeProgress(local, cloud) {
  const out = { ...(local || {}) };
  for (const [id, entry] of Object.entries(cloud || {})) {
    if (!entry || !entry.status) continue;
    const cur = out[id];
    if (!cur) {
      out[id] = entry;
      continue;
    }
    if (cur.status === "solved" && entry.status !== "solved") continue;
    if (entry.status === "solved" && cur.status !== "solved") {
      out[id] = entry;
      continue;
    }
    const curAt = Date.parse(cur.at || 0) || 0;
    const newAt = Date.parse(entry.at || 0) || 0;
    if (newAt >= curAt) out[id] = entry;
  }
  return out;
}
