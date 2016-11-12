var charityStatement = angular.module('charityStatement', ['ngSanitize']);

var blankHtml = "<img src=\"https://scontent-sjc2-1.xx.fbcdn.net/v/t1.0-1/c56.0.160.160/p160x160/13103482_10207680619286730_8033174344227124466_n.jpg?oh=054453aeaad7666f6273d51bcd0015cb&oe=58D300C7\"/><p>Andy is lame</p><div id=\"score\">5/7</div>"

charityStatement.controller('CharityCtrl', ['$scope', '$http', '$sce', '$templateCache',
						 function($scope, $http, $sce, $templateCache) {
    console.log("Controller functional");

    $scope.addAndy = function() {
    	var element = angular.element(document.querySelector("#results"));
    	element.append('hi<br/>');

        var template = blankHtml;
    	console.log(template);
    	console.log("cwd: " + $scope);

    	$scope.htmlToAdd += $scope;

    	$scope.htmlToAdd = 'hi<br>';
    	$scope.htmlToAdd += template;
    }
}]);
