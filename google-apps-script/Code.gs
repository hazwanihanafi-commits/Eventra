function doGet(e){
  return ContentService.createTextOutput(JSON.stringify({status:'API Ready'}))
  .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e){
  const data=JSON.parse(e.postData.contents);
  return ContentService.createTextOutput(JSON.stringify({
    success:true,
    participant:data.id,
    message:'Checked in'
  })).setMimeType(ContentService.MimeType.JSON);
}