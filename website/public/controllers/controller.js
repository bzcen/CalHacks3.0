var charityStatement = angular.module('charityStatement', ['ngSanitize']);

charityStatement.controller('CharityCtrl', ['$scope', '$http', '$sce', '$templateCache',
						 function($scope, $http, $sce, $templateCache) {
    console.log("Controller functional");

    $scope.addAndy = function() {
    	console.log("Adding an andy");
    	var element = angular.element(document.querySelector("#results"));
    	element.append('hi<br/>');

    	console.log("element: " + element);

    	var template = $templateCache.get('https://andygu.me/files/result_element.html')
    	console.log(template);
    	console.log("cwd: " + $scope);

    	$scope.htmlToAdd += $scope;

    	$scope.htmlToAdd = 'hi<br>';
    	$scope.htmlToAdd += template;
    }
}]);
