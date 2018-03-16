$(document).ready(function(){
	//KO variable for the page
	var app = {
		productName: ko.observable(),
		productId: ko.observable(),
		formOrFunction: ko.observable(),
		isLoggedIn: ko.observable(),
		posts: ko.observableArray()
	}

	//adds alert to the modal
	var addPostAlert = function(msg, dontremove=true){
		debugger;
		removeAlerts();
		var alert = $("<div class='alert alert-danger'>" + msg + "</div>");
		if(dontremove)
			alert.addClass("dontremoveyet");
		else
			alert.addClass("alert-dismissable")
		$("#modalAlertDiv").append(alert)
	}

	var post = function(input){
		var self = this;

		this.id = input.id;
		this.age = input.timeSince;
		this.title = input.title;
		this.username = input.username;
		this.description = input.description;
		this.numComments = input.comments;
		this.commentText = this.numComments === 1 ? "1 Comment" : this.numComments + " Comments"; 
		this.numUpvotes = ko.observable(input.upvotes);
		this.upvoteText = ko.computed(function(){
			return self.numUpvotes() === 1 ? "1 Upvote" : self.numUpvotes() + " Upvotes";
		})
		this.badgeClass = input.post_type === "form" ? "badge badge-warning" : "badge badge-danger";
		this.badgeText = input.post_type === "form"? "Form" : "Function";

		this.hasUpvoted = ko.observable(input.hasUpvoted);
		this.upvoteButtonText = ko.computed(function(){
			return self.hasUpvoted() ? "Remove Upvote" : "Upvote"
		});
		this.upvoteButtonClass = ko.computed(function(){
			return self.hasUpvoted() ? "btn btn-danger" : "btn btn-success"
		});

		this.isUpvoteButtonVisible = ko.computed(function(){
			return app.isLoggedIn();
		});

		this.upvoteRequest = ko.computed(function(){
			return self.hasUpvoted() ? "remove-upvote-post" : "upvote-post";
		});

		this.upvoteFunction = function(){
			$.post(self.upvoteRequest(), {postId: self.id, postType: "bug"}, function(result){
				self.numUpvotes(result);
				self.hasUpvoted(!self.hasUpvoted())
			}).fail(function(err){
				addAlert(err.responseText, "danger");
			})
		}

		this.linkLocation = "/post?bugId=" + input.id;
	}


	//Tries to submit a post to the backend
	submitPost = function(){
		var title = $("input[name='title']").val();
		var description = $("textarea[name='bugDescription']").val();
		var productId = app.productId();
		var postType = $("#buttonGroup > button.active").val();
		if(title === undefined || title === ""){
			addPostAlert("Title is Required!");
			return;
		}
		if(description === undefined || description === ""){
			addPostAlert("Description is Required!");
			return;
		}
		if(postType === undefined){
			addPostAlert("Please specify either 'Form' or 'Function' for Post Type")
			return;
		}
		$.post("/bugReport", 
			{title: title, bugDescription: description, productId: productId,  postType: postType}, function(data){
			$.get("/bugReport", {bugId: data}, function(bug){app.posts.unshift(new post(bug))});
			$("#dismiss").click();
			addAlert("Successfully added bug report!", "success");
		}).fail(function(err){
			addPostAlert(err.responseText, false);
		});
	}

	app.imageSource = ko.computed(function(){
		return "/resources/phones/" + app.productName() + ".png"
	})

	app.productName.subscribe(function(data){
		document.title = data;
	})

	app.productName(getURLParam("productName"));

	$.get("/GetProductId", {productName: app.productName()}, function(data){
		app.productId(data);
		$.get("/bugreports", {productId: data}, function(bugReports){
			bugReports.forEach(function(reportId){
				$.get("/bugReport", {bugId: reportId}, function(report){app.posts.push(new post(report))}).fail(function(err)
					{addAlert(err.responseText, "danger", false)})
			})
		}).fail(function(err){
			addAlert(err.responseText, "danger", false)
		});
	}).fail(function(err){
		addAlert(err.responseText, "danger", false)
	});

	$.get("/isLoggedIn", function(result){
		app.isLoggedIn(result);
	}).fail(function(err){app.isLoggedIn(false)})

	//resets form/function values when reopening the modal
	$("#newBug").click(function(){
		$("#buttonGroup > button").removeClass("active");
	});

	//sets form or function value based on which one was clicked last
	$("#buttonGroup > button").click(function(btn){
		app.formOrFunction($(this).val());
		$("#buttonGroup > button").removeClass("active");
		$(this).addClass("active")
	});

	// submits the form
	$("#postSubmit").click(function(){
		submitPost();
	});

	ko.applyBindings(app);
});


