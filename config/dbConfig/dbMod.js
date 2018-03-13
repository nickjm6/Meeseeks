var User = require("./Models/User")
var BugReport = require("./Models/BugReport")
var Product = require("./Models/Product")
var Comment = require("./Models/Comment")
var mongoose = require("mongoose")

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

//upvotes a bug, checking to see if the user has already upvoted this bug
var upvoteBug = function(userID, bugID, done){
	User.findOne({_id: userID}, function(err, user){
		if(err) return done(err);
		if(user){
			if(user.upvoted_bugs.includes(bugID))
				return done(new Error("You have already upvoted this"))
			BugReport.findOne({_id: bugID}, function(err1, bug){
				if(err1) return done(err1);
				if(bug){
					bug.upvotes++;
					bug.save(function(e){
						if(e) return done(e);
						user.upvoted_bugs.push(bugID);
						user.save(function(e1){
							if(e1) return done(e1);
							if(bug.upvotes === 1) response = "1 Upvote";
							else response = bug.upvotes + " Upvotes"
							return done(null, response);
						});
					});
				} else{
					return done(new Error("Bug Report does not exist"));
				}
			});
		}
		else{
			return done(new Error("User does not exist"));
		}
	});
}

//Upvotes a comment
var upvoteComment = function(userID, commentID, done){
	User.findOne({_id: userID}, function(err, user){
		if(err) return done(err);
		if(user){
			if(user.upvoted_comments.includes(commentID))
				return done(new Error("You have already upvoted this"))
			Comment.findOne({_id: commentID}, function(err1, comment){
				if(err1) return done(err1);
				if(comment){
					comment.upvotes++;
					comment.save(function(e){
						if(e) return done(e);
						user.upvoted_comments.push(commentID);
						user.save(function(e1){
							if(e1) return done(e1);
							var response;
							if(comment.upvotes === 1) response = "1 Upvote";
							else response = comment.upvotes + " Upvotes"
							return done(null, response);
						})
					})
				}
				else{
					return done(new Error("Comment does not exist"));
				}
			});
		} else{
			return done(new Error("User does not exist"));
		}
	});
}

var removeUpvotedBug = function(userId, bugId, done){
	User.findOne({_id: userId}, function(err, user){
		if(err) return done(err)
		if(user){
			if(user.upvoted_bugs.includes(bugId)){
				user.upvoted_bugs = user.upvoted_bugs.filter(id => id!=bugId)
				BugReport.findOne({_id: bugId}, function(err1, bug){
					if(err) return done(err);
					if(bug){
						user.save(function(e){
							if(e) return done(e);
							bug.upvotes--;
							bug.save(function(e1){
								if(e1) return done(e1);
								var response;
								if(bug.upvotes === 1)
									response = "1 Upvote";
								else
									response = bug.upvotes + " Upvotes";
								return done(null, response);
							})
						})
					} else return done(new Error("Bug does not exist"));
				})
			} else return done(new Error("User has not upvoted this"))
		} else return done(new Error("User does not exist"));
	}) 
}

var removeUpvotedComment = function(userId, commentId, done){
	User.findOne({_id: userId}, function(err, user){
		if(err) return done(err)
		if(user){
			if(user.upvoted_comments.includes(commentId)){
				user.upvoted_comments = user.upvoted_comments.filter(id => id!=commentId)
				Comment.findOne({_id: commentId}, function(err1, comment){
					if(err) return done(err);
					if(comment){
						user.save(function(e){
							if(e) return done(e);
							comment.upvotes--;
							comment.save(function(e1){
								if(e1) return done(e1);
								var response;
								if(comment.upvotes === 1)
									response = "1 Upvote";
								else
									response = comment.upvotes + " Upvotes";
								return done(null, response);
							})
						})
					} else return done(new Error("Comment does not exist"));
				})
			} else return done(new Error("User has not upvoted this"))
		} else return done(new Error("User does not exist"));
	}) 
}


module.exports = {
	addBug: addBug,
	addComment: addComment,
	upvoteBug: upvoteBug,
	upvoteComment: upvoteComment,
	removeUpvotedComment: removeUpvotedComment,
	removeUpvotedBug: removeUpvotedBug
}