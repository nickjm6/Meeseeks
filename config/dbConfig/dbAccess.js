var Comment = require("./Models/Comment");
var Bug = require("./Models/BugReport");
var Product = require("./Models/Product");
var User = require("./Models/User");
var mongoose = require("mongoose");
var Upvote = require("./Models/Upvote");

//returns a list of IDs of comments for a bug report based on the bug id that is given
var getComments = function(bugId, done){
	Comment.find({"bug_id": bugId}).sort({"upvotes": 1}).exec(function(err, comments){
		if(err)
			return done(err);
		var res = []
		for(let i = 0; i < comments.length; i++){
			res.push(comments[i]._id);
		}
		return done(null, res);
	})
}

//returns a list of IDs of bug reports for a product based on the product id that is given
var getBugReports = function(productId, done){
	Bug.find({"product_id": productId}).sort({"upvotes": 1}).exec(function(err, bugs){
		if(err)
			return done(err);
		var res = [];
		for(let i = 0; i < bugs.length; i++){
			res.push(bugs[i]._id);
		}
		return done(null, res);
	});
}

//returns the id of a product based on the name it is given
var getProduct = function(productName, done){
	Product.findOne({"name": productName}, function(err, product){
		if(err) return done(err);
		if(product) return done(null, product._id)
		return done(new Error("Product does not exist!"))
	})
}

//Returns the name of the product based on the Product ID that is given
var getProductById = function(productId, done){
	Product.findOne({_id: productId}, function(err, product){
		if(err) return done(err)
		if(product) return done(null, product.name);
		return done(new Error("Product does not exist"));
	})
}

//Returns a list of all products stored in the DB
var getProducts = function(done){
	Product.find({}, function(err, products){
		if(err) return done(err);
		var productList = []
		var prodLength = products.length;
		for(let i = 0; i < prodLength; i++){
			productList.push(products[i].name);
		}
		return done(null, productList)
	})
}

//Returns crucial info for a bug report based on the Bug ID that is given
var getBug = function(bugId, userId, done){
	Bug.findOne({"_id": bugId}, function(err, bug){
		if(err) return done(err);
		if(bug){
			getUser(bug.user_id, function(err1, username){
				if(err1) return done(err1)
				getComments(bug._id, function(err2, comments){
					if(err2) return done(err2)
					getProductById(bug.product_id, function(err3, productName){
						if(err3) return done(err3);
						hasUpvotedPost(userId, bugId, function(err4, hasUpvoted){
							if(err4) return done(err4)
							return done(null, {
								id: bug._id,
								title: bug.title,
								description: bug.description,
								product: productName,
								post_type: bug.post_type,
								username: username,
								comments: comments.length,
								upvotes: bug.upvotes,
								timeSince: getTimeSince(bug._id) + " Ago",
								hasUpvoted: hasUpvoted
							});
						})
					})
				})
			})

		}else
			return done(new Error("Bug does not exist"))
	})
}

//Gets crucial information about a comment
var getComment = function(commentId, userId, done){
	Comment.findOne({"_id": commentId}, function(err, comment){
		if(err) return done(err);
		if(comment){
			getUser(comment.user_id, function(err1, username){
				if(err1) return done(err1);
				hasUpvotedPost(userId, commentId, function(err2, hasUpvoted){
					if(err2) return done(err2);
					return done(null, {
						id: comment._id,
						commentText: comment.comment,
						username: " @" + username,
						timeSince: getTimeSince(comment._id) + " Ago",
						upvotes: comment.upvotes,
						hasUpvoted: hasUpvoted
					});
				});
			})
		} else{
			return done(new Error("Could not find a comment with that ID"))
		}
	})
}

//returns the user name based on a userID that is given
var getUser = function(userId, done){
	User.findOne({_id: userId}, function(err, user){
		if(err) return done(err);
		if(user) return done(null, user.name)
		else return done(new Error("User does not exist!"))
	})
}

var hasUpvotedPost = function(userId, postId, done){
	if(!userId)
		return done(null, false);
	Upvote.findOne({"post_id": postId, user_id: userId}, function(err, upvote){
		if(err) return done(err);
		if(upvote) return done(null, true);
		return done(null, false);
	})
}

//Returns a human readable time since something was added to the DB. it is based on the objectID of the field
var getTimeSince = function(objectId){
	var ts = mongoose.Types.ObjectId(objectId).getTimestamp();
	var then = new Date(ts);
	var now = new Date();
	var timeLapse = now - then;
	var seconds = Math.round(timeLapse / 1000);
	if (seconds >= 60){
		var minutes = Math.round(seconds / 60);
		if (minutes >= 60){
			var hours = Math.round(minutes / 60);
			if(hours >= 24){
				days = Math.round(hours / 24);
				if(days >= 7){
					weeks = Math.round(days/7);
					if(weeks >= 4){
						months = Math.round(days / 30);
						if(months >= 12){
							var years = Math.round(days / 365);
							return years > 1 ? years + " Years" : "1 Year";
						}
						return months > 1 ? months + " Months" : "1 Month"
					}
					return weeks > 1 ? weeks + " Weeks" : "1 Week";
				}
				return days > 1 ? days + " Days" : "1 Day";
			}
			return hours > 1 ? hours + " Hours" : "1 Hour";
		}
		return minutes > 1 ? minutes + " Minutes" : "1 Minute"
	}
	return seconds > 1 ? seconds + " Seconds" : "1 Second";
}

module.exports = {
	getComments: getComments,
	getComment: getComment,
	getBugReports: getBugReports,
	getBug: getBug,
	getProducts: getProducts,
	getProduct: getProduct,
}
