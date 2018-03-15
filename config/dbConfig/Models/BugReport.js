var mongoose = require("mongoose")

var bugSchema = mongoose.Schema({
	title: String,
	description: String,
	product_id: String,
	post_type: String,
	user_id: String,
})

module.exports = mongoose.model("Bug", bugSchema);