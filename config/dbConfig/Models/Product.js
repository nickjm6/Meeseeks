var mongoose = require("mongoose")

var productSchema = mongoose.Schema({
	name: String,
	img: Buffer
})

module.exports = mongoose.model("Product", productSchema);