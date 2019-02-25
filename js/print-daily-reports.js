function handlePrintDailyReportsClick(){

    data = localStorage.getItem('visit_list');
    visit_list = JSON.parse(data);
    
    var curr_month = $("#month_input").val();
    visit_list = trimData(visit_list, curr_month);
    
    var plist = [];
    var i; var curr_date;
    
    for(i = 0; i < 32; i++){
            plist[i] = [];   
    }    
    
    for(i = 0; i < visit_list.length; i++){
        curr_date = visit_list[i][0].getDate();
        plist[curr_date].push(visit_list[i]);
    }
    
    var doc = new jsPDF('landscape', 'mm', 'a4');
    
    var pageData;
    
    for(i = 0; i < plist.length; i++){      
        pageData = plist[i];
        
        if(pageData.length != 0){
            doc = addReportPage(doc, pageData);
            doc.addPage();
        }
    }
    
    
    doc.save('Daily Reports');
    
}

function addReportPage(doc, pageData){
    var row_start = 45;
    var row_spacing = 6;
    var i; var j;
    var rowData = [" ", " ", " ", " ", " ", " ", " "];
    
    for(i = 0; i < 15; i++){
        if(pageData[i]){
            for(j = 0; j < pageData.length; j++){
            rowData[j] = pageData[i][j];
            }
        } else {
            rowData = false;
        }
        row_start = row_start + row_spacing;
        doc = addReportRow(doc, rowData, row_start);
    }
    
    
    
    return doc;
}

function addReportRow(doc, rowData, top){
    var box_height = 5;
    var box_width = 5;
    var box_spacing = 1;
    
    var box_1_width = 70;
    var box_2_width = 32;
    var box_3_width = 60;
    
    var col_1_start = 10;
    var col_2_start = col_1_start + box_1_width + 3;
    var col_3_start = col_2_start + box_width + 3;
    var col_4_start = col_3_start + box_width + 3;
    var col_5_start = col_4_start + box_width + 3;
    var col_6_start = col_5_start + box_2_width + 3;
    
    var col_16_start = col_6_start + box_width + 3;
    
    doc.rect(col_1_start, top, box_1_width, box_height );
    doc.rect(col_2_start, top, box_width, box_height);
    doc.rect(col_3_start, top, box_width, box_height);
    doc.rect(col_3_start, top, box_width, box_height);
    
    doc.rect(col_4_start, top, box_width, box_height);
    doc.rect(col_5_start, top, box_2_width, box_height);
    doc.rect(col_6_start, top, box_width, box_height);
    
    doc.rect(col_16_start, top, box_3_width, box_height); 
    
    //console.log(doc.getFontList());
    doc.setFontSize(8);
    doc.setFont("times");
    doc.setFontType("regular");
    doc.setTextColor(0, 0, 0);    
    

    if(rowData){
        var customer = rowData[1] + ' | ' + rowData[2];
        customer = customer.slice(0, 50);
        
        var contact_person = rowData[3].slice(0, 22);
        
        var comments = rowData[6].slice(0, 46);  
        comments = comments.replace(/(\r\n|\n|\r)/gm, "");
        
        
        top = top + 4;
        doc.text(col_1_start + 1, top, customer);
        doc.text(col_5_start + 1, top, contact_person);
        doc.text(col_16_start + 1, top, comments);
    }
    
    return doc;
}


function renderPDFCanvas(pdfData) {
    
// atob() is used to convert base64 encoded PDF to binary-like data.
// (See also https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/
// Base64_encoding_and_decoding.)
pdfData = atob(pdfData);

// Loaded via <script> tag, create shortcut to access PDF.js exports.
var pdfjsLib = window['pdfjs-dist/build/pdf'];

// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = 'lib/pdf.worker.js';

// Using DocumentInitParameters object to load binary data.
var loadingTask = pdfjsLib.getDocument({data: pdfData});
loadingTask.promise.then(function(pdf) {
  console.log('PDF loaded');
    
    console.log('No of Pages : ' + pdf.numPages);
  
  // Fetch the first page
  var pageNumber = 1;
  pdf.getPage(pageNumber).then(function(page) {
    console.log('Page loaded');
    
    var scale = 1.5;
    var viewport = page.getViewport({scale: scale});

    // Prepare canvas using PDF page dimensions
    var canvas = document.getElementById('the-canvas');
    var context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render PDF page into canvas context
    var renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    var renderTask = page.render(renderContext);
    renderTask.promise.then(function () {
      console.log('Page rendered');
    });
  });
}, function (reason) {
  // PDF loading error
  console.error(reason);
});    
    
}