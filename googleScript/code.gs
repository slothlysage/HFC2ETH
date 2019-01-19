var spreadsheetID = "1JMn7wSf9HZ0kx1bUObgYTHLNjtzfTcGVr98QLk8T5Nc"
var spreadsheet = SpreadsheetApp.openById(spreadsheetID);

function doGet(e) {
  console.log(e);
  var type = e.parameter.type;
  
  if (type === "last") {
    var sheet = spreadsheet.getSheetByName("audit");
    var lastRow = sheet.getLastRow();
    var response = ContentService.createTextOutput(lastRow).setMimeType(ContentService.MimeType.JSON);
  }
  return response
}

function doPost(e) {
  console.log(e);
  var data = JSON.parse(e.postData.contents);
  console.log(data);
  var sheet = spreadsheet.getSheetByName("audit");
  for (var key in data) {
    sheet.appendRow([data[key][0], data[key][1], data[key][2], data[key][3], data[key][4]])
  }
  var response = ContentService.createTextOutput(data.keys().length.toString()).setMimeType(ContentService.MimeType.JSON);
  return response
}