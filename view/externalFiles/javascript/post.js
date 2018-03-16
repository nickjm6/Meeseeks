$(document).ready(function(){
	//KO variables that the page will use
	var bugDetails = {
		bugId: ko.observable(),
		bugTitle: ko.observable(),
		productName: ko.observable(),
		imageSource: ko.observable(),
		howLongAgo: ko.observable(),
		posterName: ko.observable(),
		upvotes: ko.observable(),
		bugDescription: ko.observable(),
		hasUpvotedBug: ko.observable(),
		isLoggedIn: ko.observable(),
		badgeClass: ko.observable(),
		badgeText: ko.observable(),
		commentList: ko.observableArray()
	};

	//Adds a comment to the list of comments
	var addAlertDontRemove = function(msg){
		removeAlerts();
		var alert = $("<div class='alert alert-danger dontremoveyet'>" + msg + "</div>");
		$("#alertDiv").append(alert);
	}

	var Comment = function(input){
		var self = this;

		this.id = input.id;
		this.hasUpvoted = ko.observable(input.hasUpvoted)
		this.age = input.timeSince;
		this.username = input.username;
		this.commentText = input.commentText;
		this.numUpvotes = ko.observable(input.upvotes);
		this.upvoteText = ko.computed(function(){
			return self.numUpvotes() === 1 ? "1 Upvote" : self.numUpvotes() + " Upvotes";
		});

		this.upvoteButtonClass = ko.computed(function(){
			return self.hasUpvoted() ? "btn btn-danger" : "btn btn-success";
		})
		this.upvoteButtonText = ko.computed(function(){
			return self.hasUpvoted() ? "Remove Upvote" : "Upvote";
		})

		this.upvoteFunction = function(){
			var path = self.hasUpvoted() ? "remove-upvote-post" : "upvote-post"
			$.post(path, {postId: self.id, postType: "comment"}, function(result){
				self.numUpvotes(parseInt(result));
				self.hasUpvoted(!self.hasUpvoted())
			}).fail(function(err){
				addAlert(err.responseText, "danger")
			})
		}
		this.isUpvoteButtonVisible = ko.computed(function(){
			return bugDetails.isLoggedIn();
		})
	}

	bugDetails.upvoteFunction = function(){
		var path = bugDetails.hasUpvotedBug() ? "remove-upvote-post" : "upvote-post";
		$.post(path, {postId: bugDetails.bugId(), postType: "bug"}, function(result){
			bugDetails.upvotes(parseInt(result));
			bugDetails.hasUpvotedBug(!bugDetails.hasUpvotedBug());
		}).fail(function(err){
			addAlert(err.responseText, "danger");
		})
	}

	bugDetails.upvoteText = ko.computed(function(){
		return bugDetails.upvotes() === 1 ? "1 Upvote" : bugDetails.upvotes() + " Upvotes"
	})

	bugDetails.upvoteButtonClass = ko.computed(function(){
		return bugDetails.hasUpvotedBug() ? "btn btn-danger" : "btn btn-success"
	});

	bugDetails.upvoteButtonText = ko.computed(function(){
		return bugDetails.hasUpvotedBug() ? "Remove Upvote" : "Upvote"
	})
	
	bugDetails.productPath = ko.computed(function(){
		return "/product?productName=" + bugDetails.productName();
	})

	bugDetails.productName.subscribe(function(name){
		bugDetails.imageSource("/resources/phones/" + bugDetails.productName() + ".png");
	})

	bugDetails.bugId(getURLParam("bugId"));

	//Gets info on the bug report
	$.get("/bugReport", {bugId: bugDetails.bugId()}, function(bug){
		document.title = bug.title;
		bugDetails.hasUpvotedBug(bug.hasUpvoted)
		bugDetails.bugTitle(bug.title);
		bugDetails.bugDescription(bug.description);
		bugDetails.productName(bug.product);
		var badgeClass = bug.post_type === "form" ? "badge badge-warning" : "badge badge-danger";
		var badgeText = bug.post_type === "form" ? "Form" : "Function";
		bugDetails.badgeClass(badgeClass);
		bugDetails.badgeText(badgeText)
		bugDetails.posterName(bug.username);
		bugDetails.upvotes(bug.upvotes);
		bugDetails.howLongAgo(bug.timeSince);
	}).fail(function(err){
		addAlert(err.responseText, "danger", false);
	});

	$.get("/comments", {bugId: bugDetails.bugId}, function(comments){
		comments.forEach(function(commentId){
			$.get("/comment", {commentId: commentId}, function(comment){
				bugDetails.commentList.push(new Comment(comment))
			}).fail(function(err){
				addAlert(err.responseText, "danger", false)
			});
		});
	}).fail(function(err){
		addAlert(err.responseText, "danger", false);
	});

	$.get("/isLoggedIn", function(result){bugDetails.isLoggedIn(result)}).fail(function(err){bugDetails.isLoggedIn(false)});

	$("#submitComment").click(function(){
		var description = $("#commentDescription").val();
		if(description == undefined || description === ""){
			addAlertDontRemove("Comment text is required", "danger");
			return;
		}
		$.post("/comment", {comment: description, bugId: bugDetails.bugId()}, function(response){
			$.get("/comment", {commentId: response}, function(comment){
				bugDetails.commentList.push(new Comment(comment))
				addAlert("Successfully added comment!", "success")
			}).fail(function(err){
				addAlert(err.responseText, "danger", false)
			})
		}).fail(function(err){
			console.log(err);
			addAlert(err.responseText, "danger")
		})
	});

	ko.applyBindings(bugDetails);
});