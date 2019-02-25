var data;
var site_list;
$.getJSON("data/data.json", function(json) {
    data = json;
    //console.log(json);
});
$.getJSON("data/site_list.json", function(json) {
    site_list = json;
    console.log(json);
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
    // For February Month
    var month = 2;
    var trimmed_data = [];
    
    var i;
    for(i = 0; i < data.length; i++){
        var date = data[i][0].split(" ");
        date = date[0].split("/");
        date = new Date(date[2] + "-" + date[1] + "-" + date[0]);
        var month = date.toLocaleString('en-us', { month: 'long' });
        var weekday = date.toLocaleString('en-us', { weekday: 'long' });

        if(date.getMonth() == 1){
            var datestring = date.getFullYear() + " " + month + " " + date.getDate() + " " + weekday;
            data[i][0] = date;
            trimmed_data.push(data[i]);
        }
    }
    
    return trimmed_data;
}


function handlePrintSummary(){
    var pdata = trimData(data);
    var site_list = [];
    var company_list = [];
    var i;
    for(i = 0; i < pdata.length; i++){
        if(pdata[i][1] != "" & site_list[pdata[i][1]] != 1){
            site_list[pdata[i][1]] = 1;
        } 
            
        if (pdata[i][1] == "" & company_list[pdata[i][2]] != 1){
            company_list[pdata[i][2]] = 1;
        }
    }
    
    // Assign found unique site names and company names to 'list' array.
    //
    var list = Object.assign({}, site_list, company_list); 
    var plist = [];
    
    for(key in list){
        plist[key] = [];
        var j;
        for(j = 1; j <= 31; j++){
            plist[key][j] = "";
        }
    }
    
    for(i = 0; i < pdata.length; i++){
        date = pdata[i][0].getDate();
            if(pdata[i][1] != "" & list[pdata[i][1]] == 1){
                plist[pdata[i][1]][date] = 1;
            }
        
            if(list[pdata[i][2]] == 1){
                plist[pdata[i][2]][date] = 1;
            }
        
    }
    
    var p2list = [];
    p2list[0] = ["site"];
    p2list[0].push("Total");
    var k;
    for(k = 1; k < 32; k++){
        p2list[0].push(k);
    }
    
    var i = 1;
    for(key in plist){
        p2list[i] = [];
        p2list[i][0] = key;

        var j; 
        var total = 0;
        //p2list[i][1] = total;
        for(j = 1; j < plist[key].length + 1; j++){
            if(parseInt(plist[key][j - 0]) > 0){
                
               total =  total + parseInt(plist[key][j - 0]);
               }
            p2list[i][j] = plist[key][j - 0];
        }
        console.log(total);
        p2list[i][1] = total;
        i++;
    }
    
//    console.log(p2list);
    
    arrayToCSV(p2list);    
    
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
    a.download    = 'myFile.csv';

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
