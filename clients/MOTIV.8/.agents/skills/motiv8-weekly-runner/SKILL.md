---
name: motiv8-weekly-runner
description: "Run the complete MOTIV.8 weekly approval-package workflow: plan, produce review assets, QA, Drive, Asana, and approval email. Use for a manual or scheduled weekly content run; never publish to Instagram."
---

# MOTIV.8 Weekly Runner

## Outcome

Produce one approval package containing exactly 5 substantial items. Select formats for the teaching need rather than filling a format quota; a typical mix is 2 Reels, 2 practical carousels, and 1 static post. The package is either approval-ready or explicitly `Needs attention`; a partial package must never be presented as ready. Thursday's scheduled production time is 09:00 Israel time.

## Required sources

Read `README.md`, all `client-context/*.md`, `weekly-content-workflow.md`, `visual-qa-checklist.md`, `design-validation/visual-system-v3.md`, `design-validation/design-tokens.json`, and the relevant builder skills before production.

## Run sequence

1. Create `content-agent/weekly/YYYY-Www/` using `scripts/create-week.ps1`.
2. Scan prior weekly manifests and the approved content archive for duplicate titles, hooks, and substantially identical teaching mechanisms. Replace a duplicate before the package is produced.
3. Confirm the manifest validates and every id starts with the same `YYYY-Www` value.
4. Write briefs, English copy, a source ledger, and storyboards before asset generation.
5. Produce review assets: Reels as 1080x1920 30fps MP4s and carousels/statics as complete 1080x1350 slide sets. A carousel must show every individual slide, never a contact sheet standing in for its deliverable. Use the approved MOTIV.8 visual system: centred Instrument Sans Regular text, clean full-bleed beige or approved warm-grey ground, no border/frame/top title/temp brand/page number, and restrained consistent accents. Do not reuse a visual merely to make a Reel feel populated; clean typography/diagram Reels are valid. Record every reused or generated image in the ledger.
6. Upload review previews to the weekly Google Drive folder, with `briefs`, `copy`, `previews`, `sources`, `qa`, and `final` areas. The preview is the review surface; never ask for approval based on copy or HTML source alone.
7. Run manifest, copy, visual, and technical QA. Check each slide against its approved copy block and the approved reference: all text centred and safely within frame, no fallback/bold font, no redundant punctuation or decorative rule, and every carousel slide adds a distinct practical contribution. For every final Reel sample each text beat and use `ffprobe` to confirm 1080x1920, non-empty, playable and 30fps in both reported frame-rate fields. A failed item stays `Needs attention`, but its preview can remain visible in Drive with the failure noted.
8. Create/update matching Asana approval tasks with preview, caption, CTA, QA status, Drive link, and a Drive-comments link. Set every new item to `Needs review`. Drive comments are the source of truth for creative feedback; Asana records the decision and owner.
9. Send one Gmail approval email to the configured recipient only when the Drive folder, at least one preview, and all included links are verified. The email must identify any `Needs attention` items clearly.
10. Never publish to Instagram. Final production files are created only after item-level approval.

## Revision loop

- Maintain an item manifest mapping each Asana task to its exact Drive previews, copy block, source files, and final export. This mapping is required before the approval email is sent.
- A scheduled monitor checks current-week approval tasks. `Approved` means confirm the matching approved export is in `final` and leave it unchanged; never regenerate that item. `Changes requested` means read all unresolved comments on its linked Drive creative files, revise only the affected item/files, run visual and technical QA, replace raw preview bytes in place so existing Drive file IDs and comment threads survive, reply/resolve the addressed comments, then set the task back to `Needs review`.
- Do not make a new weekly folder, duplicate a task, or regenerate unrelated content during a revision. Send a revision email to `support@sistermarketing.co.il` and `social@sistermarketing.co.il` only after at least one verified changed preview is uploaded. Never publish to Instagram.
- If Asana status or Drive comments cannot be read, mark the task `Needs attention`; never guess an approval or feedback state.

## Stop conditions

- Missing assets, failed QA, unavailable Drive/Asana/Gmail, or unverified links → mark the affected item or integration `Needs attention` and report the exact blocker.
- Do not retry external writes indefinitely. One retry is allowed for a transient provider failure; then stop and report.
