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
		var postList = $("#postList");

		var postLink = $("<a class='bug-list list-group-item list-group-item-action'></a>")
		var age = $("<small>" + post.timeSince + "</small>")
		var title = $("<h3 class='mb-0'>" + post.title + "</h3>")
		var warningThing = $("<span class='badge'></span>")
		var user = $("<small class='font-weight-bold text-secondary'>" + post.username + "</small>")
		var body = $("<div class='row'></div>")
		var upvotes = $("<div class='col-xl-1 text-center'><p>&#9650;</p><p>" + post.upvotes + "</p><p>&#9660</p></div>");
		var postText = $("<div class='col-xl-11'><p>" + post.description + "</p></div>")
		var comments = $("<div class='alert alert-info'>" + post.comments + "</div>");

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
		body.append(upvotes);
		body.append(postText)
		postLink.append(body);
		postLink.append(comments);
		postList.prepend(postLink)

		postLink.attr("href", "/post?bugId=" + post.id)
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
		formOrFunction: ko.observable()
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


