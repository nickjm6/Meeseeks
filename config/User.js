var mongoose = require("mongoose")

var userSchema = mongoose.Schema({
    profile_id: String,
    token : String,
    name : String,
    email: String,
    upvoted_bugs: Array,
    upvoted_comments: Array
});

module.exports = mongoose.model('User', userSchema);