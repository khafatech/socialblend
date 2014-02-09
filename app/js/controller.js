

/* Controllers */

var socialblendApp = angular.module('socialblendApp', []);


var ajax_result;

var ACCESS_TOKEN = "<instagram access token here>";
var IMGUR_CLIENTID = "<imgur client id here>";

var TWITTER_SECRET;
var TWITTER_KEY;

function process_insta_results(data) {
	var result = [];
	
	for (var i=0; i < data.data.length; i++) {
		post = data.data[i];
		var normalized_post = {};
		normalized_post.url = post.link;
		if (post.caption)
			normalized_post.text = post.caption.text;
		else
			normalized_post.text = "No caption. Just look!";
		normalized_post.pic =  post.images.low_resolution.url;
		normalized_post.created = post.created_time;
		result.push(normalized_post);
	}
	return result;
}

var processed;

var imgur_response;

socialblendApp.controller('PostListCtrl', function($scope, $http) {

	$scope.useImgur = false;

	$scope.doSearch = function(input) {
		console.log("*** input: " + input);
		$scope.searchInstaByTag(input);
	}
	
	$scope.doSearchCategory = function($event) {
		$scope.searchInstaByTag($event.target.innerHTML);
	}

	$scope.posts = [
	/*
					{'url': 'http://insta/test',
					 'text': 'look at my lunch!',
					 'id': 1},
					 
					{'url': 'http://insta/test2',
					 'text': 'look at my dinner!',
					 'id': 2},
					 
					 
					{'url': 'http://twitter/test2',
					 'text': 'I farted!',
					 'id': 3},
					 */
					 
					];
	
	// get save
	// $scope.prop = twitter.get("dogs");
	// console.log("number: " + Number);
	
	
	$scope.searchInstaByTag = function(tag="art", count=5) {
		// query insta
		var url= "https://api.instagram.com/v1/tags/" + tag + "/media/recent?count=" + count + "&access_token=" + ACCESS_TOKEN;
	
		console.log("url: " + url);
		$.ajax({
		   type: 'GET',
			url: url,
			async: false,
			contentType: "application/json",
			dataType: 'jsonp',
			success: function(json) {
			   console.log("get tags success! Got ");
			   $scope.instaPosts = json;
			   ajax_result = json;
			   processed = process_insta_results(json);
			   $scope.posts = processed.concat($scope.posts);
			   // update model
			   $scope.$digest()
			},
			error: function(e) {
			   console.log(e.message);
			}
		});
	}


	$scope.searchInstaPopular = function(count=3) {
		// query insta
		var url= "https://api.instagram.com/v1/media/popular?count=" + count + "&access_token=" + ACCESS_TOKEN;
	
		console.log("url: " + url);
		$.ajax({
		   type: 'GET',
			url: url,
			async: false,
			contentType: "application/json",
			dataType: 'jsonp',
			success: function(json) {
			   console.log("get_insta_popular success! Got ");
			   $scope.instaPosts = json;
			   ajax_result = json;
			   processed = process_insta_results(json);
			   $scope.posts = processed.concat($scope.posts);
			   // update model
			   $scope.$digest()
			},
			error: function(e) {
			   console.log(e.message);
			}
		});
	}
	
	
	
	////// imgur ///////////
	
    var imgurReq = $http.get(
    	 	'https://api.imgur.com/3/gallery/r/funny/top/0',
        	{headers: {'Authorization': 'Client-ID ' + IMGUR_CLIENTID}}
		).success(function (response) {
				console.log("*** imgur got: " + response);
				imgur_response = response;
			
		}).error(function (response, status, headers) {
		      console.log("*** imgur Error! ***: " + response + "\n***Status: " + status);
   	});
	
	
	
	
	
	/////////// init ///////////////
	
	// $scope.searchInstaPopular(5);
	
	// FIXME
	$scope.orderProp = 'age';
	
	
	 // = $scope.posts.concat(processed);
	
	/*
	$.get("https://api.instagram.com/v1/tags/cats/media/recent?q=cats&count=1&access_token=1077730514.1fb234f.d79420046077461ba15d089825b12b56",
		function (data) {
			// console.log(data);
		}).fail(function() {
			console.log( "error" );3
		});
		
	*/

	/*
    var instaReq = $http({method: 'GET', url: 'https://api.instagram.com/v1/tags/cats/media/recent?q=cats&count=1&access_token=1077730514.1fb234f.d79420046077461ba15d089825b12b56'});

	// var instaReq = $http({method: 'GET', url: 'http://localhost:8080/foo'});

    instaReq.success(function (response) {
    	console.log("*** insta: got: " + response);
		
		}).error(function (response, status, headers) {
          // error handling to some meaningful extent
          console.log("*** insta: Error! ***: " + response + "\n***Status: " + status);
   	});

	*/
	

});



socialblendApp.factory('Number', function() {
	return 42;
});



// http://docs.angularjs.org/api/ngResource
socialblendApp.factory('twitter', function ($resource, $http) {
    var consumerKey = encodeURIComponent(TWITTER_KEY);
    var consumerSecret = encodeURIComponent(TWITTER_SECRET);
    var credentials = btoa(consumerKey + ':' + consumerSecret);
    
    console.log("b64 credentials: " + credentials);

    // Twitters OAuth service endpoint
    var twitterOauthEndpoint = $http.post(
    	  'https://api.twitter.com/oauth2/token',
    	  // "http://localhost:8080/foo",
    	  "grant_type=client_credentials",
        {headers: {'Authorization': 'Basic ' + credentials,
        			 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'}}
    );

    twitterOauthEndpoint.success(function (response) {
    	console.log("*** got: " + response);
        // a successful response will return
        // the "bearer" token which is registered
        // to the $httpProvider
        socialblendApp.$httpProvider.defaults.headers.common['Authorization'] = "Bearer " + response.access_token;
		}).error(function (response, status, headers) {
          // error handling to some meaningful extent
          console.log("*** Error! ***: " + response + "\n***Status: " + status);
   	});

    var r = $resource('https://api.twitter.com/1.1/search/:action',
        {action: 'tweets.json',
            count: 10,
        },
        {
         paginate: {method: 'GET'}
        });

    return r;
});



