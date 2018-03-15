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
	newComment.save(function(err){
		if(err) return done(err);
		return done(null, newComment._id)
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
					return done(null);
				})
			})
		})
	})
}

var removeUpvote = function(userId, postId, done){
	Upvote.remove({post_id, postId, user_id: userId}, function(err){
		if (err) return done(err);
		return done(null);
	});
}

module.exports = {
	addBug: addBug,
	addComment: addComment,
	upvote: upvote,
	removeUpvote: removeUpvote
}