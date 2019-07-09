
const printer = require("../lib")
const os = require('os');
const fs = require('fs');
const path = require('path');

function dispatchLabelPrint(data) {
  console.log(data);
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
      const label = generateAccesoryEplLabel(data, printSettingsObject);
      printZebra(label, osPrinterName);
      break;
    }
    case "calibrate": {
      let printData = `xa\n`;
      printZebra(printData, osPrinterName);
      break;
    }
    default : {
      console.log("Type of label not available");
      break;
    }
  }
  return true;
}

/**
 *
 *
 * @param {*} data
 *  In JSON format like 
 *   {
 *      title: String on top of the label
 *      qrCodeData: String of data to be generated to qr code
 *      attributes: array of strings
 *      labelQuantity: integer quantity of labels
 *   }
 * @param {*} printSettings
 * @returns printData - string formatted in EPL2
 */
function generateSmartphoneEplLabel(data, printSettings) {

  const attributeFontHeight = 30;
  let currentRowPoints = 20;
  const today = new Date(Date.now());

  const [ label ] = printSettings.labels.filter(label => Object.keys(label)[0] === "smartphone");
  const  [ printerSettings ] = printSettings.printers.filter(printer => printer.modelName === "Zebra GX430t");

/*
 EPL needs a strict format , if you add identation here, 
 the format will get messed up because of EPL guidelines.
*/
  let printData = `! U1 setvar "media.printmode" "${data.printMode}"
N
S4
D15
q${label.smartphone.attributes.widthIn * printerSettings.resolutionDpi}
A20,${currentRowPoints},0,2,1,1,R,\"${data.title}\"\n`;

  currentRowPoints += 40;

  // Limit to attributes provided in label settings
  for (let index = 0; index < label.smartphone.maxPrintedAttributes; index++) {
    if (data.attributes.length === index) break;
    printData = printData.concat(`A20,${currentRowPoints},0,2,1,1,N,\"${data.attributes[index]}\"\n`);
    currentRowPoints += attributeFontHeight;
  }
  
  const dateFooter = `A130,240,0,1,1,1,N,\"${today.toLocaleDateString()} - ${today.toLocaleTimeString()}\"\n`
  const barcode = `b600,110,Q,s7,\"${data.qrCodeData}\"\nP${data.labelsQuantity}\n`

  printData = printData.concat(dateFooter);
  printData = printData.concat(barcode);

  return printData;
}

/**
 *
 *
 * @param {*} data
 *  In JSON format like
 *   {
 *      title: String on top of the label
 *      qrCodeData: String of data to be generated to qr code
 *      attributes: array of strings
 *      labelQuantity: integer quantity of labels
 *   }
 * @param {*} printSettings
 * @returns printData - string formatted in EPL2
 */
function generateAccesoryEplLabel(data, printSettings) {
  const attributeFontHeight = 20;
  let currentRowPoints = 5;
  const today = new Date(Date.now());

  const [label] = printSettings.labels.filter(label => Object.keys(label)[0] === "accesories");
  const [printerSettings] = printSettings.printers.filter(printer => printer.modelName === "Zebra GX430t");

  /*
   EPL needs a strict format , if you add identation here, 
   the format will get messed up because of EPL guidelines.
  */

  let printData = `! U1 setvar "media.printmode" "${data.printMode}"
N
S4
D15
q${label.accesories.attributes.widthIn * printerSettings.resolutionDpi}
A25,${currentRowPoints},0,1,1,1,R,\"${data.title}\"\n`;

  currentRowPoints += 25;

  // Limit to attributes provided in label settings
  for (let index = 0; index < label.accesories.maxPrintedAttributes; index++) {
    if (data.attributes.length === index) break;
    printData = printData.concat(`A25,${currentRowPoints},0,1,1,1,N,\"${data.attributes[index]}\"\n`);
    currentRowPoints += attributeFontHeight;
  }

  const dateFooter = `A25,80,0,1,1,1,N,\"${today.toLocaleDateString()}\"\n`
  const timeFooter = `A25,100,0,1,1,1,N,\"${today.toLocaleTimeString()}\"\n`
  const barcode = `b200,40,Q,s4,\"${data.qrCodeData}\"\nP${data.labelsQuantity}\n`

  printData = printData.concat(dateFooter);
  printData = printData.concat(timeFooter);
  printData = printData.concat(barcode);

  return printData;
}

/**
 *
 *
 * @param {*} eplPrintData - data in EPL2 format
 * @param {*} printerName - OS name for the printer
 */
function printZebra(eplPrintData, printerName) {
  printer.printDirect({
    data: eplPrintData,
    printer: printerName,
    type: "RAW",
    success: function () {
      console.log("Printer job sent successfully!");
    }
    , error: function (err) { console.log(err); }
  });
}


module.exports = dispatchLabelPrint;