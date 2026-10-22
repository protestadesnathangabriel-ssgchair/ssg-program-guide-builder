# SSG Program Guide Builder — Firebase migration scaffold

This is a **separate migration copy/prototype**, not a replacement for the currently working Apps Script app. Keep the current production deployment untouched until all features are migrated and tested.

## Included in this first step

- Static GitHub Pages-compatible site structure.
- Google Sign-In via Firebase Authentication.
- Authorized-account allowlist check using `authorizedUsers/{uid}`.
- Firestore Security Rules that deny access by default and separate viewer from operator/admin roles.
- A minimal guide editor and display using a Firestore real-time listener (`onSnapshot`). Changes saved by an operator should appear automatically in all connected windows/devices using the same `?guide=GUIDE_ID`.
- Separate display-only route: `?mode=display&guide=GUIDE_ID`; Host-style route: `?mode=host&guide=GUIDE_ID`.

## Firebase setup

1. Create a Firebase project and register a Web App.
2. Enable **Authentication → Sign-in method → Google**.
3. Create the **Cloud Firestore** database.
4. The web app configuration for project `ssg-program-guide-builder` is already filled into `src/firebase-config.js`. If regenerating this scaffold, use the config from Firebase Console.
5. Publish `firestore.rules` in Firebase Console → Firestore Database → Rules.
6. In Authentication → Users, sign in once with each account that should be authorized. Copy each user's **UID**. You can create the initial admin record only after you have verified the correct UID for your own Google account.
7. In Firestore → Data, create `authorizedUsers/{UID}` documents manually from the Firebase Console (the document ID must exactly match that user’s UID), with fields such as:
   - `active`: `true` (boolean)
   - `role`: `admin`, `operator`, or `viewer` (string)
   - `email`: user's email (string, optional for reference)
8. Deploy these static files to a **public GitHub repository** if using GitHub Free Pages. Do not include the old Apps Script backend, access codes, private documents, or protected content in a public repository.
9. Serve through a local static server or GitHub Pages. ES modules may not work when opening `index.html` directly with `file://`.

## Test live sync

1. Sign in with an allowlisted operator account in one browser.
2. Open the same site in another window/device and sign in with an allowlisted account.
3. Use the same guide ID in both URLs, for example `?guide=tech-rehearsal`.
4. Edit and click **Save changes** in the operator window. The other window should update without refresh.
5. Confirm an unlisted account cannot read the guide and that a viewer cannot save changes.

## Free-tier notes

This scaffold uses Firebase Authentication and Cloud Firestore, not Cloud Functions or Firebase Storage. Review current Firebase quotas and billing requirements before production use. GitHub Free Pages generally requires a public repository; inspect every file before publishing.

## Important migration limitations

The existing SSG application uses `google.script.run` and Apps Script services for guide operations, media indexes, lyric data, and exports. This scaffold does **not** yet migrate those features or import existing guide records. The current app's rich formatting and layout must be connected to the Firestore data model in a later step. Do not treat this prototype as production-ready.

## Data model direction

- `authorizedUsers/{uid}` — administrator-managed allowlist and role.
- `guides/{guideId}` — guide title/content/type and update metadata. The current demo stores the guide body as a string; production migration should preserve structured prompt/sequence fields and rich formatting rather than flattening them.
- Future `mediaIndex`, `lyrics`, and settings collections should be designed after auditing existing Apps Script functions and data formats.

## Recommended production safeguards

- Keep the production Apps Script app available as rollback until parity testing passes.
- Add schema validation and a migration/import script before bringing over real guides.
- Use a single shared guide/session identifier for all editor and display windows.
- Keep display-local timer, zoom, and presentation controls separate from guide content snapshots so text updates do not reset those controls.
- Add conflict detection (revision/version) if multiple operators may edit the same guide at once.
