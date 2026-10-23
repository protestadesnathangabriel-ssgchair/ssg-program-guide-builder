SSG PROGRAM GUIDE BUILDER — CORE EDITOR PACKAGE

GITHUB UPLOAD
1. Download this ZIP and extract it.
2. Open the extracted folder. Upload the CONTENTS (index.html, src folder, firestore.rules, docs, tests, package.json, this file) to the ROOT of your existing GitHub repository.
3. Commit to main. Do not upload the ZIP itself, and do not put the files inside an extra nested folder.

FIREBASE
The app uses the existing Firebase project. For live-draft cross-device sync, the Firestore rules in firestore.rules must also be reviewed and published in Firebase Console > Firestore Database > Rules. GitHub upload does not publish Firebase rules.

SCOPE LIMIT
This is the Core Editor milestone, NOT a full feature-parity replacement for the original Apps Script app. It supports nested Program Flow/Program Sequence editing, autosave, JSON export, and a basic live display. It does not yet include the original lyrics/media library, full presenter/control tools, timer, rich formatting, templates, and all export/share functions. Keep the original Apps Script app as production until those features are migrated and tested.

VALIDATION
Node syntax checks passed; 5 schema unit tests passed. Firebase live behavior was not tested against the live project from this package build.
