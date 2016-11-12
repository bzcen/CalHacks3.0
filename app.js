var http = require('http');
//var html = require('html');
var express = require('express');
var app = express();
var path = require('path');
var form = require('express-form');
var bodyParser = require('body-parser');
var https = require('https');
var field = form.field;
app.use(bodyParser());


var options = {
  host: 'datapiece.bluemix.net',
  port: 443,
  method: 'GET'
};


var TEMPLATE_DIR =  __dirname + '/template/'

app.get('/', function(req, res) {
	app.set('views', __dirname + "/template");
	//app.use('/css', express.static(path.join(__dirname, 'public/css')));
	app.use(express.static(path.join(__dirname, 'public')));
	console.log('Base name:' + __dirname);
	res.sendFile(TEMPLATE_DIR + 'index.html');
});

app.get('/index', function(req, res) {
	res.sendFile(path.join(TEMPLATE_DIR + 'index.html'));
});

app.get('/searchforms', 
  form(
    field('searchItem').trim()
  ),

  function(req, res){
    console.log(req.form.searchItem);
    res.sendFile(path.join(TEMPLATE_DIR + 'index.html'));
	var req = https.request(options, function(res) {
	  console.log('STATUS: ' + res.statusCode);
	  console.log('HEADERS: ' + JSON.stringify(res.headers));
	  res.setEncoding('utf8');
	  res.on('data', function (chunk) {
		console.log('BODY: ' + chunk);
	  });

	  req.on('error', function(e) {
	    console.log('problem with request: ' + e.message);
	  });

	});
  }
);


// request at bluemix instance

app.listen(8080, function() {
	console.log('Example app listening on port 8080');
});
