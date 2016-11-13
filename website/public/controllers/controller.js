var charityStatement 
	= angular
		.module('charityStatement', ['ngSanitize'])
var blankHtml = "<div href=\"http://google.com\" class=\"col-md-12\" style=\"margin-top: 5px; margin-bottom: 5px;\"><div class=\"media\"><a class=\"media-left waves-light\"></a><div class=\"media-body\"><h4 class=\"media-heading\">John Doe</h4><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi cupiditate temporibus iure soluta. Quasi mollitia maxime nemo quam accusamus possimus, voluptatum expedita assumenda. Earum sit id ullam eum vel delectus!</p></div></div></div>"

charityStatement.controller('CharityCtrl', ['$scope', '$http', '$sce', '$templateCache',
						 function($scope, $http, $sce, $templateCache) {

    $scope.addAndy = function() {
        console.log("Add Element called");
    	var element = angular.element(document.querySelector("#results"));
    	element.append('<br/>');
        //$scope.htmlToAdd += $scope;
        if($scope.htmlToAdd == null) {
        	$scope.htmlToAdd = blankHtml;
        } else {
	        $scope.htmlToAdd += '<br>';
	    	$scope.htmlToAdd += blankHtml;
	    }
    }

    $scope.makeDonation = function() {
    	console.log("donation made!");
    }

    console.log("start firebase stuff");
    //firebase stuff
    var config = {
		    apiKey: "AIzaSyDEiQ7mFRi2KuuaLUP3IBL780A2B2Nuago",
		    authDomain: "charitystatement.firebaseapp.com",
		    databaseURL: "https://charitystatement.firebaseio.com",
		    storageBucket: "charitystatement.appspot.com",
		    messagingSenderId: "693936859765"
		  };
		  firebase.initializeApp(config);
		  console.log("firebase loaded.. theoreticallyy")

	var uiConfig = {
        'signInSuccessUrl': '/',
        'signInOptions': [
          // Leave the lines as is for the providers you want to offer your users.
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],
        'signInFlow' : 'popup',
        // Terms of service url.
        'tosUrl': '/#',
      };
      	var ui = new firebaseui.auth.AuthUI(firebase.auth());
      	ui.start('#firebaseui-auth-container', uiConfig);

      	//$scope.initApp = function() { 
  		firebase.auth().onAuthStateChanged(function(user) {
  			if(user) {
  				console.log("log in successful");
  				document.getElementById("firebaseui-auth-container").style.display="none";
  				document.getElementById("sign-in-button").style.display="none";
  				document.getElementById("signed-in-status").style.display="inline-block";
				document.getElementById("signed-in-status").textContent = 
				'Signed in as: ' + user.email;
  				document.getElementById("sign-out-button").style.display="inline-block";
  				console.log("end log in successful");
  			} else {
  				console.log("signed out");
  				document.getElementById("sign-in-button").style.display="inline-block";
  				document.getElementById("signed-in-status").style.display="none";
  				document.getElementById("sign-out-button").style.display="none";
  				console.log("end signed out successful");
  			}
  		});
      	//}

      	$scope.doStuff = function() {
      		$scope.alert("something happened");
      		console.log('pushing charity name');
      		firebase.database().ref('/').push().update({'charity': $scope.charityname});
      		console.log('charityname: ' + $scope.charityname);
      	}

      	$scope.showSignInOptions = function() {
      		document.getElementById("sign-in-button").style.display="none";
      		document.getElementById("firebaseui-auth-container").style.display="inline-block";
      	}

      	$scope.signOut = function() {
      		firebase.auth().signOut().then(function() {
			  console.log('Signed Out');
			}, function(error) {
			  console.error('Sign Out Error', error);
			});
      	}

}]);

/*
charityStatement.config(function($routeProvider) {
	$routeProvider
	.when('/test', {
		templateUrl: 'partials/result_element.html'
	});
});
*/