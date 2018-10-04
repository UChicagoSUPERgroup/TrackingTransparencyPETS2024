<p align="center">
  <img src="https://super.cs.uchicago.edu/UChicagoSUPERnotext.svg" alt="SUPERgroup" width="150">
</p>

# Tracking Transparency

<p>
  <a href="#"><img src="https://img.shields.io/badge/build-passing-blue.svg"></a>
  <a href="#"><img src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat"></a>
  <a href="#"><img src="https://img.shields.io/badge/contributors%20-9-lightgrey.svg"></a>
  <a href="#"><img src="https://img.shields.io/badge/dependencies%20-up%20to%20date-blue.svg"></a>
</p>

A browser extension to provide transparency about online tracking and the inferences companies make about your browsing in order to target advertisements and personalize your web experience.

<!-- TODO: include screenshot -->
<!-- ![screenshot](extension/icons/trackers.gif) -->

# Table of Contents

- [About](#about)
- [Running](#running)
- [License](#license)
- [Links](#links)

# About

A browser extension to provide information about online tracking.

# Running

- Install dependencies (run once and when any dependencies are changed):
  - OS X: `npm install`
  - Linux/Windows `npm install --no-optional`

- Build the code: `npm run build` 
- (Optional for development) Build using `npm run build:watch`. This runs Webpack in watch mode and automatically reruns whenever you change any files. Recommended to leave this running in a background terminal.

### Chrome

Recommended: run `npm run start:chromium` to start up a temporary Chromium instance in with the extension installed, and pre-seeded data.

Otherwise, to install to your normal chrome profile, do:

1. Visit `chrome://extensions` in your browser \(or open up the Chrome menu by clicking the icon to the far right of the window, and select **Extensions** under the **More Tools** menu to get to the same place\).
2. Ensure that the **Developer mode** toggle in the top right-hand corner is checked.
3. Click **Load unpacked extension…** to pop up a file-selection dialog.
4. Navigate to where the code is located on your computer, and select the `extension/` subdirectory.

Alternatively, you can drag and drop the directory where the extension files live onto `chrome://extensions` in your browser to load it.

### Firefox

1. Open `about:debugging` in Firefox, click **Load Temporary Add-on**.
2. Navigate to where the code is located on your computer, and select the `extension/manifest.json` file.

The extension will now be installed, and will stay installed until you close or restart Firefox.

# Testing

Run `npm test` to run automated tests that check end-to-end functionality.

Run `npm run start:chromium` to start up a temporary Chromium (Chrome) instance with the extension installed, and pre-seeded data.

Run `npm run start:firefox` to start up a temporary Firefox profile with the extension installed.

# Building for Production

Run `npm dist`. This runs webpack in production mode, minfies the files, and packs the code in a zip file in the `web-ext-artifacts/` folder. This can be installed in developer mode with the same procedure as above.

The built extension will not install easily in permanent non-developer mode - it will need to be uploaded to the browser's respective store and approved.

# License

GPL? (disconnect list is GPL)

# Links
