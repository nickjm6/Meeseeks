var User = require("./User")
var BugReport = require("./BugReport")
var Product = require("./Product")
var Comment = require("./Comment")
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