# Releasing

The extension can be uploaded to the Chrome Web Store, but it must be packaged before that can happen. Please first update the patch number in the manifest and packages

- edit extension/`manifest.json` and `package-lock.json` and `package.json` for the right version number

Then run

- `npm run dist`

To create a zip file in the `web-ext-artifacts` folder. This is the file you will upload to the Chrome Web Store, along with listing the other information on the Chrome Web Store for evaluation. 



Chrome will conduct an automated review of the extension and let you know of any errors. The current extension lives at: https://chromewebstore.google.com/detail/tracking-transparency/jeoddidpffcjecfojbjpjnjnbjeenhai
