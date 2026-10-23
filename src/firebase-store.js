import { collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import { normalizeGuide } from './guide-schema.js';
export function makeStore(db, user) {
  const guides = collection(db, 'guides');
  const idCheck = id => { const v = String(id || '').trim(); if (!v || v.includes('/')) throw new Error('Invalid guide ID.'); return v; };
  return {
    list: async () => { const s = await getDocs(query(guides, orderBy('updatedAt', 'desc'), limit(100))); return s.docs.map(d => normalizeGuide({ ...d.data(), id: d.id })); },
    get: async id => { const s = await getDoc(doc(db, 'guides', idCheck(id))); return s.exists() ? normalizeGuide({ ...s.data(), id: s.id }) : null; },
    save: async input => { const id = idCheck(input.id), ref = doc(db, 'guides', id), old = await getDoc(ref), guide = normalizeGuide({ ...input, id }); const oldCreatedAt = old.exists() ? old.data().createdAt : undefined; const createdAt = oldCreatedAt == null ? serverTimestamp() : oldCreatedAt; await setDoc(ref, { ...guide, createdAt, updatedAt: serverTimestamp(), updatedBy: user.uid, updatedByEmail: String(user.email || '').toLowerCase() }); return guide; },
    remove: async id => deleteDoc(doc(db, 'guides', idCheck(id))),
    watch: (id, next, error) => onSnapshot(doc(db, 'guides', idCheck(id)), s => next(s.exists() ? normalizeGuide({ ...s.data(), id: s.id }) : null), error),
    publishDraft: async input => { const id = idCheck(input.id); await setDoc(doc(db, 'liveDrafts', id), { ...normalizeGuide({ ...input, id }), draftUpdatedAt: serverTimestamp(), updatedBy: user.uid, updatedByEmail: user.email.toLowerCase() }); },
    watchDraft: (id, next, error) => onSnapshot(doc(db, 'liveDrafts', idCheck(id)), s => next(s.exists() ? normalizeGuide({ ...s.data(), id: s.id }) : null), error)
  };
}
