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

- Install dependencies (run once):
  - OS X: `npm install`
  - Linux/Windows `npm install --no-optional`

- Run webpack: `npm run watch` - this runs Webpack in watch mode and automatically reruns whenever you change any files. Recommended to leave this running in a background terminal.

### Chrome

 Visit `chrome://extensions` in your browser \(or open up the Chrome menu by clicking the icon to the far right of the window, and select **Extensions** under the **More Tools** menu to get to the same place\).

1.  Ensure that the **Developer mode** checkbox in the top right-hand corner is checked.

2.  Click **Load unpacked extension…** to pop up a file-selection dialog.

3.  Navigate to the directory in which your extension files live, and select it.

Alternatively, you can drag and drop the directory where your extension files live onto `chrome://extensions` in your browser to load it.

### Firefox

Run `npm run firefox` to start up a temporary Firefox profile with the extension installed.

Alternatively open `about:debugging` in Firefox, click **Load Temporary Add-on** and select any file in your extension's directory:

The extension will now be installed, and will stay until you restart Firefox.

## Building for Production

Run `npm dist`. This runs webpack in production mode, minfies the files, and packs the code in a zip file in the `web-ext-artifacts/` folder. This can be installed in the same procedure as above.

# License

GPL? (disconnect list is GPL)

# Links
