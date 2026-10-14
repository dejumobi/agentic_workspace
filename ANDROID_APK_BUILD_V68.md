# MofePlay V68 — Android build guidance

This is a mobile-responsive Cloudflare Pages/PWA deployment ZIP, **not an APK**.

1. Deploy the contents to your HTTPS domain and test on Android Chrome.
2. Verify the PWA manifest, HTTPS service worker, icons, and installability.
3. For Google Play, use Google's supported Trusted Web Activity workflow with Bubblewrap (Android SDK/JDK and Node.js required): https://github.com/GoogleChromeLabs/bubblewrap
4. Generate an Android project using `bubblewrap init --manifest https://mofeplay.com/manifest.webmanifest`, configure signing and app details, then `bubblewrap build`.
5. Host the Digital Asset Links file at `https://mofeplay.com/.well-known/assetlinks.json` for verified fullscreen TWA.
6. Test microphone permissions, sample playback, navigation, keyboard, back button, and screen widths 320/360/390/412 px on a physical Android device.
7. Upload the resulting Android App Bundle (.aab) to Play Console; do not upload this website ZIP as an APK.

Do not put signing keys, keystores or passwords in the Cloudflare Pages ZIP.
