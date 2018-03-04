$(document).ready(function(){
	var getBugId = function(){
		var url = window.location.href;
		try{
			var query = url.split("?")[1];
			var params = query.split("&")
			for(var i = 0; i < params.length; i++){
				var param = params[i];
				var splitted = param.split("=");
				var paramName = splitted[0];
				var paramVal = splitted[1];
				if(paramName == "bugId")
					return paramVal;
			}
			return "";
		} catch (err){
			console.log(err);
			return "";
		}
	}

	var app = {
		bugId: ko.observable(),
		bugTitle: ko.observable(),
		productName: ko.observable(),
		imageSource: ko.observable(),
		howLongAgo: ko.observable(),
		posterName: ko.observable(),
		upvotes: ko.observable(),
		bugDescription: ko.observable()
	};

	app.productPath = ko.computed(function(){
		return "/product?productName=" + app.productName();
	})

	app.productName.subscribe(function(name){
		app.imageSource("/resources/phones/" + app.productName() + ".png");
	})

	app.bugId(getBugId());

	$.get("/bugReport", {bugId: app.bugId()}, function(bug){
		document.title = bug.title;
		app.bugTitle(bug.title);
		$.get("/getProductName", {productId: bug.product_id}, function(productName){
			app.productName(productName)
		})

		$.get("/getUserById", {userId: bug.user_id}, function(username){
			app.posterName("@" + username)
		}).fail(function(err){
			alert(err.description)
		})

		if(bug.post_type === "form")
			$("#postTypeBadge").addClass("badge-warning").text("Form")
		else
			$("#postTypeBadge").addClass("badge-danger").text("Function")

		app.bugDescription(bug.description);
		app.upvotes(bug.upvotes);
	})

	$.get("/TimeSinceBugReport", {bugId: app.bugId()}, function(timeSince){
		app.howLongAgo(timeSince + " Ago");
	})

	ko.applyBindings(app);
});