

# Artifact Appendix

Paper title: **What Does It Mean to Be Creepy? Responses to Visualizations of Personal Browsing Activity, Online Tracking, and Targeted Ads**

Artifacts HotCRP Id: **[#13](https://artifact.petsymposium.org/artifact2024.3/paper.php/13/edit#top)**

Requested Badge: **Available** 

## Description
A browser extension to provide transparency about online tracking. Unlike other privacy-focused tools (e.g., tracker blockers or ad blockers) the Tracking Transparency extension observes the activities of trackers and reports them back to you—using **machine learning** and other sophisticated techniques to provide you with a **Tracker's Perspective** of your online habits.  The extension was used in our user study to help investigate how people perceive the online tracking ecosystem. 

### Security/Privacy Issues and Ethical Concerns
None

## Basic Requirements
The general requirements to run the extension are: 

- Chrome browser 
- Specific *node* and *npm* versions
  - node (14.17.2) and npm (6.14.13)
- ~2GB of space on disk 
- Internet access 

### Hardware Requirements
Regarding hardware, there is one stronlgy preferred, though not strictly necessary, condition. 

- *A non-Apple silicone CPU*: we tested our extension with M1 macbooks and noticed a significant slowdown in processing. You will still be able to install and demo the extension with an Apple silicone computer, but the process may be limited 

### Software Requirements
You will be installing node packages via (`npm install`). 

### Estimated Time and Storage Consumption
Setup will take approximately 10-30 minutes (assume all steps are handled without error). There are approximatley 1GB of node packages to install. 

## Environment
In the following, describe how to access our artifact and all related and necessary data and software components.
Afterward, describe how to set up everything and how to verify that everything is set up correctly.

### Accessibility
https://github.com/UChicagoSUPERgroup/TrackingTransparencyPETS2024
*For repositories that evolve over time (e.g., Git Repositories ), specify a specific commit-id or tag to be evaluated.*
*In case your repository changes during the evaluation to address the reviewer's feedback, please provide an updated link (or commit-id / tag) in a comment.*


### Set up the environment
The following is ported from the repo readme. 

---

1. Clone the repo

```bash
git clone https://github.com/UChicagoSUPERgroup/TrackingTransparencyPETS2024.git
```

2. Install dependencies (run once and when any dependencies are changed):

```bash
npm install
```

3. Increase buffer size for inference model 

> [!ALERT]   > necessary step for extension inferencing to work!

---

- in `node_modules/dexie-export-import/dist/dexie-export-import.js`  make the following change: 
  - clarinet.MAX_BUFFER_LENGTH = 10 * 1024 * 1024; ==> clarinet.MAX_BUFFER_LENGTH = 1024 * 1024 * 1024; 
- in `node_modules/dexie-export-import/dist/dexie-export-import.mjs`  make the following change: 
  - clarinet.MAX_BUFFER_LENGTH = 10 * 1024 * 1024; ==> clarinet.MAX_BUFFER_LENGTH = 1024 * 1024 * 1024; 

---

4. use the correct node (14.17.2) and npm (6.14.13) version 

```bash
nvm use 14.17.2
sudo npm install npm@6.14.13 -g
```

5. Build the code

```bash
sudo npm run build
```

- (Optional for development) Build using `$ npm run build:watch`. This runs Webpack in watch mode and automatically reruns whenever you change any files. Recommended to leave this running in a background terminal.

### Extension (Chrome)

1. Visit `chrome://extensions` in your browser \(or open up the Chrome menu by clicking the icon to the far right of the window, and select **Extensions** under the **More Tools** menu to get to the same place\).

2. Ensure that the **Developer mode** toggle in the top right-hand corner is checked.

3. Click **Load unpacked** to pop up a file-selection dialog.

4. Navigate to where the code is located on your computer, and select the `extension/` subdirectory.

   - Alternatively, you can drag and drop the directory where the extension files live onto `chrome://extensions` in your browser to load it.

   - the folder from "load unpacked" will look like this:

```
.
├── README.md
├── dist/
├── icons/
├── lib/
├── lightbeam/
├── manifest.json
├── npm-debug.log
└── privacyPolicy.pdf
```

### Testing the Environment

If the environment is setup correctly, you should be able to see `[ Starting the Chrome Hot Plugin Reload Server... ]` in your terminal. The termial will be hanging, waiting for changes made to the extension. A good way to test this is to add or delete a comment in the `background.js` file (`src/background`), which should cause the Hot Plugin Reloader to re-load the extension. 

## Limitations
The extesion engaged in a large amount of setup tasks having to do with the survey component of the study (e.g., assigning participants into conditions, keeping track of participants in the first and second surveys, and sharing private telemetry data with researchers during the study). The setup for these tasks has been commented out of the artifact for several reasons. For one, a reproduction of this study would likely use a different server (i.e., where all telemetry information from participants would be sent). Additionally, future researchers may not be using qualtrics, the software we used to design the survey instrument and, therefore would not conduct participant validation in the same way (i.e., we used customized qualtrics code to validate participants). Lastly, The extension's use in the study had three conditions, but only the third condition—the one presented in this artifact—was the primary condition of interest. It is likely that other studies would have other conditions, requiring different underlying setup tasks. The takeaway on this limitation is that the results in the paper—largely driven by participant data—would be difficult to reproduce. Therefore, we provide the extension as a development tool that future researchers could build on (i.e., artifact **available**). 

## Notes on Reusability
The extension is able to collect real-time tracking information from web browsing. Most of this is summarized in JSON files printed out when a user asks for them (i.e., in the "debug" tab of the extension, entering the query `getAllData`). This type of information would be valuable to measurement studies or future work on user perceptions of online tracking. 

Moreover, the extension contains a machine learning model we developed that classifies text into ad categories. This tool (under development, if you would like access please contact trackingtransparency@gmail.com) is a shadow model of Google's content classification API (https://cloud.google.com/natural-language?hl=en). The tool may be used in many ways, but one way is to help measurement studies classify websites. For example, researchers may scrape the web, and make a statement like "this fingerprinting technique is mostly found on *shopping* websites like this [Nike shoes website](https://www.nike.com/w/alphafly-running-shoes-1tp17z37v7jzy7ok)" (as inferred by a service like SimilarWeb). That process would be vastly improved with a more fine-grained determination on the type of website this is:

```
/Shopping/Apparel/Footwear ==> Confidence: 1
/Sports/Individual Sports/Running & Walking ==> Confidence: 0.2492728
```

