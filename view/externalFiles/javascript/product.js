$(document).ready(function(){

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

	//Adds a post to the page
	var addPost = function(post){
		var hasUpvoted = post.hasUpvoted

		var postList = $("#postList");
		var postLink = $("<a class='bug-list list-group-item list-group-item-action'></a>")
		var age = $("<small>" + post.timeSince + "</small>")
		var title = $("<h3 class='mb-0'>" + post.title + "</h3>")
		var warningThing = $("<span class='badge'></span>")
		var user = $("<small class='font-weight-bold text-secondary'>" + post.username + "</small>")
		var body = $("<div class='row'></div>")
		var postText = $("<div class='col-xl-11'><p>" + post.description + "</p></div>")
		var commentsAndUpvotes = $("<div class='alert alert-info'></div>");
		var comments = $("<span>" + post.comments + "</span><br>");
		var upvotes = $("<span>" + post.upvotes + "</span>");
		var upvoteSection = $("<div class='list-group-item'></div>");
		var upvoteButton = $("<button class='btn'></button>");

		if(post.hasUpvoted){
			upvoteButton.addClass("btn-danger");
			upvoteButton.text("Remove Upvote");
		} else{
			upvoteButton.addClass("btn-success");
			upvoteButton.text("Upvote");
		}

		if(post.post_type === "form"){
			warningThing.addClass("badge-warning");
			warningThing.text("Form")
		} else if(post.post_type === "function"){
			warningThing.addClass("badge-danger");
			warningThing.text("Function")
		}

		postLink.append(age)
		postLink.append(title);
		postLink.append(warningThing);
		postLink.append(user);
		body.append(postText)
		postLink.append(body);
		commentsAndUpvotes.append(comments)
		commentsAndUpvotes.append(upvotes);
		postLink.append(commentsAndUpvotes);
		upvoteSection.append(upvoteButton);
		if(app.isLoggedIn())
			postList.prepend(upvoteSection)
		postList.prepend(postLink)

		postLink.attr("href", "/post?bugId=" + post.id)

		var removeUpvote = function(){
			$.post("/remove-upvote-bug", {bugId: post.id}, function(newUpvotes){
				upvotes.text(newUpvotes);
				hasUpvoted = false;
				upvoteButton.removeClass("btn-danger");
				upvoteButton.addClass("btn-success");
				upvoteButton.text("Upvote")
			}).fail(function(err){
				addAlert(err.responseText, "danger")
			});
		}

		var upvote = function(){
			$.post("/upvote-bug", {bugId: post.id}, function(newUpvotes){
				upvotes.text(newUpvotes);
				hasUpvoted = true;
				upvoteButton.removeClass("btn-success");
				upvoteButton.addClass("btn-danger");
				upvoteButton.text("Remove Upvote")
			}).fail(function(err){
				addAlert(err.responseText, "danger")
			});
		}

		upvoteButton.click(function(){
			if(hasUpvoted)
				removeUpvote();
			else
				upvote();
		})
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
			$.get("/bugReport", {bugId: data}, function(bug){addPost(bug)});
			$("#dismiss").click();
			addAlert("Successfully added bug report!", "success");
		}).fail(function(err){
			addPostAlert(err.responseText, false);
		});
	}

	//KO variable for the page
	var app = {
		productName: ko.observable(),
		productId: ko.observable(),
		formOrFunction: ko.observable(),
		isLoggedIn: ko.observable()
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
				$.get("/bugReport", {bugId: reportId}, function(report){addPost(report)}).fail(function(err)
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


