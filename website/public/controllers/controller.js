var charityStatement = angular.module('charityStatement', ['ngSanitize']);

var blankHtml = "<div class=\"col-md-12\" style=\"margin-top: 5px; margin-bottom: 5px;\"><div class=\"media\"><a class=\"media-left waves-light\"></a><div class=\"media-body\"><h4 class=\"media-heading\">John Doe</h4><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi cupiditate temporibus iure soluta. Quasi mollitia maxime nemo quam accusamus possimus, voluptatum expedita assumenda. Earum sit id ullam eum vel delectus!</p></div></div></div>"

charityStatement.controller('CharityCtrl', ['$scope', '$http', '$sce', '$templateCache',
						 function($scope, $http, $sce, $templateCache) {

    $scope.addAndy = function() {
        console.log("Add Element called");
    	var element = angular.element(document.querySelector("#results"));
    	element.append('<br/>');
        //$scope.htmlToAdd += $scope;
        $scope.htmlToAdd += '<br>';
    	$scope.htmlToAdd += blankHtml;
    }
}]);
