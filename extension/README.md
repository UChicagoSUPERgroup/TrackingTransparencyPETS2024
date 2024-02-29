# Notes for the Reviewer

The notes here assume you are using the extension in a research project. All versions of this extension equal to or greater than 2.19 are not used for research purposes (though the codebase may be tuned for for that purpose again) and are only used for providing transparency to users. 

## Overview

This extension is part of a research project at the University of Chicago and the University of Maryland. Users will only install this extension after completing a consent process (Institutional Review Board approved) that explains all data collected. The extension was built to provide users with information about online tracking and advertising, with a focus on explaining what tracking-focused companies may have inferred about users based on browsing habits. 

The extension stores a *local* database with the pages the user visits, trackers and ads on those pages, and an inference about the page's topic using a client-side algorithm bundled as part of the extension. The extension also *locally* stores Google adsSettings data (https://adssettings.google.com/) fetched periodically.  This detailed data will not leave the users' computer and will not be shared with the researchers. The extension will however send non-identifiable metadata (i.e., anonymized information) and survey responses to the researchers. Non-Personally Identifiable Information is transmitted upon certain actions such as, but not limited to, opening the extension homepage or clicking on one of the extension's tabs. Additionally, at the end of the study, users will be provided with detailed instructions for uninstalling the  extension.

- The privacy policy is available at: https://super.cs.uchicago.edu/trackingtransparency/privacy.html
  - The privacy policy may also be found as a PDF in the extension's root directory

- Further information about how the extension was previously used may be found at: [Oh, the Places You've Been! User Reactions to Longitudinal Transparency About Third-Party Web Tracking and Inferencing](https://doi.org/10.1145/3319535.3363200)



## Permissions

The following section outlines the extension's permissions and the need for those permissions: 

-  `read and change all data on all websites`
  - The extension infers 'interest' topics based on webpage content. In order for our topic modeling algorithms to work, the extension must have permission to read and edit all data on all websites&mdash;the extension does not change any content, it does not act like an ad-blocker, it does not act like a content-blocker, the extension merely reads webpage content with a **goal of** **transparency**. Furthermore, the extension may use information found on websites to fetch certain types of content (e.g., advertisement explanation links, advertiser links, or Google adsSettings information). These actions are undertaken for the purpose of transparency; **no content is blocked by the extension**. 
- `display notifications`
  - The extension has a pop-up window which periodically displays information on how many pages a user has visited, how many trackers on those pages, and how many interests have been inferred from those pages. Additionally, notifications are used for the user-study aspect for which this extension was built (i.e., to act as a tool which gives researchers insights into a user's perspective of the tracking ecosystem). 
- `manage your apps, extensions, and themes`
  - The extension works best in a non-ad-blocker or non-tracker-blocker environment, because this perspective will provide the extension with the most accurate information about what is occurring during web browsing. However, users may have tools such as ad-blockers installed. The extension uses these permissions to assess performance despite these tools. 
- `manage your downloads` and `change your privacy-related settings`
  - These permissions are used by the extension for improvements such as feature development, bug identification and patching, and similar activities. 



## Architecture

Our extension has many dependencies, and we use the Webpack build system to manage dependencies and compile the code. We also use the [webextension polyfill](https://github.com/mozilla/webextension-polyfill) library to wrap extension API calls.

Below we explain some of the larger JavaScript files, unless otherwise noted all files are in the `dist/` subdirectory.

- `background.js` has listeners that are called on page loads and page change, and feeds the data to three web workers:
  - `trackers.worker.js` detects web trackers and stores to the database
  - `inferencing.worker.js` determines the page's topic and stores to the database
  - `database.worker.js` manages the database using Google's [Lovefield](https://github.com/google/lovefield) library

- `content.js` extracts the page content to send to the inferencing worker, and also injects a small overlay with information onto the current page

- `dashboard.js` and the contents of the `dist/dashboard` directory include a React web app. The only interaction that this has with the rest of the plugin is through functions (i.e., queries) that are called from the background page using `browser.runtime.getBackgroundPage`.

- The `data/` subdirectory includes a number of data files related to the extension's functions (e.g., webpage topic inferencing or the identification of known trackers).

- `lightbeam.js` provides another web page to interact with the data our extension collects.

- `popup.js` provides a popup, which is opened from the toolbar. It is also a React web app.

- `welcome.js` provides a welcome page, which is opened when the extension is first launched. It is also a React web app.

The files beginning with `vendors` are code for our third party dependencies. We provide a listing of our dependencies in `source/package.json`. The filenames for the vendor files indicate which scripts they are loaded by.

