
const printer = require("../lib")
const os = require('os');
const fs = require('fs');
const path = require('path');

function dispatchLabelPrint(data) {

  //Read printing settings from json file
  const printSettings = fs.readFileSync(path.resolve(__dirname, "printSettings.json"));
  const printSettingsObject = JSON.parse(printSettings);  
  
  const printerIndex = printSettingsObject.printers.findIndex(printer => 
    printer.modelName === "Zebra GX430t"
  );

  const operatingSystem = os.platform();
  const osPrinterName = operatingSystem === "win32" ? printSettingsObject.printers[printerIndex].osNames.windowsName :
    operatingSystem === "darwin" ? printSettingsObject.printers[printerIndex].osNames.macOsXName :
      printSettingsObject.printers[printerIndex].osNames.unixName

  switch (data.label){
    case "smartphone": {
      const label = generateSmartphoneEplLabel(data, printSettingsObject);
      printZebra(label, osPrinterName);
      break;
    }
    case "accesory": {
      break;
    }
    default : {
      console.log("Type of label not available");
      break;
    }
  }
  return true;
}

function generateSmartphoneEplLabel(data, printSettings) {
  const attributeFontHeight = 30;
  let currentRowPoints = 5;
  const today = new Date(Date.now());

  const [ label ] = printSettings.labels.filter(label => Object.keys(label)[0] === "smartphone");
  const  [ printerSettings ] = printSettings.printers.filter(printer => printer.modelName === "Zebra GX430t");

/*
 EPL needs a strict format , if you add identation here, 
 the format will get messed up because of EPL guidelines.
*/
let printData = `! U1 setvar "media.printmode" "T"
N
S4
D15
q${label.smartphone.attributes.widthIn * printerSettings.resolutionDpi}
A20,${currentRowPoints},0,2,1,1,R,\"${data.title}\"\n`;

  currentRowPoints += 40;

  // Limit to attributes provided in label settings
  for (let index = 0; index < label.smartphone.maxPrintedAttributes; index++) {
    printData = printData.concat(`A20,${currentRowPoints},0,2,1,1,N,\"${data.attributes[index]}\"\n`);
    currentRowPoints += attributeFontHeight;
    if (data.attributes.length === index) break;
  }
  
  const dateFooter = `A100,250,0,1,1,1,N,\"${today.toLocaleDateString()} - ${today.toLocaleTimeString()}\"\n`
  const barcode = `b590,100,Q,s7,\"${data.qrCodeData}\"\nP${data.labelsQuantity}\n`

  printData = printData.concat(dateFooter);
  printData = printData.concat(barcode);

  return printData;
}


function printZebra(eplPrintData, printerName) {
  printer.printDirect({
    data: eplPrintData,
    printer: printerName,
    type: "RAW",
    success: function () {
      console.log("Label printed!");
    }
    , error: function (err) { console.log(err); }
  });
}


module.exports = dispatchLabelPrint;