# Releasing

- `npm version patch` (or `major` or `minor`)
- `npm run dist`

## Firefox

*directions for self-hosting, will change when publish to addons.mozilla.org*

- go to `https://addons.mozilla.org/en-US/developers/` and upload and sign a new version
    - make sure to upload a zip with the source code when they give you a chance
- download the signed extension
- upload signed extension to server
- update `updates.json` on server to have latest version
