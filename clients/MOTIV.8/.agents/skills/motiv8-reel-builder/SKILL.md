---
name: motiv8-reel-builder
description: Create, storyboard, render, QA, and deliver approved MOTIV.8 Instagram Reels using the approved editorial visual system. Use for weekly Reel production, including calm typography motion, animated stills, natural video backgrounds, and approved music.
---

# MOTIV.8 Reel Builder

## Purpose

Create practical, calm, editorial MOTIV.8 Reels that turn overload into clarity and frame flexible progress as a capability rather than a failure.

## Required context

Before planning or producing a Reel, read:

- `README.md`
- `client-context/project-handoff.md`
- `client-context/product-context.md`
- `client-context/content-strategy-context.md`
- `client-context/visual-style.md`
- `design-validation/visual-system-v3.md`
- `design-validation/design-tokens.json`
- `content-agent/weekly/2026-W36/review/pilot-visual-direction-v3.md`

Use the newest approved project references when they supersede these files.

## Approval workflow

Every Reel must have a concise storyboard before production. The storyboard includes:

- working title and strategic role;
- exact on-screen copy and timing;
- background asset or image-to-video treatment;
- text animation and transition plan;
- music plan, including whether a supplied or approved track is used;
- duration, format, and QA risks.

The weekly content agent may produce review renders before approval. It may produce final assets only for approved items. Save review renders locally in `previews`; save final renders only after approval. Do not publish rejected or undecided items.

## Production defaults

- Output: review MP4, 1080x1920, 9:16, 7–15 seconds.
- Duration: choose what the teaching needs, up to 30 seconds by default; do not pad a short idea unnecessarily.
- Background: use a clean typographic/diagram Reel when no image adds meaning. If imagery is used, change the visual treatment only when the new scene clarifies the next step; never loop the same still merely to fill time.
- People: side, back, or partial view; never direct eye contact.
- Motion: slow zoom, pan, parallax, depth, light movement, soft reveal, or route-line change.
- Keep motion calm and purposeful. Avoid bounce, aggressive kinetic typography, hard motivational cuts, and decorative overload.
- Use generous negative space, safe margins, clean typography, and one semantic accent at a time.
- Use the approved Drive reference folder `1RboGd2NROnQxfJgcKaWay7qVd1zQQO8H` as the visual authority before creating review renders.
- Reels use clean full-frame backgrounds rather than inset cards or frames. Do not add a watermark, temporary product name, or page counter.
- Display copy must be large and deliberately line-broken; shorten copy rather than shrinking it below the scale demonstrated in the approved Plan B Reel.
- A photo-led Reel must place the display copy directly over the full-frame editorial photograph, with only a restrained ink/charcoal gradient or overlay for contrast. It is invalid to submit coloured placeholder frames when the storyboard calls for photography.
- Match the approved centred display composition: large light/regular type, a thin forest-green underline, then a small supporting line where needed. Verify the real font is loaded; do not fall back to Arial.
- A review Reel template is invalid unless it contains both the visible text nodes and a registered paused GSAP timeline that animates their progressive entrance and exit.
- Treat the approved Plan B Reel as the motion reference. The background must feel continuous; use one gentle camera move across the full duration, rather than restarting a zoom or fade for each text beat. Interest comes from progressive text entrances, not slide-to-slide effects.
- The text block stays centred on every beat. Use the approved Instrument Sans Regular face for every beat and retain the same display scale across the Reel; wrap long copy to two lines instead of making one beat smaller.
- Animate only what belongs in the photograph. For a room with a window and greenery, a slow leaf-shadow/light shift can imply a breeze; for another scene, use that scene's own credible movement. Never insert curtains, abstract overlays, or an unrelated prop merely to create motion.
- Use a brief overlap between exiting and entering copy so there is no empty/jump frame. Do not use hard cuts, cross-slide wipes, per-beat camera resets, or choppy animation as a substitute for a calm reveal.
- The approval folder must include a visible Reel proof: an MP4 review render and/or named keyframe PNGs at the important text beats. Source HTML alone is not a Reel sketch.

## Text motion

Choose the simplest treatment that improves comprehension. Available treatments include fade/reveal, soft slide, underline, controlled color emphasis, progressive line reveal, and typewriter.

Use typewriter selectively: it is suitable for a thought forming or a sentence being built, but should not be the default for every line. Never sacrifice readability for animation. Reveal information progressively: the first frame carries the hook, then each subsequent beat introduces only its new instruction. Do not leave the full script visible throughout the Reel. Use at most two text-motion ideas in one Reel.

If a word is specified for emphasis, color only that word using an approved token. Do not invent new brand colors. Approved palette: background `#FAF6EF`, surface `#FFFDF9`, sand `#EAD8C4`, border `#E5D8CB`, ink `#302C28`, forest `#356A55`, terracotta `#C85F42`, gold `#D8A62B`, teal `#3C7F79`, plum `#8B586A`.

## Image-to-video

Image-to-video is allowed when it adds a natural editorial camera feeling: slow push-in, lateral drift, subtle parallax, depth separation, or changing light. Preserve the original subject, composition, and brand treatment. Avoid obvious AI warping, facial changes, invented text, or artificial action. A static image remains preferable when movement adds no meaning.

### Fal image-to-video pipeline

For a photo-led MOTIV.8 Reel where background motion matters, use an image-to-video provider such as Fal as a separate **background-generation stage**. Fal generates the moving scene; HyperFrames (or the approved compositor) adds the typography afterward. Never ask an image-to-video model to render the Reel's on-screen copy.

1. Write the storyboard first: exact copy beats, one background concept, motion intent, and text-safe central area. Use one continuous animated clip for a short Reel unless a genuine change of scene improves the teaching.
2. Create or source a clean 9:16 background still with no baked text, frames, logos, or UI. Keep the subject away from the centred text-safe area. Record source, rights state, and the image prompt in the asset ledger.
3. Write a scene-specific motion prompt. State: the subject's permitted action, environmental movement, camera behaviour, lighting, mood, and what must remain unchanged. Example structure: `A calm interior with a person writing quietly. Their hand makes small natural movements; window light and nearby leaves shift softly in a breeze. Locked composition, subtle continuous camera push-in, natural pacing. Preserve identity, clothing, room geometry and empty central text-safe area. No cuts, no new objects, no text.`
4. Submit the still and motion prompt to the configured server-side Fal image-to-video model. At the time of writing, `fal-ai/wan-pro/image-to-video` is a suitable candidate for a six-second 1080p, 30fps background, but select the configured commercial endpoint only after verifying its current Fal schema, duration, rights, cost, and aspect-ratio support. Store `FAL_KEY` only as a host secret; never put it in HTML, source files, a Drive file, a prompt, or a log.
5. Treat the generation as asynchronous: upload the still through provider storage, submit to the queue, record request ID/model/version/seed/input-image checksum/prompt/output URL in the ledger, then use a webhook or bounded status polling to retrieve the result. Do not block a weekly run indefinitely. One transient retry is permitted; otherwise mark the Reel `Needs attention` with the exact provider error.
6. Inspect the raw generated clip before compositing. Reject and regenerate (maximum two additional candidates) if it has a jump, face/hand/identity distortion, geometry warp, unexpected object, unwanted text, camera reset, irrelevant movement, or insufficient empty contrast behind the future text. For a person, permit only a credible low-amplitude action already implied by the still; never create speaking, lip-sync, personality claims, or an action that changes the meaning of the scene.
7. Normalize the accepted raw clip to the composition's exact 1080x1920, 30fps delivery format. Place it as one continuous background layer, then add progressive centred Instrument Sans text with brief overlap between beats. The typography must not drive cuts or restart the background camera move.

If `FAL_KEY`, a commercially usable model, a safe source image, or a QA-passing result is unavailable, mark the Reel `Needs attention`. Do not silently substitute a choppy canvas animation when the approved storyboard requires image-led motion.

Before adopting a model for weekly automation, run a small calibration set of three representative MOTIV.8 scenes (environment-only, person-at-work, and window/nature). Approve a model only when each result is smooth, composition-preserving, brand-appropriate, and economically viable. Re-run this calibration whenever the model or its version changes.

## Music

Music is optional. Add it only when a real supplied or explicitly approved audio file exists. Prefer minimal ambient, soft piano, restrained organic texture, or similarly calm instrumental music with no vocals unless approved.

Never use placeholder sine tones or an unmusical synthetic drone as a substitute for a music track. If no approved music exists, deliver the Reel without audio. When music is used, apply a gentle fade-in/out, keep it below the copy's attention level, preserve the full Reel duration, and verify the final MP4 contains an AAC audio stream.

## QA and delivery

Before delivery, verify:

- exact approved copy, spelling, punctuation, and emphasis;
- readable contrast and safe margins;
- correct 9:16 dimensions and requested duration;
- final MP4 has both `r_frame_rate` and `avg_frame_rate` at 30fps (normally `30/1`), verified with `ffprobe` after final encoding; do not treat a requested capture rate as proof of playback frame rate;
- for provider-generated backgrounds: the ledger contains the source/right status, image prompt, motion prompt, provider/model/version, request ID, output URL, and raw-clip QA decision; the API key is absent from all artifacts;
- no direct eye contact or unwanted AI artifacts;
- motion is visible but restrained;
- only approved palette colors are used;
- audio is either intentionally absent or present as a verified audio stream;
- MP4 is non-empty and playable.
- the Reel teaches a complete, specific action rather than naming a vague concept.
- each beat adds a new instruction, example, or decision; no repeated background or full-text screen persists without a comprehension reason.
- the render is visually compared with the approved Drive reference: no default frame, small type, watermark, or unapproved navigation chrome.
- The active text block must be vertically centred in the 9:16 frame at every reveal beat, not only on the final beat. Snapshot each beat to verify this before upload.
- Sample every text beat from the final MP4 before upload. Reject the render if text is clipped, differs in typeface/weight from the approved reference, contains literal escape characters, or changes display size without a documented hierarchy.
- Inspect the actual final encoded MP4, not an HTML preview or raw recorder file. Reject it if playback stutters, any text beat is smaller without an approved hierarchy reason, or the background move visibly restarts between beats.
- For image-to-video Reels, inspect the raw animation and the composited final separately. A technically smooth final is still a failure if the raw clip contains unmotivated movement, visual drift, identity changes, or model-generated text.

Save source files in `sources`, working compositions in the Reel folder, review MP4s in `previews`, and approved final renders in `final`. Upload only QA-passed review assets to the configured Google Drive approval folder. Do not email an approval request or create an Asana approval task until its preview, caption, CTA, QA result, and Drive link are all present.
