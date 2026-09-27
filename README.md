# GATE Practice Questions

Practice question bank for GATE CS topics. Questions are grouped by **subject** in `data/questions.json`.

Progress is stored in the browser by default. With Firebase enabled, Google sign-in syncs progress to the cloud.

## Current set

| Subject | Source | Questions |
|---------|--------|-----------|
| Digital Logic | GO Classes DLD `lecture-1.pdf`–`lecture-3.pdf`, `practise-1.pdf`, `practise-2.pdf`, `practise-4.pdf`, `practise-5.pdf` | 228 |

## Run locally

```bash
cd /Users/abindran-21221/PaxAutomata/GATE-Questions
python3 -m http.server 8080
```

Open http://localhost:8080

## Host for free (Firebase Hosting)

Your Firebase project is `gatepractisequestion`. Free Spark plan includes Hosting.

Live URL: **https://gatepractisequestion.web.app**

### One-time setup

1. In [Firebase Console](https://console.firebase.google.com/project/gatepractisequestion) enable:
   - **Authentication → Google**
   - **Firestore** (paste rules from `firestore.rules` and publish)
2. Install CLI and log in (one time on your machine):

```bash
npm install -g firebase-tools
firebase login
```

3. After deploy, under **Authentication → Settings → Authorized domains**, confirm:
   - `localhost`
   - `gatepractisequestion.web.app`
   - `gatepractisequestion.firebaseapp.com`

### Manual deploy

```bash
cd /Users/abindran-21221/PaxAutomata/GATE-Questions
firebase deploy --only hosting
```

### CI/CD (auto-deploy on push to `main`)

Workflow: `.github/workflows/firebase-hosting.yml`

**One-time GitHub secret** (required for Actions):

1. Open [Google Cloud Console → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts?project=gatepractisequestion)
2. **Create service account** (e.g. `github-hosting-deploy`)
3. Grant roles:
   - **Firebase Hosting Admin**
   - **Firebase Authentication Admin** (optional)
   - **Cloud Datastore User** / **Firebase Rules Admin** only if you later deploy rules from CI
4. **Keys → Add key → JSON** → download the JSON file
5. GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: paste the **entire** JSON file contents

After that, every push to `main` deploys automatically. You can also run it from the **Actions** tab → **Deploy to Firebase Hosting** → **Run workflow**.

Or let the Firebase CLI wire this up interactively:

```bash
firebase init hosting:github
```


## Cloud auth notes

Config lives in `js/firebase-config.js` (`cloudEnabled = true`). Guest mode still works with localStorage if you turn cloud off.

## Add more lectures

1. Drop or point to the next PDF/PPT.
2. Append questions under the matching `subjects[]` entry.
3. Refresh / redeploy — filters update automatically.
