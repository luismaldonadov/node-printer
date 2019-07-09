const express = require('express');
const app = express();
const cors = require('cors');
const labelPrint = require('./labels/eplLabelPrinter');
const bodyParser = require('body-parser');
require('dotenv').config();
const port = process.env.SERVER_PORT;

const whitelist = [process.env.LOCAL_TEST,process.env.DEV_SITE, process.env.PRODUCTION_SITE, process.env.LOCAL_SITE];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
};

app.use(bodyParser.json()) // for parsing application/json body rquests

app.options('/printLabel', cors()) // enable pre-flight request for post 

app.post('/printLabel', cors(corsOptions), function (req, res) {
  try {
    labelPrint(req.body);
    res.send('Label print dispatch!');
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
})

app.listen(port, () => console.log(`Print label app listening on port ${port}!`));