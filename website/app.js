var http = require('http');
var express = require('express');
var app = express();
var request = require('superagent');
var path = require('path');
var ejs = require('ejs');
var fs = require('fs');
var form = require('express-form');
var bodyParser = require('body-parser');
var https = require('https');

var field = form.field;
app.use(bodyParser());

var average_sentiment;
var average_anger;
var average_disgust;
var average_fear;
var average_joy;
var average_sadness;

// trashy way of handling asynch issues
var counter = 0;
var myQuery;

var ToneAnalyzerV3 = require('tone-analyzer/v3');
var toneAnalyzer = new ToneAnalyzerV3({
  username: '94e52a18-b0e7-4f60-86d3-7f4f41df6bb6',
  password: 'nFuykKJpWZmg',
  version_date: '2016-05-19'
});

function analyzeTone(paragraph) {
  var params = {
    text: paragraph,
    tones: 'emotion',
    sentences: false
  };

  toneAnalyzer.tone(params, function (err, analysis) {
    if (err) {
      console.log('error:', err);
    } else {
      console.log(JSON.stringify(analysis, null, 2));
      var tones = analysis.document_tone.tone_categories[0].tones;
      average_anger += tones[0].score;
      average_disgust += tones[1].score;
      average_fear += tones[2].score;
      average_joy += tones[3].score;
      average_sadness += tones[4].score;
      counter += 1;
      // once all asynch calls are done, call final output calculation function
      if (counter => maxDocs) {
        finalCalc();
      }
    }

  });
}

var maxDocs = 2;
var startTime = 'now-12h';
var endTime = 'now';

var AlchemyDataNewsV1 = require('alchemy-data-news/v1');
var alchemy_data_news = new AlchemyDataNewsV1({
  api_key: 'cb873efd5b3a458bfaf914ec040c1e490d61c92a'
});

function processNews(query) {

  myQuery = query;
  // create a new Alchemy News query using search term
  var params = {
      start: startTime,
      end: endTime,
      count: maxDocs,
      'q.enriched.url.title': query,
      return: 'enriched.url.title,enriched.url.text,enriched.url.enrichedTitle.docSentiment'
  };

  alchemy_data_news.getNews(params, function (err, news) {
    if (err)
      console.log('error:', err);
    else
      // returns news
      console.log(JSON.stringify(news, null, 2));

      average_sentiment = 0;
      average_sadness = 0;
      average_joy = 0;
      average_fear = 0;
      average_disgust = 0;
      average_anger = 0;
      counter = 0;
      for (var i = 0; i < maxDocs; i++) {
        var s = news.result.docs[i].source.enriched.url.enrichedTitle.docSentiment.score;
        console.log(s);
        average_sentiment += s;
        // update global average values
        analyzeTone(news.result.docs[i].source.enriched.url.text);
      }
  });
}

function finalCalc() {
  // FINAL AVERAGE VALUES
  average_sentiment /= maxDocs;
  average_joy /= maxDocs;
  average_sadness /= maxDocs;
  average_fear /= maxDocs;
  average_anger /= maxDocs;
  average_disgust /= maxDocs;

  console.log('AVERAGE SENTIMENT OF ' + myQuery + ' IS...');
  console.log(average_sentiment);
  console.log('AVERAGE JOY OF TEXT IS...');
  console.log(average_joy);
  console.log('AVERAGE SADNESS OF TEXT IS...');
  console.log(average_sadness);
  console.log('AVERAGE FEAR OF TEXT IS...');
  console.log(average_fear);
  console.log('AVERAGE DISGUST OF TEXT IS...');
  console.log(average_disgust);
  console.log('AVERAGE ANGER OF TEXT IS...');
  console.log(average_joy); 
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

app.get('/description', function(req, res) {
    app.set('views', __dirname + "/public/template");
    console.log('Base name:' + __dirname);

        processNews(search);

    res.sendFile(TEMPLATE_DIR + 'description.html');
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

app.post('/process-card', function(req, res) {
  var nonce = req.body.nonce
  res.send(nonce);
})


app.get('/searchforms',
  form(
    field('searchItem').trim()
  ),

  function(req, res){
    var search = req.form.searchItem;
    console.log(search);


    // look for all the fittings here
    var re = /\0/g;

	fs.readFile('./data.json', 'utf8', function (err, data) {
		if (err) throw err; // we'll not consider error handling for now
		var obj = JSON.parse(data.replace(re, ""));

        var search = req.form.searchItem;
        var match = false;

        console.log("TERM: " + search);

        console.log("OBJ: " + obj.id);

        for(var i = 0; i < obj.id; i++) {
            if (obj.name == search)
            {
                match = true;
                fs.readFile('public/template/indextwo.html', 'utf-8', function(err, content) {
                    if (err) {
                      console.log(err);
                      res.end("ASDF");
                      return;
                    }

                    console.log("TERM: " + search);
                    console.log(obj);

                    var renderedHtml = ejs.render(content, {name : search, desc : obj.desc});  //get redered HTML code
                    res.end(renderedHtml);
                });
                return;
            }
        }

        var search = "";
        fs.readFile('public/template/indextwo.html', 'utf-8', function(err, content) {
            if (err) {
              console.log(err);
              res.end("ASDF");
              return;
            }

            var renderedHtml = ejs.render(content, {name : "No Results", desc : "N/A"});  //get redered HTML code
            res.end(renderedHtml);
        });
    });
    //res.sendFile(path.join(TEMPLATE_DIR + 'index.html'));
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
