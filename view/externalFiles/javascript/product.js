$(document).ready(function(){
	var getProductName = function(){
		var url = window.location.href;
		try{
			var query = url.split("?")[1];
			var params = query.split("&")
			for(var i = 0; i < params.length; i++){
				var param = params[i];
				var splitted = param.split("=");
				var paramName = splitted[0];
				var paramVal = splitted[1];
				if(paramName == "productName")
					return paramVal.replace("%20", " ");
			}
			return "";
		} catch (err){
			console.log(err);
			return "";
		}
	}

	var addPost = function(post){
		var postList = $("#postList");

		var postLink = $("<a class='list-group-item list-group-item-action'></a>")
		var age = $("<small>5 months ago</small>")
		var title = $("<h3 class='mb-0'>" + post.title + "</h3>")
		var warningThing = $("<span class='badge badge-warning'>Form</span>")
		var user = $("<small class='font-weight-bold text-secondary'>     @" + post.user_id + "</small>")
		var body = $("<div class='row'></div>")
		var upvotes = $("<div class='col-xl-1 text-center'><p>&#9650;</p><p>" + post.upvotes + "</p><p>&#9660</p></div>");
		var postText = $("<div class='col-xl-11'><p>" + post.description + "</p></div>")
		var comments = $("<div class='alert alert-info'>2.3k Comments</div>");

		postLink.append(age)
		postLink.append(title);
		postLink.append(warningThing);
		postLink.append(user);
		body.append(upvotes);
		body.append(postText)
		postLink.append(body);
		postLink.append(comments);
		postList.append(postLink)
	}

	var app = {
		productName: ko.observable(),
		productId: ko.observable()
	}

	app.imageSource = ko.computed(function(){
		return "/resources/phones/" + app.productName() + ".png"
	})

	app.productName.subscribe(function(data){
		document.title = data;
	})

	app.productName(getProductName());
	$.get("/GetProductId", {productName: app.productName()}, function(data){
		app.productId(data);
		$.get("/bugreports", {productId: data}, function(bugReports){
			bugReports.forEach(function(report){
				addPost(report)
			})
		}).fail(function(err){
			alert("Cannot get bug reports")
		})
	}).fail(function(err){
		alert("cannot get productId")
	})

	ko.applyBindings(app);
});


