var mongoose = require("mongoose")

var commentSchema = mongoose.Schema({
	comment: String,
	bug_id: String,
	user_id: String,
})

module.exports = mongoose.model("Comment", commentSchema);