var User = require("./Models/User")
var BugReport = require("./Models/BugReport")
var Product = require("./Models/Product")
var Comment = require("./Models/Comment")
var mongoose = require("mongoose")

var addBug = function(title, description, userId, productId, done){
	var newBugReport = new BugReport({_id: mongoose.Types.ObjectId()});
	newBugReport.title = title;
	newBugReport.description = description;
	newBugReport.user_id = userId;
	newBugReport.product_id = productId;
	newBugReport.save(function(err) {
        if (err)
            throw err;
        return done(newBugReport)
    });
}

var addComment = function(bugId, userId, comment, done){
	var newComment = new Comment({_id: mongoose.Types.ObjectId()});
	newComment.comment = comment;
	newComment.user_id = userId;
	newComment.bug_id = bugId;
	newComment.save(function(err){
		if(err)
			throw err;
		return done(newComment)
	})
}


module.exports = {
	addBug: addBug,
	addComment: addComment
}