# MOTIV.8 Content QA

## Purpose

Gate every weekly asset before it enters an approval package. QA is a stop condition, not a description added after delivery.

## Checks

### Manifest

- exactly 10 posts: 5 reels, 3 carousels, 2 graphics;
- week format is `YYYY-Www` and every post id begins with that week;
- every post has hypothesis, primary metric, version, assets, caption, CTA, and approval state.

### Editorial

- English is natural and concise;
- each asset has one clear idea;
- carousels teach a pattern, insight, and one action;
- statics are specific diagnostics or prompts, not quote cards;
- no shame, hustle, medical claims, unsupported claims, or copied book wording.

### Visual

- approved palette only, neutral-dominant;
- static posts use the approved warm-grey `#C9C6BE` by default; a beige static needs an explicit feed-rhythm reason;
- Instrument Sans / Inter roles preserved;
- 72px safe margins;
- one supporting graphic device per frame;
- imagery is documentary/editorial, with no direct eye contact or glossy stock look;
- no format labels or text baked into photos.

### Technical

- reels are playable MP4s at 1080x1920, 9:16, 7–15 seconds;
- carousels/statics are 1080x1350, 4:5;
- all referenced assets exist and are non-empty;
- audio is absent intentionally or contains a verified AAC stream.

## Decision rule

Any failed check means `Needs attention`. Do not mirror to Drive or include the asset in the approval package until corrected. Record the failed check, owner, revision, and new version.
