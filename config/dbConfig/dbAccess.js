var Comment = require("./Models/Comment");
var Bug = require("./Models/BugReport");
var Product = require("./Models/Product");
var User = require("./Models/User");
var mongoose = require("mongoose");

var getComments = function(bugId, done){
	Comment.find({"bug_id": bugId}).sort({"upvotes": -1}).exec(function(err, comments){
		if(err)
			return done(err);
		var res = []
		for(let i = 0; i < comments.length; i++){
			res.push(comments[i]._id);
		}
		return done(null, res);
	})
}

var getBugReports = function(productId, done){
	Bug.find({"product_id": productId}).sort({"upvotes": -1}).exec(function(err, bugs){
		if(err)
			return done(err);
		var res = [];
		for(let i = 0; i < bugs.length; i++){
			res.push(bugs[i]._id);
		}
		return done(null, res);
	});
}

var getProduct = function(productName, done){
	Product.findOne({"name": productName}, function(err, product){
		if(err) return done(err);
		if(product) return done(null, product)
		return done(new Error("Product does not exist"))
	})
}

var getProductById = function(productId, done){
	Product.findOne({_id: productId}, function(err, product){
		if(err) return done(err)
		if(product) return done(null, product.name);
		return done(new Error("Product does not exist"));
	})
}

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

var getBug = function(bugId, done){
	Bug.findOne({"_id": bugId}, function(err, bug){
		if(err) return done(err);
		if(bug){
			getUser(bug.user_id, function(err1, username){
				if(err1) return done(err1)
				getComments(bug._id, function(err2, comments){
					if(err2) return done(err2)
					getProductById(bug.product_id, function(err3, productName){
						if(err3) return done(err3);
						var numComments = comments.length
						var commentText;
						if(numComments === 1)
							commentText = "1 Comment";
						else
							commentText = numComments + " Comments";
						return done(null, {
							id: bug._id,
							title: bug.title,
							description: bug.description,
							product: productName,
							post_type: bug.post_type,
							username: " @" + username,
							comments: commentText,
							upvotes: bug.upvotes,
							timeSince: getTimeSince(bug._id) + " Ago"
						});
					})
				})
			})

		}else
			return done(new Error("Bug does not exist"))
	})
}

var getComment = function(commentId, done){
	Comment.findOne({"_id": commentId}, function(err, comment){
		if(err) return done(err);
		if(comment){
			getUser(comment.user_id, function(err1, username){
				if(err1) return done(err1);
				return done(null, {
					commentText: comment.comment,
					username: " @" + username,
					timeSince: getTimeSince(comment._id) + " Ago",
					upvotes: comment.upvotes
				});
			})
		} else{
			return done(new Error("Could not find a comment with that ID"))
		}
	})
}

var getUser = function(userId, done){
	User.findOne({_id: userId}, function(err, user){
		if(err) return done(err);
		if(user) return done(null, user.name)
		else return done(new Error("User does not exist"))
	})
}

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
	getProduct: getProduct,
	getProducts: getProducts,
	getProductById: getProductById,
	getUser: getUser,
	getTimeSince: getTimeSince
}
