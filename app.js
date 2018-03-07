//import necessary dependancies
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var passport = require("passport");

var config = require("./config/config");

var dbMod = require("./config/dbConfig/dbMod");
var dbAccess = require("./config/dbConfig/dbAccess")

require("./config/passport")(passport)


//set up mongo server
var mongoDB = config.mongoAddr;
mongoose.connect(mongoDB);

//set up app
var app = express();
app.use(express.static(__dirname + "/view/externalFiles"));
app.use(cookieParser());
app.use(session({
	secret: "shrimplypibbles2"
}));
app.use(passport.initialize());
app.use(passport.session())
app.use(bodyParser.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded

//get page requests
app.get("/", function(req, res){
	res.sendFile(__dirname + "/view/index.html");
})

app.get("/login", function(req, res){
	res.sendFile(__dirname + "/view/login.html")
})

app.get("/product", function(req, res){
	res.sendFile(__dirname + "/view/product.html");
})

app.get("/post", function(req, res){
	res.sendFile(__dirname + "/view/post.html");
})

//get info requests
app.get("/isLoggedIn", function(req, res){
	res.send(req.isAuthenticated());
})

app.get("/getProductId", function(req, res){
	if(req.query.productName){
		dbAccess.getProduct(req.query.productName, function(err, product){
			if(err){
				console.log(err)
				res.status(500).send(err.description)
			}
			else
				res.send(product["_id"]);
		})
	} else{
		res.status(500).send("Oops, you need to tell me what the product name is")
	}
})

app.get("/getProductName", function(req, res){
	if(req.query.productId){
		dbAccess.getProductById(req.query.productId, function(err, productName){
			if(err)
				res.status(500).send(err);
			else
				res.send(productName);
		})
	}else{
		res.status(400).send("Oops, you have not provided me with a product ID")
	}
})

app.get("/products", function(req, res){
	dbAccess.getProducts(function(err, products){
		if(err) res.status(500).send(err);
		else res.send(products);
	})
})

app.get("/bugReports", function(req, res){
	if(req.query.productId){
		dbAccess.getBugReports(req.query.productId, function(err, reports){
			if(err)
				res.status(500).send(err.description);
			else 
				res.send(reports)
		})
	} else{
		res.status(400).send("Oops, you have not provided me with a product ID")
	}
});

app.get("/bugReport", function(req, res){
	if(req.query.bugId){
		dbAccess.getBug(req.query.bugId, function(err, bug){
			if(err)
				res.status(500).send(err);
			else
				res.send(bug);
		})
	}else{
		res.status(400).send("Oops, you have not provided me with a bug ID")
	}
});

app.get("/comments", function(req, res){
	if(req.query.bugId){
		dbAccess.getComments(req.query.bugId, function(err, comments){
			if(err)
				res.status(500).send(err.description);
			else 
				res.send(comments)
		})
	} else
		res.status(400).send("Oops, you have not provided me with a bug ID")
})

app.get("/comment", function(req, res){
	if(req.query.commentId){
		dbAccess.getComment(req.query.commentId, function(err, comment){
			if(err) res.status(500).send(err.description);
			else res.send(comment);
		})
	} else{
		res.status(400).send("Oops, you have not provided me with a comment ID");
	}
})

app.get("/numComments", function(req, res){
	if(req.query.bugId){
		dbAccess.getComments(req.query.bugId, function(err, comments){
			if(err)
				res.status(500).send(err.description);
			else
				res.send(comments.length + "");
		})
	} else{
		res.status(400).send("Oops, you have not provided me with a bug ID")
	}
});

app.get("/getUserById", function(req, res){
	if(req.query.userId){
		dbAccess.getUser(req.query.userId, function(err, username){
			if(err)
				res.status(500).send(err.description)
			else
				res.send(username)
		})
	} else{
		res.status(400).send("You must provide me with a user Id")
	}
});

app.get("/TimeSinceBugReport", function(req, res){
	if(req.query.bugId){
		res.send(dbAccess.getTimeSince(req.query.bugId));
	}
	else{
		res.status(400).send("Oops, you must provide me with a bug Id");
	}
})

//passport get requests
app.get('/auth/facebook', passport.authenticate('facebook', { 
    scope : ['public_profile', 'email']
}));

app.get('/auth/facebook/callback',
	passport.authenticate('facebook', {
        successRedirect : '/',
        failureRedirect : '/login'
}));

// app.get('/auth/google', passport.authenticate('google', { 
//     scope : ['profile', 'email']
// }));

// app.get('/auth/google/callback',
// 	passport.authenticate('google', {
//         successRedirect : '/',
//         failureRedirect : '/login'
// }));

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

//post requests
app.post("/bugreport", function(req, res){
	var description;
	var userId;
	var productId;
	var title;
	var postType
	if(req.body.title && req.body.bugDescription && req.body.productId && req.isAuthenticated() && req.body.postType){
		title = req.body.title;
		description = req.body.bugDescription;
		productId = req.body.productId
		postType = req.body.postType
		userId = req.user["_id"];
		dbMod.addBug(title, description, userId, productId, postType, function(bug){
			res.send(bug)
		});
	} else{
		res.status(500).send("I'm sorry, but you did not provide the proper details or you are not logged in");
	}
})

app.post("/comment", function(req, res){
	var description;
	var userId;
	var bugId;
	if(req.body.comment && req.body.bugId &&  req.isAuthenticated()){
		description = req.body.comment;
		userId = req.user["_id"];
		bugId = req.body.bugId
		dbMod.addComment(bugId, userId, description, function(comment){
			res.send(comment);
		})

	} else{
		res.status(400).send("I'm sorry, but you did not provide the proper details or you are not logged in");
	}
});

app.post("/upvote-comment", function(req, res){
	var commentId;
	var userId;
	if(req.body.commentId && req.isAuthenticated()){
		commentId = req.body.commentId;
		userId = req.user["_id"];
		dbMod.upvoteComment(userId, commentId, function(err, comment){
			if(err)
				res.status(500).send("There was an error: " + err.message);
			else
				res.send("Upvoted Comment")
		})
	} else{
		res.status(400).send("I'm sorry, but you did not provide the proper details or you are not logged in");
	}
});

app.post("/upvote-bug", function(req, res){
	var bugId;
	var userId;
	if(req.body.bugId && req.isAuthenticated()){
		bugId = req.body.bugId;
		userId = req.user["_id"];
		dbMod.upvoteBug(userId, bugId, function(err, bug){
			if(err) 
				res.status(500).send("There was an error: " + err.message);
			else
				res.send("Upvoted Bug Report");
		})
	} else{
		res.status(400).send("I'm sorry, but you did not provide the proper details or you are not logged in");
	}
});

app.listen(8080, function(){
	console.log("server started")
})