const express = require('express');
const app = express();
const labelPrint =  require('./labels/eplLabelPrinter');
const bodyParser = require('body-parser')
const port = 25639

app.use(bodyParser.json()) // for parsing application/json body rquests

app.post('/printLabel', function (req, res) {
  try {
    labelPrint(req.body);
    res.send('Label print dispatch!')  
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
})

app.listen(port, () => console.log(`Print label app listening on port ${port}!`))