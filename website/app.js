var http = require('http');
var express = require('express');
var app = express();
var request = require('superagent');
var path = require('path');
var fs = require('fs');
var form = require('express-form');
var bodyParser = require('body-parser');
var https = require('https');

var field = form.field;
app.use(bodyParser());

// maximum number of presented data
var maxDocs = 5;

var AlchemyDataNewsV1 = require('alchemy-data-news/v1');
var alchemy_data_news = new AlchemyDataNewsV1({
  api_key: '6896e3e3058a27db83a2ba7773c742f272d6451d'
});

function processNews(numDocs, query) {

  // create a new Alchemy News query using search term
  var params = {
      start: 'now-1d',
      end: 'now',
      count: numDocs,
      'q.enriched.url.title': query,
      return: 'enriched.url.title,enriched.url.enrichedTitle.docSentiment,enriched.url.keywords'
  };

  alchemy_data_news.getNews(params, function (err, news) {
    if (err)
      console.log('error:', err);
    else
      // returns news
      console.log(JSON.stringify(news, null, 2));

      var average_sentiment = 0;

      for (var i = 0; i < maxDocs; i++) {
        var s = news.result.docs[i].source.enriched.url.enrichedTitle.docSentiment.score;
        console.log(s);
        average_sentiment += s;
      }

      average_sentiment /= maxDocs;
      console.log('AVERAGE SENTIMENT OF ' + query + ' IS...');
      console.log(average_sentiment);
  });
}

var options = {
  host: 'datapiece.bluemix.net',
  port: 443,
  method: 'GET'
};

var TEMPLATE_DIR =  __dirname + '/public/template/'

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
	app.set('views', __dirname + "/public/template");
	console.log('Base name:' + __dirname);
	res.sendFile(TEMPLATE_DIR + 'index.html');
});

var resultElement = fs.readFileSync("public/template/result_element.html", "utf8");

app.get('/test', function(req, res, next) {
	//var html = fs.readFileSync("public/template/result_element.html", "utf8");
	//res.send(html);
	res.sendFile(TEMPLATE_DIR + 'result_element.html');
});
//var resultElement = fs.readFileSync("template/result_element.html", "utf8");

/*
app.get('/index', function(req, res) {
	res.sendFile(path.join(TEMPLATE_DIR + 'index.html'));
});*/

app.get('/payment', function(req, res) {
	//var html = fs.readFileSync("public/template/result_element.html", "utf8");
	//res.send(html);
	res.sendFile(TEMPLATE_DIR + 'payment.html');
});

app.get('/searchforms',
  form(
    field('searchItem').trim()
  ),

  function(req, res){
    var search = req.form.searchItem;
    console.log(search);

    processNews(maxDocs, search);

    res.sendFile(path.join(TEMPLATE_DIR + 'index.html'));
  }
);

var marchantData = {
  "merchant_id": "string",
  "medium": "balance",
  "purchase_date": "2016-11-12",
  "amount": 0.01,
  "description": "string"
}



function buyCapitalOne(account, amount) {
    request.post('http://api.reimaginebanking.com/accounts/' + account + '/purchases?key=96369a6506e9cc642c1ed4e633081c82')
	.send(merchantData)
	.end(function(err, res){
		//idfk, do something if you buy something
    });
};

// request at bluemix instance

app.listen(8080, function() {
	console.log('Example app listening on port 8080');
});
