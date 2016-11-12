var http = require('http');
//var html = require('html');
var express = require('express');
var app = express();
var path = require('path');
var jsdom = require('jsdom');
var fs = require('fs');

var TEMPLATE_DIR =  __dirname + '/template/'


app.get('/', function(req, res) {
	app.set('views', __dirname + "/template");
	//app.use('/css', express.static(path.join(__dirname, 'public/css')));
	app.use(express.static(path.join(__dirname, 'public')));
	console.log('Base name:' + __dirname);
	res.sendFile(TEMPLATE_DIR + 'index.html');
});

var resultElement = fs.readFileSync("template/result_element.html", "utf8");

app.get('/index', function(req, res) {
	res.sendFile(path.join(TEMPLATE_DIR + 'index.html'));
});


app.listen(8080, function() {
	console.log('Example app listening on port 8080');
});