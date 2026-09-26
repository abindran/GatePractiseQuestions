# GATE Practice Questions

Practice question bank for GATE CS topics. Questions are grouped by **subject** in `data/questions.json`.

Progress is stored in the browser by default. With Firebase enabled, Google sign-in syncs progress to the cloud.

## Current set

| Subject | Source | Questions |
|---------|--------|-----------|
| Digital Logic | GO Classes DLD `lecture-1.pdf`, `lecture-2.pdf` | 67 |

## Run locally

```bash
cd /Users/abindran-21221/PaxAutomata/GATE-Questions
python3 -m http.server 8080
```

Open http://localhost:8080

## Host for free (Firebase Hosting)

Your Firebase project is `gatepractisequestion`. Free Spark plan includes Hosting.

### One-time setup

1. In [Firebase Console](https://console.firebase.google.com/project/gatepractisequestion) enable:
   - **Authentication → Google**
   - **Firestore** (paste rules from `firestore.rules` and publish)
2. Install CLI and log in (one time on your machine):

```bash
npm install -g firebase-tools
firebase login
```

### Deploy

```bash
cd /Users/abindran-21221/PaxAutomata/GATE-Questions
firebase deploy --only hosting
```

Your live URL will look like:

`https://gatepractisequestion.web.app`

After deploy, in Firebase Console → **Authentication → Settings → Authorized domains**, confirm these are listed:

- `localhost`
- `gatepractisequestion.web.app`
- `gatepractisequestion.firebaseapp.com`

Redeploy anytime with the same `firebase deploy --only hosting` command.

## Cloud auth notes

Config lives in `js/firebase-config.js` (`cloudEnabled = true`). Guest mode still works with localStorage if you turn cloud off.

## Add more lectures

1. Drop or point to the next PDF/PPT.
2. Append questions under the matching `subjects[]` entry.
3. Refresh / redeploy — filters update automatically.
