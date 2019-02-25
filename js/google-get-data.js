// Client ID and API key from the Developer Console
var CLIENT_ID = '598632370308-5bkqsjrdccntbhreit2m5vkqukqtbm6a.apps.googleusercontent.com';
var API_KEY = 'AIzaSyAjBGE1vcHLS5-MUOAACWlxJ-NwoGBOJb4';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

var VISITS_SP_ID = "1PAKK5dKgh9xtMi8y2nGDTk5G0kPOD-ng5NtqHGnenMg";
var VISITS_RANGE ="Visits!A1:I";

var SITES_SP_ID = "1qaqnlIVQ-NOzewc8ID3kgYei8plZpPOUzuXnLRAmObs";
var SITES_RANGE ="Sites!A2:B";

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');

var downloadVisitsDataButton = document.getElementById('download_visits_data');
var clearVisitsDataButton = document.getElementById('clear_visits_data');
var downloadSitesDataButton = document.getElementById('download_sites_data');
var clearSitesDataButton = document.getElementById('clear_sites_data');

var consoleLogVisitsButton = document.getElementById('console_log_visits');
var consoleLogSitesButton = document.getElementById('console_log_sites');

var generateVisitsSummaryButton = document.getElementById('generate_visits_summary');
var printVisitsSummaryButton = document.getElementById('print_visits_summary');
var printDailyReportsButton = document.getElementById('print_daily_reports');

$(document).ready(function(){
    var d = new Date();
    $("#month_input").val(d.getMonth());
    bindButtons();
});

/**
*  On load, called to load the auth2 library and API client library.
*/
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

/**
*  Initializes the API client library and sets up sign-in state
*  listeners.
*/
function initClient() {
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).then(function () {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

      // Handle the initial sign-in state.
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      authorizeButton.onclick = handleAuthClick;
      signoutButton.onclick = handleSignoutClick;
      // Bind app buttons at this stage    
      bindButtons();
      
    }, function(error) {
      appendPre(JSON.stringify(error, null, 2));
    });
}

/**
*  Called when the signed in status changes, to update the UI
*  appropriately. After a sign-in, the API is called.
*/
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
      authorizeButton.style.display = 'none';
      signoutButton.style.display = 'block';
    } else {
      authorizeButton.style.display = 'block';
      signoutButton.style.display = 'none';
    }
}

/**
*  Sign in the user upon button click.
*/
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
*  Sign out the user upon button click.
*/
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

/**
* Append a pre element to the body containing the given message
* as its text node. Used to display the results of the API call.
*/
function appendPre(message) {
    var pre = document.getElementById('content');
    var d = new Date();
    var time = d.getMinutes() + " " + d.getSeconds() + " ";
    var textContent = document.createTextNode(time + message + '\n');
    pre.appendChild(textContent);
}

function bindButtons(){
    downloadVisitsDataButton.onclick = handleDownloadVisitsDataClick;
    clearVisitsDataButton.onclick = handleClearVisitsDataClick;
    downloadSitesDataButton.onclick = handleDownloadSitesDataClick;
    clearSitesDataButton.onclick = handleClearSitesDataClick;    
    
    consoleLogVisitsButton.onclick = handleConsoleLogVisitsClick;
    consoleLogSitesButton.onclick = handleConsoleLogSitesClick;
    
    generateVisitsSummaryButton.onclick = handleGenerateVisitsSummaryClick;    
    printVisitsSummaryButton.onclick = handlePrintVisitsSummaryClick;
    printDailyReportsButton.onclick = handlePrintDailyReportsClick;
}

// Download Visits Data
function handleDownloadVisitsDataClick() {
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: VISITS_SP_ID,
      range: VISITS_RANGE,
    }).then(function(response) {

        var range = response.result.values;
        if (range.length > 0) {
            localStorage.setItem('visit_list', JSON.stringify(range));
            appendPre('Visites Data Downloaded.');
        } else {
            appendPre('No visit data found.');
        }
    }, function(response) {
      appendPre('Error: ' + response.result.error.message);
    });
}
// Clear Visits Data
function handleClearVisitsDataClick(){
    localStorage.setItem('visit_list',{});
    appendPre("visit_list Cleared");
}
// Download Sites Data
function handleDownloadSitesDataClick(event) {
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SITES_SP_ID,
      range: SITES_RANGE,
    }).then(function(response) {

        var range = response.result.values;
        if (range.length > 0) {
            localStorage.setItem('site_list', JSON.stringify(range));
            appendPre('Sites Data Downloaded.');
        } else {
            appendPre('No sites data found.');
        }
    }, function(response) {
      appendPre('Error: ' + response.result.error.message);
    });
}
// Clear Sites Data
function handleClearSitesDataClick(){
    localStorage.setItem('site_list',{});
    appendPre("site_list Cleared");
}

// Console Logging
function handleConsoleLogVisitsClick(){
    var visit_list = localStorage.getItem("visit_list");
    console.log(JSON.parse(visit_list));    
}
function handleConsoleLogSitesClick(){
    var site_list = localStorage.getItem("site_list");
    console.log(JSON.parse(site_list));
}

function handlePrintVisitsSummaryClick(){

    var visit_summary = JSON.parse(localStorage.getItem('visit_summary'));
    console.log(visit_summary);
    arrayToCSV(visit_summary[0], visit_summary[1], visit_summary[2]);
    
}


function handleGenerateVisitsSummaryClick(){
    var curr_month = $("#month_input").val();
    
    var data;
    var site_list;
    var company_list = [];

    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    var month_name = monthNames[curr_month];
    var gtotal = 0;

    data = localStorage.getItem('visit_list');
    data = JSON.parse(data);

    var i;
    for(i = 0; i < data.length; i++){    
        if (data[i][1] == "" & data[i][2] != ""){
            company_list[data[i][2]] = 1;
        }
    }

    var temp = company_list;
    company_list = [];
    for(var company in temp){
        var new_company = ["", company, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
        company_list.push(new_company);
    }

    site_list = localStorage.getItem('site_list');
    site_list = JSON.parse(site_list);

    var j;
    for(j = 0; j < site_list.length; j++){
        var i;
        for(i = 0; i < 32; i++){
            site_list[j].push("");
        }
    }
    //console.log(site_list); 
    
    
    var pdata = trimData(data, curr_month);
    //console.log(company_list);
    console.log("Processed data pdata for a given month");
    console.log(pdata);
    
    console.log("Total No of Sites in Sites Sheet : " + site_list.length);
    console.log("Total No of Companies in Visits : " + company_list.length);
    
    // list = company_list + site_list
    var list = [];
    var header = ["index", "site","total"];
    var header2 = ["", "", ""]
    var i;
    for(i = 1; i < 32; i++){header.push(i); header2.push("")}
    list.push(header);
    list.push(header2);
    
    var i;
    for(i = 0; i < site_list.length; i++){
        list.push(site_list[i]);
    }
    for(i = 0; i < company_list.length; i++){
        list.push(company_list[i]);
    }    
    
    console.log("Total Rows in the Summary : " + list.length);
    console.log("Processed list before filling visits");
    console.log(list);
    
    var i;
    
    for(i = 0; i < pdata.length; i++){
        // Fill 1's for the site visits 
        if(pdata[i][1] != ""){
            var j;
            for(j = 0; j < list.length; j++){
                if(list[j][1] == pdata[i][1]){
                    var date = pdata[i][0].getDate() + 2;
                    if(list[j][date] > 0){list[j][date] = list[j][date] + 1}else{list[j][date] = 1}
                }
            }
        }
        // Fill 1's for the company visits 
        if(pdata[i][1] == "" & pdata[i][2] != ""){
            var j;
            for(j = 0; j < list.length; j++){
                if(list[j][1] == pdata[i][2]){
                    date = pdata[i][0].getDate() + 2;
                    if(list[j][date] > 0){list[j][date] = list[j][date] + 1}else{list[j][date] = 1}
                }
            }
        }        
    }
    
    var total_array = []; var i;
    for(i = 0; i < 34; i++){
        total_array.push(0);
    }
    
    
    // Calculate Totals for site visits
    var i; 
    for(i = 2; i < list.length; i++){
        var total = 0; 
        var j;
        for(j = 3; j < list[i].length; j++){
            
            if(list[i][j] > 0){
                //console.log(parseInt(list[i][j]));
                total = total + parseInt(list[i][j]);
                total_array[j] = total_array[j] +  + parseInt(list[i][j])
            }
        }
        list[i][0] = parseInt(list[i][0]);
        list[i][2] = total;
        gtotal = gtotal + total;
    }
    
     
    
    list[1] = total_array;
    
    list[1][0] = "( " + month_name + " )";
    list[1][1] = "( Total Visits : " + gtotal + " )";
    list[1][2] = "";
    
    var visit_summary = [list, month_name, gtotal];
    visit_summary = JSON.stringify(visit_summary);
    localStorage.setItem('visit_summary', visit_summary);
    console.log('Total Visits : ' + gtotal + ' localStorage visit_summary set.');  
    
    console.log(list);
    var table = new Tabulator("#summary-table", {
        height:"500px",
        data:list,
        autoColumns:true,
    }); 
           
    
}

function trimData(data, curr_month){
    var trimmed_data = [];
    
    var i;
    for(i = 0; i < data.length; i++){
        var date = data[i][0].split(" ");
        date = date[0].split("/");
        date = new Date(date[2] + "-" + date[1] + "-" + date[0]);
        var month = date.toLocaleString('en-us', { month: 'long' });
        var weekday = date.toLocaleString('en-us', { weekday: 'long' });

        if(date.getMonth() == curr_month){
            var datestring = date.getFullYear() + " " + month + " " + date.getDate() + " " + weekday;
            data[i][0] = date;
            trimmed_data.push(data[i]);
        }
    }
    
    return trimmed_data;
}        

function arrayToCSV (twoDiArray, month_name, gtotal) {
    //  Modified from: http://stackoverflow.com/questions/17836273/
    //  export-javascript-data-to-csv-file-without-server-interaction
    var csvRows = [];
    for (var i = 0; i < twoDiArray.length; ++i) {
        for (var j = 0; j < twoDiArray[i].length; ++j) {
            twoDiArray[i][j] = '\"' + twoDiArray[i][j] + '\"';  // Handle elements that contain commas
        }
        csvRows.push(twoDiArray[i].join(','));
    }

    var csvString = csvRows.join('\r\n');
    var a         = document.createElement('a');
    a.href        = 'data:attachment/csv,' + csvString;
    a.target      = '_blank';
    a.download    = 'visits_summary_' + month_name + '_' + gtotal + '.csv';

    document.body.appendChild(a);
    a.click();
    // Optional: Remove <a> from <body> after done
}




