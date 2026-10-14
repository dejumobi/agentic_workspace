# MofePlay V49

Deploy this package to the existing Cloudflare project. Keep the existing live secret key, webhook and CAD $7 price IDs. No new environment variables or database migration are needed.

Owner portal: owner-only navigation on SaxWorx, PianoWorx, GuitarWorx and both owner editors. Owner portal link returns to /admin. Access is still protected server-side. Support & feedback tab contains support requests and replies.

Video references: new references default to Publish, with an explicit option to save a draft. Existing drafts remain drafts. Piano Reload lesson video now fetches the server’s latest references. Focus and cross-tab refresh pick up saved changes. The Introduction catalog includes keys, hands and seat/posture video slots. The editor links to the selected piano lesson. Select the precise lesson and publish it; creator embedding restrictions can still prevent playback. Original finger-placement video remains the fallback when no custom introduction video is published.

Guitar footer: voice controls moved into collapsed Practice settings & spoken guidance. Branded footer includes help and terms links.

Piano groove rehearsal: five feels, key selection, bass and optional chord backing, volume, editable 16-step kick/snare/hi-hat pattern, save/load on the current device, moving lesson notes and beat cues. Uses original synthesized backing. Rehearsal does not grade or complete tasks. Stop, navigation and microphone assessment stop the backing.

Help & support: /contact-support.html lets signed-in members submit private requests, receive confirmation with request ID, and read owner replies. The owner responds in Support & feedback. No email notification is claimed or sent. /support.html remains the separate optional financial contribution page.

Terms: branded MofePlay learning, detection, safe practice, third-party content, subscriptions, billing requests and qualified liability disclaimer. Statutory rights remain intact. Designed for MofePlay footer credit. New registration form includes a required terms checkbox. Have the final terms reviewed by counsel for the actual business entity and operating practices; disclaimers do not guarantee protection from claims. Source for preservation of consumer rights: https://www.alberta.ca/consumer-bill-of-rights .

Validation: JavaScript syntax checks and DOM integration checks for piano startup, managed video replacement/reload, groove start/stop/save/load, owner return link, support confirmation/history/replies and guitar footer controls. Playback was exercised with a mocked audio context; no live microphone, external YouTube playback or real payment was tested. A browser binary was unavailable in this environment, so actual browser/device playback needs a deployment check.
