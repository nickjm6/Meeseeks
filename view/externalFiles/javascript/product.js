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
		var article = $("#posts");
		var section = $("<section></section>")
		var header = $("<h3>" + post.title + "</h3>");
		var description = $("<p>" + post.description + "</p>");

		section.append(header)
		section.append(description);
		article.append(section);
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
				// addPost(report)
			})
		}).fail(function(err){
			alert("Cannot get bug reports")
		})
	}).fail(function(err){
		alert("cannot get productId")
	})

	ko.applyBindings(app);
});