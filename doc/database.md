# Database Structure 

The data generated by our browser extension is stored in a relational database running locally in the browser, which allows us to store detailed information and run arbitrary queries, such as “categorical inferences a specific tracker has made about a user in the past day”. The database uses Google's Lovefield library, which provides a relational database using IndexedDB in the browser. In order to minimize data redundancy and ensure referential integrity, our schema conforms to third normal form. We use three database tables: a table with one row per page visit, a table with one row per tracker, and a table with one row per inference made. All tables use the page visit identifier to link the tables with foreign keys.

On each main frame page visit, we create a unique identifier for that visit, which we then use to associate with the tracker records and (when fully implemented) inferences. We then write a row to the page visit table with information about the page's URL and title, as in Table 1:

Table: Database table for pages

**Page ID**  **Domain**             **Path**  **Title**    **Time**              **TODO ADD NEW COLUMNS**
-----------  --------------------   --------  ------------ --------------------- ------------------------
`1499275955` `www.dictionary.com`   `/`       `Dictionary` `2017-07-05 17:32:35`

For each tracker detected (described in section 2.2.3), we create a new row in the trackers table with a record of the tracker, as in Table 2:

Table: Database table for trackers

**Page ID**  **Tracker Domain**
------------ ----------------------
`1499275955`  `doubleclick.net`
`1499275955`  `google-analytics.com`
`1499275955`  `yahoo.com`


When we are able to infer ad-interest categories from page content, we plan on storing the data in a database table as in Table 3. We are currently using simulated inferences to allow us to build the full functionality of the extension, while we continue to work towards determining a way to infer a page's ad interest category from the page content.

Table: Database table for inferences

**Page ID**  **Inferred Ad Interest Category**  
-----------  ----------------------------------	
`1499275955` `Dictionaries & Encyclopedias`