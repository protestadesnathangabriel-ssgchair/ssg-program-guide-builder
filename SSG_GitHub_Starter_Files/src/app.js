import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { getFirestore, doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const displayOnly = params.get('mode') === 'display' || params.get('mode') === 'host';
const guideId = params.get('guide') || 'migration-demo';
const configured = firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('REPLACE_') && firebaseConfig.projectId && !firebaseConfig.projectId.startsWith('REPLACE_');
let auth, db, currentUser, currentRole = '', stopGuideListener = null, latestGuide = null;
let saveInFlight = false;

function message(text, tone='') {
  $('authMessage').textContent = text;
  $('syncStatus').textContent = text;
  $('syncStatus').style.color = tone === 'error' ? '#ff9c9c' : tone === 'good' ? 'var(--good)' : 'var(--muted)';
}
function showSignedInUI(user, role) {
  $('signInCard').classList.add('hidden');
  $('appPanel').classList.remove('hidden');
  $('authStatus').textContent = `${user.email || user.displayName || 'Signed in'} · ${role}`;
  $('editorPanel').classList.toggle('hidden', displayOnly || !['admin','operator'].includes(role));
  if (displayOnly) document.body.classList.add('display-only');
}
function failAuth(text) {
  $('signInCard').classList.remove('hidden');
  $('appPanel').classList.add('hidden');
  $('authStatus').textContent = 'Access not granted';
  $('authMessage').textContent = text;
}
function renderGuide(data) {
  latestGuide = data;
  $('guideTitle').textContent = data?.title || 'Live guide preview';
  $('displayTitle').textContent = data?.title || 'No guide selected';
  $('displayContent').textContent = data?.content || 'No guide content yet.';
  if (document.activeElement !== $('titleInput')) $('titleInput').value = data?.title || '';
  if (document.activeElement !== $('contentInput')) $('contentInput').value = data?.content || '';
  message(`Live · guide ${guideId} · last update ${data?.updatedAt?.toDate ? data.updatedAt.toDate().toLocaleTimeString() : 'available'}`, 'good');
}
async function startGuideListener() {
  if (stopGuideListener) stopGuideListener();
  const ref = doc(db, 'guides', guideId);
  stopGuideListener = onSnapshot(ref, snap => {
    if (snap.exists()) renderGuide(snap.data());
    else {
      latestGuide = null;
      renderGuide({title:'New program guide',content:'This guide is not created yet. An authorized operator can enter content and save it.'});
      message(`Connected · no saved guide exists yet (${guideId})`, 'good');
    }
  }, err => {
    console.error('Guide listener error:', err);
    message('Live sync error. Check connection and Firestore permissions.', 'error');
  });
}
async function saveGuide() {
  if (!currentUser || !['admin','operator'].includes(currentRole) || saveInFlight) return;
  saveInFlight = true;
  $('saveButton').disabled = true;
  $('saveState').textContent = 'Saving…';
  try {
    const title = $('titleInput').value.trim().slice(0,180) || 'Untitled guide';
    const content = $('contentInput').value;
    await setDoc(doc(db,'guides',guideId), {
      title, content, type: 'PROGRAM_FLOW', schemaVersion: 1,
      updatedAt: serverTimestamp(), updatedBy: currentUser.uid
    });
    $('saveState').textContent = 'Saved';
  } catch (err) {
    console.error('Save failed:', err);
    $('saveState').textContent = 'Save failed — check permissions and connection.';
  } finally {
    saveInFlight = false;
    $('saveButton').disabled = false;
  }
}

if (!configured) {
  $('signInButton').disabled = true;
  failAuth('Setup not complete: edit src/firebase-config.js with your Firebase web app configuration first.');
  $('authStatus').textContent = 'Setup required';
} else {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  $('signInButton').addEventListener('click', async () => {
    $('signInButton').disabled = true;
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (err) { failAuth(err.message || 'Google Sign-In failed.'); }
    finally { $('signInButton').disabled = false; }
  });
  $('signOutButton').addEventListener('click', () => signOut(auth));
  $('saveButton').addEventListener('click', saveGuide);
  onAuthStateChanged(auth, async user => {
    currentUser = user;
    if (!user) {
      if (stopGuideListener) stopGuideListener();
      failAuth('Sign in with an authorized Google account to continue.');
      return;
    }
    try {
      const allowRef = doc(db, 'authorizedUsers', user.uid);
      const allowSnap = await getDoc(allowRef);
      if (!allowSnap.exists() || allowSnap.data().active !== true) {
        await signOut(auth);
        failAuth('This Google account is not on the authorized SSG allowlist. Ask an administrator to authorize it.');
        return;
      }
      currentRole = allowSnap.data().role || 'viewer';
      showSignedInUI(user, currentRole);
      await startGuideListener();
    } catch (err) {
      console.error('Authorization check failed:', err);
      failAuth('Could not verify account access. Check Firestore setup and Security Rules.');
    }
  });
}
