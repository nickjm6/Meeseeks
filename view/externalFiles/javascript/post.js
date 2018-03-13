$(document).ready(function(){
	//KO variables that the page will use
	var app = {
		bugId: ko.observable(),
		bugTitle: ko.observable(),
		productName: ko.observable(),
		imageSource: ko.observable(),
		howLongAgo: ko.observable(),
		posterName: ko.observable(),
		upvotes: ko.observable(),
		bugDescription: ko.observable(),
		hasUpvotedBug: ko.observable(),
		upvoteText: ko.observable(),
		isLoggedIn: ko.observable()
	};

	//Adds a comment to the list of comments
	var addAlertDontRemove = function(msg){
		removeAlerts();
		var alert = $("<div class='alert alert-danger dontremoveyet'>" + msg + "</div>");
		$("#alertDiv").append(alert);
	}

	var addComment = function(comment){
		var hasUpvoted = comment.hasUpvoted
		var list = $("#postList");
		var listItem = $("<li class='list-group-item'></li>");
		var age = $("<small>" + comment.timeSince + "</small>");
		var username = $("<small class='font-weight-bold text-secondary'>" + comment.username + "</small>");
		var commentText = $("<p>" + comment.commentText + "</p>")
		var upvotes = $("<div class='alert alert-info'>" + comment.upvotes + "</div>"); 
		var upvoteButton = $("<button class='btn'></button>");

		if(hasUpvoted){
			upvoteButton.addClass("btn-danger")
			upvoteButton.text("Remove Upvote")
		} else{
			upvoteButton.addClass("btn-success");
			upvoteButton.text("Upvote")
		}

		var removeUpvote = function(){
			$.post("remove-upvote-comment", {commentId: comment.id}, function(newUpvotes){
				upvotes.text(newUpvotes);
				hasUpvoted = false;
				upvoteButton.removeClass("btn-danger");
				upvoteButton.addClass("btn-success");
				upvoteButton.text("Upvote")
			}).fail(function(err){
				addAlert(err.responseText, "danger");
			})
		}

		var upvote = function(){
			$.post("upvote-comment", {commentId: comment.id}, function(newUpvotes){
				upvotes.text(newUpvotes);
				hasUpvoted = true;
				upvoteButton.removeClass("btn-success");
				upvoteButton.addClass("btn-danger");
				upvoteButton.text("Remove Upvote")
			}).fail(function(err){
				addAlert(err.responseText, "danger");
			})
		}


		upvoteButton.click(function(){
			if(hasUpvoted) removeUpvote();
			else upvote();
		})

		list.append(listItem);
		listItem.append(age);
		listItem.append(username);
		listItem.append(commentText);
		listItem.append(upvotes);
		if(app.isLoggedIn())
			listItem.append(upvoteButton)
	}

	var removeUpvoteBug = function(){
		$.post("remove-upvote-bug", {bugId: app.bugId()}, function(newUpvotes){
			app.upvotes(newUpvotes);
			app.hasUpvotedBug(false);
		}).fail(function(err){
			addAlert(err.responseText, "danger")
		})
	}

	var upvoteBug = function(){
		$.post("upvote-bug", {bugId: app.bugId()}, function(newUpvotes){
			app.upvotes(newUpvotes);
			app.hasUpvotedBug(true);
		}).fail(function(err){
			addAlert(err.responseText, "danger")
		})
	}

	app.productPath = ko.computed(function(){
		return "/product?productName=" + app.productName();
	})

	app.productName.subscribe(function(name){
		app.imageSource("/resources/phones/" + app.productName() + ".png");
	})

	app.hasUpvotedBug.subscribe(function(value){
		if(value){
			app.upvoteText("Remove Upvote");
			$("#upvoteButton").removeClass("btn-success");
			$("#upvoteButton").addClass("btn-danger")
		} else{
			app.upvoteText("Upvote")
			$("#upvoteButton").removeClass("btn-danger");
			$("#upvoteButton").addClass("btn-success")
		}
	})

	app.bugId(getURLParam("bugId"));

	//Gets info on the bug report
	$.get("/bugReport", {bugId: app.bugId()}, function(bug){
		document.title = bug.title;
		app.hasUpvotedBug(bug.hasUpvoted)
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
		addAlert(err.responseText, "danger", false);
	});

	$.get("/comments", {bugId: app.bugId}, function(comments){
		comments.forEach(function(commentId){
			$.get("/comment", {commentId: commentId}, function(comment){
				addComment(comment);
			}).fail(function(err){
				addAlert(err.responseText, "danger", false)
			});
		});
	}).fail(function(err){
		addAlert(err.responseText, "danger", false);
	});

	$.get("/isLoggedIn", function(result){app.isLoggedIn(result)}).fail(function(err){app.isLoggedIn(false)});

	$("#submitComment").click(function(){
		var description = $("#commentDescription").val();
		if(description == undefined || description === ""){
			addAlertDontRemove("Comment text is required", "danger");
			return;
		}
		$.post("/comment", {comment: description, bugId: app.bugId()}, function(response){
			$.get("/comment", {commentId: response}, function(comment){
				addComment(comment);
				addAlert("Successfully added comment!", "success")
			}).fail(function(err){
				addAlert(err.responseText, "danger", false)
			})
		}).fail(function(err){
			console.log(err);
			addAlert(err.responseText, "danger")
		})
	});

	$("#upvoteButton").click(function(){
		var path;
		if(app.hasUpvotedBug()) path = "/remove-upvote-bug";
		else path = "/upvote-bug";

		$.post(path, {bugId: app.bugId()}, function(newUpvotes){
			app.upvotes(newUpvotes);
			app.hasUpvotedBug(!app.hasUpvotedBug());
		}).fail(function(err){
			addAlert(err.responseText, "danger")
		})
	})


	ko.applyBindings(app);
});