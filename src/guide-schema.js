export const SCHEMA_VERSION = 2;
export const GUIDE_TYPES = Object.freeze({ FLOW: 'PROGRAM_FLOW', SEQUENCE: 'PROGRAM_SEQUENCE' });
const text = v => String(v ?? '').trim();
const makeId = prefix => `${prefix}_${crypto.randomUUID()}`;
export function normalizeGuide(input = {}) {
  const type = text(input.type).toUpperCase() === GUIDE_TYPES.SEQUENCE ? GUIDE_TYPES.SEQUENCE : GUIDE_TYPES.FLOW;
  return {
    schemaVersion: SCHEMA_VERSION,
    id: text(input.id), title: text(input.title) || 'Untitled Program Guide',
    eventDate: text(input.eventDate), venue: text(input.venue), organizersCallTime: text(input.organizersCallTime),
    formalStart: text(input.formalStart), mainBgm: text(input.mainBgm), fileLink: text(input.fileLink), type,
    hosts: Array.isArray(input.hosts) ? input.hosts.map(h => ({ name: text(h?.name), color: text(h?.color) || '#39ff14' })).filter(h => h.name) : [],
    sections: (Array.isArray(input.sections) ? input.sections : []).map((s, si) => ({
      id: text(s?.id) || makeId('SEC'), title: text(s?.title) || `Section ${si + 1}`,
      startTime: text(s?.startTime), endTime: text(s?.endTime), notes: text(s?.notes),
      items: (Array.isArray(s?.items) ? s.items : []).map((it, ii) => {
        const trt = text(it?.trt || it?.duration);
        return { id: text(it?.id) || makeId('ITM'), number: text(it?.number) || String(ii + 1), title: text(it?.title) || `Program Item ${ii + 1}`,
          startTime: text(it?.startTime), endTime: text(it?.endTime), trt, duration: trt, media: text(it?.media), mediaUrl: text(it?.mediaUrl),
          link: text(it?.link), participants: text(it?.participants), notes: text(it?.notes) };
      })
    }))
  };
}
export function createGuide(id, type = GUIDE_TYPES.FLOW) { return normalizeGuide({ id, title: 'New Program Guide', type, sections: [{ title: 'Opening', items: [{ title: 'Opening Remarks' }] }] }); }
export function validateGuide(guide) { const g = normalizeGuide(guide); const errors = []; if (!g.id) errors.push('Guide ID is required.'); if (!g.title.trim()) errors.push('Title is required.'); return { valid: !errors.length, errors, guide: g }; }
