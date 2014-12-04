/*
    app.js, main Angular application script
    define your module and controllers here
*/

"use strict";

//this is the base URL for all review objects managed by your application
//requesting this with a GET will get all reviews objects
//sending a POST to this will insert a new review object
//sending a PUT to this URL + '/' + review.objectId will update an existing review
//sending a DELETE to this URL + '/' + review.objectId will delete an existing review
var reviewsUrl = 'https://api.parse.com/1/classes/reviews';

angular.module('ReviewsApp', ['ui.bootstrap'])
	.config(function($httpProvider) {
		$httpProvider.defaults.headers.common['X-Parse-Application-Id'] = 'Dc9yfW40IqtQ0b1XnVbuWoEbO9JYKRJJoVBERUEd';
        $httpProvider.defaults.headers.common['X-Parse-REST-API-Key'] = 'HIyx2DS2pJLInWOKT8kTo4rpA5PWHvW0TF5Z0jhi';
	})

	.controller('ReviewsController', function($scope, $http, $filter) {
		$scope.refreshReviews = function() {
			$scope.loading = true;
			//get all review objects saved by my application on Parse.com
			$http.get(reviewsUrl)
				.success(function(data) {
					//Parse.com returns an object with one property called 'results'
					//that contains an array of all review objects 
					$scope.reviews = $filter('orderBy')(data.results, 'votes', true); 
				})
				.error(function(err) {
					$scope.errorMessage = err; 
				})
				.finally(function() {
					$scope.loading = false; 
				})
		}

		$scope.refreshReviews();

		$scope.newReview = {
			votes: 0
		};

		//function to add a new review to the list 
		$scope.addReview = function() {
			$scope.inserting = true;

			//POST will add (insert) a new item to the class 
			$http.post(reviewsUrl, $scope.newReview) 
				.success(function(responseData) {
					//Parse.com will return the new objectID in the response data
					//copy that to the review we just inserted 
					$scope.newReview.objectId = responseData.objectId; 

					//add that review to review list
					$scope.reviews.push($scope.newReview);

					//reset newReview to clear the form 
					$scope.newReview = {votes: 0};

				})
				.error(function(err) {
					$scope.errorMessage = err;
				})
				.finally(function() {
					$scope.inserting = false;
				});
		};

		$scope.incrementVotes = function(review, amount) {
			$scope.updating = true;
			if (review.votes > 0 || (review.votes == 0 && amount == 1)) {
				$http.put(reviewsUrl + '/' + review.objectId, {
					votes : {
						__op: 'Increment',
						amount: amount
					}
				})
					.success(function(data) {
						review.votes = data.votes;
					})
					.error(function(error) {
						console.log(error);
					})
					.finally(function() {
						$scope.updating = false;
					})
				}
			
		};

		$scope.deletePost = function(review) {
			$http.delete(reviewsUrl + '/' + review.objectId)
				.success(function(data) {
					$scope.refreshReviews();
				})
				.error(function(err) {
					$scope.errorMessage = err;
				})
		};
	});