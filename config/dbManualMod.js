var mongoose = require("mongoose");
var Product = require("./Product");
var User = require("./User");
var Comment = require("./Comment");
var BugReport = require("./BugReport")
var config = require("./config");

//set up mongo server
var mongoDB = config.mongoAddr;

var addProduct = function(productName, done){
	Product.findOne({"name": productName}, function(err, product){
		if(err)	return done(err);
		if(product) return done(new Error("product already exists"));
		var newProduct = new Product({_id: mongoose.Types.ObjectId()});
		newProduct.name = productName;
		newProduct.save(function(saveErr){
			if(saveErr) return done(saveErr);
			console.log("successfully saved product: " + productName);
			return done(null);
		})
	});
}

var addField = function(objectName, fieldName, value, done){
	var dbObject;
	switch(objectName){
		case "product":
			dbObject = Product;
			break;
		case "user":
			dbObject = User;
			break;
		case "bug":
			dbObject = BugReport;
			break;
		case "comment":
			dbObject = Comment;
			break;
		default:
			return done(new Error("that is not a valid object"));
	}
	dbObject.find({}, function(err, results){
		if(err) return done(err);
		for(var i = 0; i < results.length; i++){
			var element = results[i];
			element[fieldName] = value;
			element.save(function(saveErr){
				if(saveErr) return done(saveErr);
			})
		}
	})
	setTimeout(function(){console.log("done modding elements"); return done(null);}, 2000);
}

var updateElement = function(objectName, id, fieldName, value, done){
	var dbObject;
	switch(objectName){
		case "product":
			dbObject = Product;
			break;
		case "user":
			dbObject = User;
			break;
		case "bug":
			dbObject = BugReport;
			break;
		case "comment":
			dbObject = Comment;
			break;
		default:
			return done(new Error("that is not a valid object"));
	}
	dbObject.findOne({_id: id}, function(err, element){
		if(err) return done(err);
		if(element){
			element[fieldName] = value;
			element.save(function(saveErr){
				if(saveErr) return done(saveErr);
				console.log("successfully updated element");
				return done(null);
			})
		}
		else{
			return done(new Error("Could not find element"));
		}
	})
}

var start = function(){
	var command;
	var arg;
	var arg2;
	var arg3;
	var arg4;
	try{
		command = process.argv[2];
		arg = process.argv[3];
		arg2 = process.argv[4];
		arg3 = process.argv[5];
		arg4 = process.argv[6];
	} catch(e){
		console.error(e.message)
	};

	switch(command){
		case "addProduct":
			if(arg)
				addProduct(arg, function(err){mongoose.connection.close(); if(err)console.error(err.message);});
			else
				console.log("Please add an arguement")
			break;
		case "addField":
			if(arg && arg2)
				addField(arg, arg2, arg3, function(err){mongoose.connection.close(); if(err)console.error(err.message);});
			else
				console.error("please specify the object name, the field name, and the value you want to default to")
			break;
		case "updateElement":
			if(arg && arg2 && arg3)
				updateElement(arg, arg2, arg3, arg4, function(err){mongoose.connection.close(); if(err)console.error(err.message);});
			else
				console.error("please specify the dbobject, element id, field name and value");
			break;
		default:
			console.log("Please enter a valid command");
			break;
	};
}

mongoose.connect(mongoDB).then(() =>{
	start();
})



