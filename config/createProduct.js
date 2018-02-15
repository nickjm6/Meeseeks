var mongoose = require("mongoose");
var Product = require("./Product");
var config = require("./config")

//set up mongo server
var mongoDB = config.mongoAddr;
mongoose.connect(mongoDB);


var productName = process.argv[2]

if(productName){
	Product.findOne({"name": productName}, function(err, product){
		if(err) throw err;
		if(product) {
			console.log("Product already exists")
			mongoose.connection.close();
		}
		else{
			var newProduct = new Product({_id: new mongoose.Types.ObjectId()})
			newProduct.name = productName;
			newProduct.save(function(errSave){
				if(errSave) console.log(errSave);
				else console.log("All set");
				mongoose.connection.close()
			})
		}
	});
}
