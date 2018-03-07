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

	var submitPost = function(){
		var title = $("input[name='title']").val();
		var description = $("textarea[name='bugDescription']").val();
		var productId = app.productId();
		var postType = $("#buttonGroup > button.active").val();
		if(title === undefined || title === ""){
			alert("Title is Required!")
			return;
		}
		if(description === undefined || description === ""){
			alert("Description is Required!");
			return;
		}
		if(postType === undefined){
			alert("Please specify either 'Form' or 'Function' for Post Type")
			return;
		}
		$.post("/bugReport", 
			{title: title, bugDescription: description, productId: productId,  postType: postType}, function(data){
			$.get("/bugReport", {bugId: data}, function(bug){addPost(bug)});
			$("#dismiss").click();
		}).fail(function(err){
			console.dir(err)
			alert(err.responseText);
		});
	}

	$("#postSubmit").click(function(){
		submitPost();
	})

	var app = {
		productName: ko.observable(),
		productId: ko.observable(),
		formOrFunction: ko.observable()
	}

	$("#newBug").click(function(){
		$("#buttonGroup > button").removeClass("active")
	})

	$("#buttonGroup > button").click(function(btn){
		app.formOrFunction($(this).val());
		$("#buttonGroup > button").removeClass("active");
		$(this).addClass("active")
	})

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
			bugReports.forEach(function(reportId){
				$.get("/bugReport", {bugId: reportId}, function(report){addPost(report)})
			})
		}).fail(function(err){
			alert("Cannot get bug reports")
		})
	}).fail(function(err){
		alert("cannot get productId")
	})

	ko.applyBindings(app);
});


