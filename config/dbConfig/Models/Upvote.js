var mongoose = require("mongoose")

var upvoteSchema = mongoose.Schema({
	post_id: String,
	user_id: String,
})

module.exports = mongoose.model("Upvote", upvoteSchema);