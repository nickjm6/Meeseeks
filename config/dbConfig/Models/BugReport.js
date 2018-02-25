var mongoose = require("mongoose")

var bugSchema = mongoose.Schema({
	title: String,
	description: String,
	product_id: String,
	user_id: String,
	upvotes: Number
})

module.exports = mongoose.model("Bug", bugSchema);