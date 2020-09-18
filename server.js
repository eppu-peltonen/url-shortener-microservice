'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var dns = require("dns");

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

// DB connection
mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true});

// Database
const { Schema } = mongoose;
const urlSchema = new Schema({
  original_url: String,
  short_url: String
});
const Url = mongoose.model('URL', urlSchema);


app.use(cors());


// request body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post("/api/shorturl/new", function (req, res) {
  
  var urlInput = req.body.url;
  var urlObj = new URL(urlInput);

  dns.lookup(urlObj.hostname, (err) => {
    if (err) {
      res.send({error: "Invalid URL"});
    }
  });

  var shortURL = urlObj.hostname.substring(4, 8);

  const url = new Url({
    original_url: urlObj.hostname,
    short_url: shortURL
  });

  //TODO Check if URL exists in database

  url.save((err) => {
    if (err) res.send(err);
  })

  res.json({
    original_url: urlObj.hostname,
    short_url: shortURL
  });

});

app.get("/api/shorturl/:shorturl", (req, res) => {
  var shortUrl = req.params.shorturl;
  const query = Url.where({short_url: shortUrl});
  query.findOne((err, url) => {
    if (err) res.send(err);
    if (url) res.redirect("https://" + url.original_url);
  });
})


app.listen(port, function () {
  console.log('Node.js listening ...');
});