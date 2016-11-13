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
var unirest = require('unirest');
//var firebase = require('firebase-admin');

var field = form.field;
app.use(bodyParser());

var average_sentiment;
var average_anger;
var average_disgust;
var average_fear;
var average_joy;
var average_sadness;

var globalName;
var globalKeywords = [];
var recentHeadlines = [];

// trashy way of handling asynch issues
var counter = 0;
var myQuery;
// mapped object of all of the discovered values
var analyzedValues;

var ToneAnalyzerV3 = require('tone-analyzer/v3');
var toneAnalyzer = new ToneAnalyzerV3({
  username: '1143d02f-8424-43df-9162-5af46927ccda',
  password: 'S3kimbiXfkx6',
  version_date: '2016-05-19'
});

function analyzeTone(paragraph, res) {
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
        finalCalc(res);
      }
    }

  });
}

var maxDocs = 1;
var startTime = 'now-2d';
var endTime = 'now';

var AlchemyDataNewsV1 = require('alchemy-data-news/v1');
var alchemy_data_news = new AlchemyDataNewsV1({
  api_key: '691c5fb6aecb76e15fe6fe0d168e58ec539f992f'
});

function processNews(query, res) {

  myQuery = query;
  // create a new Alchemy News query using search term
  var params = {
      start: startTime,
      end: endTime,
      count: maxDocs,
      'q.enriched.url.title': query,
      return: 'enriched.url.title,enriched.url.text,enriched.url.enrichedTitle.docSentiment,enriched.url.keywords.keyword.text'
  };

  alchemy_data_news.getNews(params, function (err, news) {
    if (err)
      console.log('error:', err);
    else
      // returns news
      console.log(JSON.stringify(news, null, 2));

      // if not enough to fill maxDocs, then error out
      if(news) {
	      if (news.result.docs == undefined || maxDocs > news.result.docs.length) {
	        console.log('NOT ENOUGH DATA POINTS FOUND');
	        return;
	      }
	  } else {
	  	console.log("cannot read news");
	  }
      average_sentiment = 0;
      average_sadness = 0;
      average_joy = 0;
      average_fear = 0;
      average_disgust = 0;
      average_anger = 0;
      counter = 0;
      if (news) {
        // for (var i = 0; i < maxDocs; i++) {
        //   var s = news.result.docs[i].source.enriched.url.enrichedTitle.docSentiment.score;
        //   average_sentiment += s;
        //   // insert keywords
        //   for (var j = 0; j < news.result.docs[i].source.enriched.url.keywords.length; j++) {
        //     globalKeywords.push(news.result.docs[i].source.enriched.url.keywords[j].text);
        //   }

        for (var i = 0; i < maxDocs; i++) {
          var s = news.result.docs[i].source.enriched.url.enrichedTitle.docSentiment.score;
          average_sentiment += s;
          // insert keywords
          for (var j = 0; j < news.result.docs[i].source.enriched.url.keywords.length; j++) {
            globalKeywords.push(news.result.docs[i].source.enriched.url.keywords[j].text);
          }
          // insert headline
          recentHeadlines.push(news.result.docs[i].source.enriched.url.title);

          // update global average values
          analyzeTone(news.result.docs[i].source.enriched.url.text, res);
        }
      }
  });
}

function finalCalc(res) {
  console.log(globalKeywords);
  console.log(recentHeadlines);
  // FINAL AVERAGE VALUES
  average_sentiment /= maxDocs;
  average_sentiment = average_sentiment.toFixed(2);
  average_joy /= maxDocs;
  average_joy = average_joy.toFixed(2);
  average_sadness /= maxDocs;
  average_sadness = average_sadness.toFixed(2);
  average_fear /= maxDocs;
  average_fear = average_fear.toFixed(2);
  average_anger /= maxDocs;
  average_anger = average_anger.toFixed(2);
  average_disgust /= maxDocs;
  average_disgust = average_disgust.toFixed(2);

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
  console.log(average_anger);

  analyzedValues = {
    avg_sentiment: average_sentiment,
    avg_joy: average_joy,
    avg_sadness: average_sadness,
    avg_fear: average_fear,
    avg_anger: average_anger,
    avg_disgust: average_disgust
  };

  fs.readFile('public/template/description.html', 'utf-8', function(err, content) {
          if (err) {
             console.log(err);
             res.end("Error: Check Server command logs");
            return;
          }
          var joinedKeys = globalKeywords.join();
          var joinedHeadlines = recentHeadlines.join('|');
          console.log('rendered');
            var renderedHtml = ejs.render(content, {headlines: joinedHeadlines, keywords: joinedKeys, name: globalName, sentiment : average_sentiment, sadness: average_sadness, fear: average_fear, joy: average_joy, disgust: average_disgust, anger: average_anger});
            //get redered HTML code
            res.end(renderedHtml);
  });
}


var options = {
  host: 'datapiece.bluemix.net',
  port: 443,
  method: 'GET'
};

var TEMPLATE_DIR =  __dirname + '/public/template/'

app.use(express.static(path.join(__dirname, 'public')));
app.use("/partials", express.static(__dirname+"/template/partials"));

app.get('/', function(req, res) {
	app.set('views', __dirname + "/public/template");
	res.sendFile(TEMPLATE_DIR + 'index.html');
});

app.get('/thanks', function(req, res) {
	app.set('views', __dirname + "/public/template");
	res.sendFile(TEMPLATE_DIR + 'thank_you.html');
});

app.get('/dashboards', function(req,res) {
    // grab users
    // grab a list of product names
    // open the doc and get the data
    //
    // pass it
    fs.readFile('public/template/dashboards.html', 'utf-8', function(err, content) {
        if (err) {
          console.log(err);
          res.end("Error: Check Server command logs");
          return;
        }

        var renderedHtml = ejs.render(content);  //get redered HTML code
        res.end(renderedHtml);
    });
    return;
});

app.get('/description',

    form(
        field('name').trim()
    ),

    function(req, res) {

        globalName = req.form.name;

        app.set('views', __dirname + "/public/template");
        console.log('Base name:' + __dirname);

        processNews(req.form.name, res);



});

var resultElement = fs.readFileSync("public/template/partials/result_element.html", "utf8");

app.get('/test', function(req, res, next) {
	//var html = fs.readFileSync("public/template/result_element.html", "utf8");
	//res.send(html);
	res.sendFile(TEMPLATE_DIR + 'partials/result_element.html');
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
  var card_nonce = req.body.nonce

  var access_token = 'sandbox-sq0atb-qnEQHbUhWZ-OwIUzOleOCg'

  var location_id = unirest.get('https://connect.squareup.com/v2/locations', headers= {
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + access_token
  })

  // var donation = req.body.donation

  var response = unirest.post('https://connect.squareup.com/v2/locations/' + location_id + '/transactions',
    headers={
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token,
    },
    params = JSON.stringify({
      'card_nonce': card_nonce,
      'amount_money': {
        // 'amount': donation,
        'amount': 100,
        'currency': 'USD'
      }
      // 'idempotency_key': str(uuid.uuid1())
    })
  )

  res.sendFile(TEMPLATE_DIR + 'thank_you.html');

})


app.get('/searchforms',
  form(
    field('searchItem').trim()
  ),

  function(req, res){
    var search = req.form.searchItem;
    console.log("search: " + search);
    // look for all the fittings here
    var re = /\0/g;

	fs.readFile('./data.json', 'utf8', function (err, data) {
		if (err) throw err; // we'll not consider error handling for now
		var obj = JSON.parse(data.replace(re, ""));

        var search = req.form.searchItem;
        var match = false;

        console.log("TERM: " + search);

    	// firebase.initializeApp({
    	// 	databaseURL: "https://charitystatement.firebaseio.com",
    	// 	serviceAccount: './charitystatement-firebase-adminsdk-8ez4f-eebfe3aeaf.json'
    	// });
    	// var firebaseRef = firebase.database().ref("/");


    	// firebaseRef.once('value').then(function(snapshot) {
	    // 	var update = {};
	    // 	snapshot.forEach(function(childSnapshot) {
	    // 		update[childSnapshot.key] = childSnapshot.val();
	    // 	});
	    // 	update[search] = search;

	    // 	console.log("update: " + update['search']);

	    // 	firebase.database().ref("/").update(update).then(() => {
	    // 		console.log("successful");
	    // 	}).catch(error => {console.log("failed")});
	    // }).catch(function(error) {
	    // 	console.log('failed to update database', error);
	    // });
        console.log("OBJ: " + obj.id);

        for(var i = 0; i < obj.id; i++) {
            if (obj.values[i].name.toLowerCase() == search.toLowerCase())
            {
                match = true;
                fs.readFile('public/template/indextwo.html', 'utf-8', function(err, content) {
                    if (err) {
                      console.log(err);
                      res.end("Error: Check Server command logs");
                      return;
                    }

                    console.log(search);
                    var linktext = "./description?name=" + encodeURIComponent(search);
                    console.log(linktext);
                    var renderedHtml = ejs.render(content, {name : search, desc : obj.values[i].desc, img : obj.values[i].img, link: linktext});  //get redered HTML code
                    res.end(renderedHtml);
                });
                return;
            }
        }

        fs.readFile('public/template/indextwo.html', 'utf-8', function(err, content) {
            if (err) {
              console.log(err);
              res.end("ASDF");
              return;
            }

            var renderedHtml = ejs.render(content, {name : "No Results", desc : "N/A", img : "http://www.mikeanthony.me/wp-content/uploads/2015/05/9647972522_89abb20da5_o.jpg", link: ""});  //get redered HTML code
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
