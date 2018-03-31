var User = require("./Models/User")
var BugReport = require("./Models/BugReport")
var Product = require("./Models/Product")
var Comment = require("./Models/Comment")
var mongoose = require("mongoose")
var Upvote = require("./Models/Upvote")

//Adds a bug to the database
var addBug = function(title, description, userId, productId, postType, done){
	var newBugReport = new BugReport({_id: mongoose.Types.ObjectId()});
	newBugReport.title = title;
	newBugReport.description = description;
	newBugReport.user_id = userId;
	newBugReport.product_id = productId;
	newBugReport.post_type = postType;
	newBugReport.upvotes = 0;
	newBugReport.save(function(err) {
        if (err) return done(err)
        return done(null, newBugReport._id)
    });
}

//adds a comment to the DB
var addComment = function(bugId, userId, comment, done){
	var newComment = new Comment({_id: mongoose.Types.ObjectId()});
	newComment.comment = comment;
	newComment.user_id = userId;
	newComment.bug_id = bugId;
	newComment.upvotes = 0;
	newComment.save(function(err){
		if(err) return done(err);
		return done(null, newComment._id)
	})
}

var updateUpvotes = function(postId, dbCollection, done){
	Upvote.find({post_id: postId}, function(err, posts){
		if(err) return done(err);
		dbCollection.findOne({_id: postId}, function(err1, post){
			if(err) return done(err)
			if(!post)return done(new Error("Post not found"));
			post.upvotes = posts ? posts.length : 0;
			post.save(function(errSave){
				if(errSave) return done(errSave);
				return done(null, post.upvotes);
			})
		})
	})
}

var upvote = function(userId, postId, postType, done){
	if(postType != "bug" && postType != "comment")
		return done(new Error("That is not a valid post type"));
	var postDB = postType == "bug" ? BugReport : Comment
	User.findOne({_id: userId}, function(err, user){
		if(err) return done(err);
		if(!user) return done(new Error("That is not a valid user"));
		postDB.findOne({_id: postId}, function(err1, post){
			if(err1) return done(err1);
			if(!post) return done(new Error("That is not a valid " + postType));
			Upvote.findOne({post_id: postId, user_id: userId}, function(err2, upvote){
				if(err2) return done(err2);
				if(upvote) return done(new Error("This user has already upvoted this post"));
				var newUpvote = new Upvote({_id: mongoose.Types.ObjectId(), post_id: postId, user_id: userId})
				newUpvote.save(function(errSave){
					if(errSave) return done(err);
					updateUpvotes(postId, postDB, function(errUpd, numUpvotes){
						if(errUpd) return done(errUpd);
						return done(null, numUpvotes)
					});
				})
			})
		})
	})
}

var removeUpvote = function(userId, postId, postType, done){
	if(postType != "bug" && postType != "coment")
		return done(new Error("PostType must be either bug or comment"));
	var postDB	 = postType == "bug" ? BugReport : Comment
	Upvote.remove({post_id: postId, user_id: userId}, function(err){
		if (err) return done(err);
		updateUpvotes(postId, postDB, function(errUpd, numUpvotes){
			if(errUpd) return done(errUpd);
			return done(null, numUpvotes)
		});
	});
}

var addProduct = function(productName, img, done){
	Product.findOne({name: productName}, function(err, product){
		if(err) return done(err);
		if(product) return done(new Error("Product already exists"));
		var newProduct = new Product({_id: mongoose.Types.ObjectId()});
		newProduct.name = productName;
		newProduct.img = img;
		newProduct.save(function(errSave){
			if(errSave) return done(errSave);
			return done(null)
		})
	})
}

module.exports = {
	addBug: addBug,
	addComment: addComment,
	upvote: upvote,
	removeUpvote: removeUpvote,
	addProduct: addProduct
}