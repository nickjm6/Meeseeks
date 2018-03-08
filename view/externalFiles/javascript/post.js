$(document).ready(function(){
	//parses the URL to get the URL
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

	//Adds a comment to the list of comments
	var addComment = function(comment){
		var list = $("#postList");
		var listItem = $("<li class='list-group-item'></li>");
		var age = $("<small>" + comment.timeSince + "</small>");
		var username = $("<small class='font-weight-bold text-secondary'>" + comment.username + "</small>");
		var commentText = $("<p>" + comment.commentText + "</p>")
		var upvotes = $("<p>&#9650; " + comment.upvotes + "&#9660;</p>"); 
		list.append(listItem);
		listItem.append(age);
		listItem.append(username);
		listItem.append(commentText);
		listItem.append(upvotes);
	}

	//KO variables that the page will use
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

	//Gets info on the bug report
	$.get("/bugReport", {bugId: app.bugId()}, function(bug){
		document.title = bug.title;
		app.bugTitle(bug.title);
		app.bugDescription(bug.description);
		app.productName(bug.product);
		if(bug.post_type === "form")
			$("#postTypeBadge").addClass("badge-warning").text("Form")
		else
			$("#postTypeBadge").addClass("badge-danger").text("Function")

		app.posterName(bug.username);
		app.upvotes(bug.upvotes);
		app.howLongAgo(bug.timeSince);
	}).fail(function(err){
		alert(err.responseText);
	});

	$.get("/comments", {bugId: app.bugId}, function(comments){
		comments.forEach(function(commentId){
			$.get("/comment", {commentId: commentId}, function(comment){
				addComment(comment);
			}).fail(function(err){
				alert(err.responseText)
			});
		});
	}).fail(function(err){
		alert(err.responseText);
	});

	$("#submitComment").click(function(){
		var description = $("#commentDescription").val();
		$.post("/comment", {comment: description, bugId: app.bugId()}, function(response){
			$.get("/comment", {commentId: response}, function(comment){addComment(comment);})
		}).fail(function(err){
			console.log(err);
			alert(err.responseText)
		})
	});


	ko.applyBindings(app);
});