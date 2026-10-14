# MofePlay V51 — account identity and previous lessons

Deploy to the existing Cloudflare project. Keep all monthly/yearly price variables and Stripe secrets unchanged. No migration is required.

All main pages show a shared top bar. Account links directly to /account; a signed-in user sees their server-confirmed name next to Account and Sign out. Owner-only studio/portal links remain available. Sign out calls the existing session-revocation endpoint and returns to the account sign-in page; a failed sign-out shows an error and does not pretend to succeed.

PianoWorx and GuitarWorx lesson studios provide Previous lesson, a lesson picker, Next lesson and All lessons. Their lesson lists follow the active lesson level; earlier completed lessons can be revisited. SaxWorx lesson pages have the same controls. Navigation opens a lesson without awarding completion or resetting recorded progress. Existing stop/lesson-opening routines remain responsible for stopping the preceding practice session. At the beginning/end of a list the appropriate arrow is disabled.

CAD $7 monthly / CAD $70 yearly plans, card-free trials, owner navigation, video fixes, support, terms and groove rehearsal remain.
