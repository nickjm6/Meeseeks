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

	var formatPost = function(post){
		return {
			age: post.timeSince,
			title: post.title,
			badgeClass: post.post_type === "form" ? "badge badge-warning" : "badge badge-danger",
			badgeText: post.post_type === "form" ? "Form" : "Function",
			username: post.username,
			description: post.description,
			comments: post.comments == 1 ? "1 Comment" : post.comments + " Comments",
			upvotes: post.upvotes == 1 ? "1 Upvote" : post.upvotes + " Upvotes",
			upvoteButtonClass: post.hasUpvoted ? "btn btn-danger" : "btn btn-success",
			upvoteButtonText: post.hasUpvoted ? "Remove Upvote" : "Upvote",
			visibleUpvoteButton: app.isLoggedIn,
			linkLoc: "/post?bugId=" + post.id
		}
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
				$.get("/bugReport", {bugId: reportId}, function(report){app.posts.push(formatPost(report))}).fail(function(err)
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


