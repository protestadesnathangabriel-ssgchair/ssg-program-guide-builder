# SSG Program Guide Builder — Firebase migration scaffold

This is a **separate migration copy/prototype**, not a replacement for the currently working Apps Script app. Keep the current production deployment untouched until all features are migrated and tested.

## Included in this first step

- Static GitHub Pages-compatible site structure.
- Google Sign-In via Firebase Authentication.
- Email allowlist check for the three approved Google accounts; role permissions are also enforced by Firestore rules. No manually created `authorizedUsers/{uid}` documents are needed for this preview.
- Firestore Security Rules that deny access by default, limit access to the approved email addresses, and restrict guide deletion to the two admin accounts.
- A minimal guide editor and display using a Firestore real-time listener (`onSnapshot`). Changes saved by an operator should appear automatically in all connected windows/devices using the same `?guide=GUIDE_ID`.
- Separate display-only route: `?mode=display&guide=GUIDE_ID`; Host-style route: `?mode=host&guide=GUIDE_ID`.

## Firebase setup

1. In Firebase Authentication → Sign-in method, enable Google.
2. In Firebase Authentication → Settings → Authorized domains, add `protestadesnathangabriel-ssgchair.github.io`.
3. The web app configuration for project `ssg-program-guide-builder` is already filled into `src/firebase-config.js`.
4. In Firestore Database → Rules, replace the rules with the complete contents of the `firestore.rules` file in this ZIP, then click **Publish**.
5. The app and rules allow these verified Google accounts:
   - `protestadesnathangabriel.ssggov@gmail.com` — admin
   - `protestadesnathangabriel.udmshs@gmail.com` — admin backup
   - `studentcouncil.caloocan@laverdad.edu.ph` — operator
6. No `authorizedUsers` documents need to be created for this preview. The app checks the signed-in email, and Firestore rules independently enforce the same allowlist. Do not add client-side writes to security/allowlist data.
7. Upload the contents of this ZIP to the root of the public GitHub repository. Do not include the old Apps Script backend, access codes, private documents, or protected content in a public repository.

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

- `guides/{guideId}` — guide title/content/type and update metadata. The current demo stores the guide body as a string; production migration should preserve structured prompt/sequence fields and rich formatting rather than flattening them.
- Future `mediaIndex`, `lyrics`, and settings collections should be designed after auditing existing Apps Script functions and data formats.

## Recommended production safeguards

- Keep the production Apps Script app available as rollback until parity testing passes.
- Add schema validation and a migration/import script before bringing over real guides.
- Use a single shared guide/session identifier for all editor and display windows.
- Keep display-local timer, zoom, and presentation controls separate from guide content snapshots so text updates do not reset those controls.
- Add conflict detection (revision/version) if multiple operators may edit the same guide at once.
