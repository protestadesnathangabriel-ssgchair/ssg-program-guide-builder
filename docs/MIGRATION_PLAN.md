# Migration plan

1. **Foundation (scaffold created):** Firebase Google Sign-In, allowlist, deny-by-default Firestore rules, real-time guide prototype.
2. **Audit and data mapping:** enumerate existing Apps Script functions, guide schema, permissions, MCGI media/lyrics indexes, export flows, and all display controls.
3. **Guide CRUD:** replace `google.script.run` calls for list/load/save/duplicate/delete with Firestore services while preserving the current UI and rich content structure.
4. **Live sync:** subscribe editor, Window Display, and Host View to the selected guide/session. Apply content updates without reinitializing timers, zoom, or other local display state. Add save status and revision conflict handling.
5. **Media and lyrics:** migrate searchable indexes and lyric state in batches; retain existing Google Drive media URLs where appropriate. Do not depend on Firebase Storage for a strict zero-cost plan.
6. **Exports:** replace Apps Script Document/Drive exports with browser-side formats where feasible; document any feature that still requires a server-side service.
7. **QA:** test phone/tablet/laptop/projector, reconnects, multiple open windows, access denial, role restrictions, long guides, 300% Host View zoom, and scroll behavior.
8. **Cutover:** only after parity tests and backup, publish the new site and keep rollback instructions.
