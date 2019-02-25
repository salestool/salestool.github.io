var data;
var site_list;
var company_list = [];
var curr_month = 0


const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
var month_name = monthNames[curr_month];
var gtotal = 0;


$.getJSON("data/data.json", function(json) {
    data = json;
    
    
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
    
    
    //console.log(json);
});
$.getJSON("data/site_list.json", function(json) {
    site_list = json;
    
    var j;
    for(j = 0; j < site_list.length; j++){
        var i;
        for(i = 0; i < 32; i++){
            site_list[j].push("");
        }
    }
    //console.log(site_list);
});




var printReportButton = document.getElementById('print_report');
printReportButton.onclick = handlePrintReport;

var printSummaryButton = document.getElementById('print_summary');
printSummaryButton.onclick = handlePrintSummary;


//    YYYY-MM-DDTHH:mm:ss.sssZ
//    https://tc39.github.io/ecma262/#sec-date-time-string-format
//
//    1. Returns only specified month visit records
//    2. Updates date to js date object
//
function trimData(data){
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


function handlePrintSummary(){
    var pdata = trimData(data);
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
        list[i][2] = total;
        gtotal = gtotal + total;
    }
    
    list[1] = total_array;
    
    list[1][0] = "( " + month_name + " )";
    list[1][1] = "( Total Visits : " + gtotal + " )";
    list[1][2] = "";
    
    
    console.log('Total Visits : ' + gtotal);
    console.log(list);
    arrayToCSV(list);    
    
}


function arrayToCSV (twoDiArray) {
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


function handlePrintReport() {

    var i; var pdata = []; var pdatap = [];

    var year_data = [];

    for(i=0; i < 13; i++){
        year_data[i] = [];
        for(j=0; j< 32; j++){
            year_data[i][j] = [];
        }
    }
    console.log(year_data);    
    
    for(i=0; i < data.length; i++){
        var date = data[i][0];
        var site = data[i][1];
        var company = data[i][2];
        var person = data[i][3];
        var type = data[i][4];
        var description = prepare_description(data[i][5]);        
        
        var person = person.split("|");
        person = person[0];
        
        var month = date.slice(3,5);
        var date = date.slice(0,2);
        
        if(month == 2 & date > 0 & date < 10 ){
            pdatap.push(data[i]);
            year_data[parseInt(month)][parseInt(date)].push(site + " | " + person + " | " + description);
        }
    }
    console.log(year_data);
    console.log(pdatap);
}

function prepare_description(description){
    description = description.slice(0,20);
    return description;
}
