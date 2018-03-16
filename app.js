//-----------import necessary dependancies-----------------------------
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

//---------------------------------------------------------------------

//-----------set up mongo server--------------------------------------
var mongoDB = config.mongoAddr;
mongoose.connect(mongoDB);
//--------------------------------------------------------------------

//--------------set up app--------------------------------------------
var app = express();
app.use(express.static(__dirname + "/view/externalFiles"));
app.use(cookieParser());
app.use(session({
	secret: "shrimplypibbles2"
}));
app.use(passport.initialize());
app.use(passport.session())
app.use(bodyParser.urlencoded({ extended: false }));

//-----------------------------------------------------------------------

//--------------GET page requests---------------------------------------
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

//---------------------------------------------------------------------

//------------------------GET info requests---------------------------
//Lets the user know if they are logged in or not
app.get("/isLoggedIn", function(req, res){
	res.send(req.isAuthenticated());
})

//______________________GET Product information___________________
//This will get the id of a product based on the name you give it
app.get("/getProductId", function(req, res){
	if(req.query.productName){
		dbAccess.getProduct(req.query.productName, function(err, productID){
			if(err){
				res.status(500).send(err.message)
			}
			else
				res.send(productID);
		})
	} else{
		res.status(400).send("Oops, you need to tell me what the product name is")
	}
})

//This will get a list of all of the products stored in the DB
app.get("/products", function(req, res){
	dbAccess.getProducts(function(err, products){
		if(err) res.status(500).send(err.message);
		else res.send(products);
	})
})

//______________________________________________________________________

//_____________________GET info on bug reports__________________________

//This will return a list of ids of bug reports based on the product ID that is given
app.get("/bugReports", function(req, res){
	if(req.query.productId){
		dbAccess.getBugReports(req.query.productId, function(err, reports){
			if(err)
				res.status(500).send(err.message);
			else 
				res.send(reports)
		})
	} else{
		res.status(400).send("Oops, you have not provided me with a product ID")
	}
});

//This will return crucial info about a bug report based on the id you give it
app.get("/bugReport", function(req, res){
	var userId = req.user ? req.user._id : undefined;
	if(req.query.bugId){
		dbAccess.getBug(req.query.bugId, userId, function(err, bug){
			if(err)
				res.status(500).send(err.message);
			else
				res.send(bug);
		})
	}else{
		res.status(400).send("Oops, you have not provided me with a bug ID")
	}
});


//______________________________________________________________________

//______________GET comment information________________________________

//Returns a list of comments based on the Bug Id that is given
app.get("/comments", function(req, res){
	if(req.query.bugId){
		dbAccess.getComments(req.query.bugId, function(err, comments){
			if(err)
				res.status(500).send(err.message);
			else 
				res.send(comments)
		})
	} else
		res.status(400).send("Oops, you have not provided me with a bug ID")
})

//Returns crucial info about a comment based on the comment ID that is given
app.get("/comment", function(req, res){
	var userId = req.user ? req.user._id : undefined;
	if(req.query.commentId){
		dbAccess.getComment(req.query.commentId, userId, function(err, comment){
			if(err) res.status(500).send(err.message);
			else res.send(comment);
		})
	} else{
		res.status(400).send("Oops, you have not provided me with a comment ID");
	}
})

//________________________________________________________________________________
//--------------------------------------------------------------------------------

//---------------------------passport GET requests--------------------------------
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

//---------------------------------------------------------------------------------------

//This method will log the user out
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

//---------------------------------------------------------------------------------------

//--------------------POST requests----------------------------------------------------

//This will post a bug report. Make sure to supply it a description, a Product Id, a Title, and a Post Type(Form or Function)
//Also make sure that you are logged in.
app.post("/bugreport", function(req, res){
	if(!req.isAuthenticated()){
		res.status(400).send("Please log in before posting a bug report!");
		return;
	}

	var userId = req.user._id;
	var title = req.body.title;
	var description = req.body.bugDescription;
	var productId = req.body.productId;
	var postType = req.body.postType;

	if(!title){
		res.status(400).send("Please send a title for the bug report!");
		return;
	}
	if(!description){
		res.status(400).send("Please send a description of the bug report!");
		return;
	}
	if(!productId){
		res.status(400).send("Please send a product ID corresponding to the bug report!");
		return;
	}
	if(postType !== "form" && postType !== "function"){
		res.status(400).send("Please either send 'form' or 'function' for postType!");
		return;
	}

	dbMod.addBug(title, description, userId, productId, postType, function(err, bug){
		if(err){
			console.log(err.description);
			res.status(500).send(err.description)
		} else{
			res.send(bug);
		}
	});
});

//THis will post a comment. Please make sure you are logged in and you supply a description and a Bug Id
app.post("/comment", function(req, res){
	if(!req.isAuthenticated()){
		res.status(400).send("Please log in before posting a comment!");
		return;
	}
	
	var userId = req.user._id;
	var description = req.body.comment;
	var bugId = req.body.bugId;

	if(!description){
		res.status(400).send("Make sure you send the text of comment!");
		return;
	}

	if(!bugId){
		res.status(400).send("Please provide me with a Bug ID!");
		return;
	}

	dbMod.addComment(bugId, userId, description, function(err, comment){
		if(err){
			res.status(500).send(err.description);
		} else{
			res.send(comment);
		}
	})
});

//This will upvote a comment. Please make sure you are logged in and you supply a comment ID
app.post("/upvote-post", function(req, res){
	if(!req.isAuthenticated()){
		res.status(400).send("Please log in before upvoting a comment!");
		return;
	}

	var userId = req.user._id;
	var postId = req.body.postId;
	var postType = req.body.postType;

	if(!postId){
		res.status(400).send("Please provide me with a post ID!");
		return;
	}

	if(!postType){
		res.status(400).send("Is it a bug or comment?!");
		return;
	}
	
	dbMod.upvote(userId, postId, postType, function(err, response){
		if(err){
			res.status(500).send(err.message);
		} else{
			res.send(response.toString());
		}
	});
});

app.post("/remove-upvote-post", function(req, res){
	if(!req.isAuthenticated()){
		res.status(400).send("Please log in before trying to remove an upvote!")
		return;
	}

	var postId = req.body.postId;
	var userId = req.user._id;
	var postType = req.body.postType;

	if(!postId){
		res.status(400).send("Please provide me with a post ID");
		return;
	}

	if(!postType){
		res.status(400).send("Is it a bug or comment?!");
		return;
	}

	dbMod.removeUpvote(userId, postId, postType, function(err, response){
		if(err) res.status(500).send(err.message);
		else res.send(response.toString());
	});
});

//-----------------------------------------------------------------------------------------

//Finally this will start the server
app.listen(8080, function(){
	console.log("server started")
})