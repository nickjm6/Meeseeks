var Comment = require("./Models/Comment");
var Bug = require("./Models/BugReport");
var Product = require("./Models/Product");

var getComments = function(bugId, done){
	Comment.find({"bug_id": bugId}).sort({"upvotes": -1}).exec(function(err, comments){
		if(err)
			return done(err);
		return done(null, comments)
	})
}

var getBugReports = function(productId, done){
	Bug.find({"product_id": productId}).sort({"upvotes": -1}).exec(function(err, bugs){
		if(err)
			return done(err);
		return done(null, bugs);
	});
}

var getProduct = function(productName, done){
	Product.findOne({"name": productName}, function(err, product){
		if(err) return done(err);
		if(product) return done(null, product)
		return done(new Error("Product does not exist"))
	})
}

var getBug = function(bugId, done){
	Bug.findOne({"_id": bugId}, function(err, bug){
		if(err) return done(err);
		if(product) return done(null, bug)
		return done(new Error("Bug does not exist"))
	})
}


module.exports = {
	getComments: getComments,
	getBugReports: getBugReports,
	getProduct: getProduct
}
