var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var mongoose = require("mongoose");

var User = require("./dbConfig/Models/User")

var auth = require("./config")

module.exports = function(passport){
	// used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use(new FacebookStrategy({
        clientID        : auth.facebook.id,
        clientSecret    : auth.facebook.secret,
        callbackURL     : auth.facebook.redirect,
        profileFields: ['id', 'emails', 'name']

    },

    function(token, refreshToken, profile, done) {

        process.nextTick(function() {
            User.findOne({ 'profile_id' : profile.id }, function(err, user) {
                if (err)
                    return done(err);
                if (user) {
                    return done(null, user); 
                } else {
                    var newUser            = new User({_id: new mongoose.Types.ObjectId()});
                    newUser.profile_id    = profile.id;                 
                    newUser.token = token;             
                    newUser.name  = profile.name.givenName + ' ' + profile.name.familyName;
                    newUser.email = profile.emails[0].value; 
                    newUser.upvoted = [];
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }

            });
        });

    }));

    // passport.use(new GoogleStrategy({

    //     clientID        : auth.google.id,
    //     clientSecret    : auth.google.secret,
    //     callbackURL     : auth.google.redirect

    // },
    // function(token, refreshToken, profile, done) {
    //     process.nextTick(function() {
    //         User.findOne({ 'google.id' : profile.id }, function(err, user) {
    //             if (err)
    //                 return done(err);
    //             if (user) {
    //                 return done(null, user);
    //             } else {
    //                 var newUser          = new User();
    //                 newUser.id    = profile.id;
    //                 newUser.token = token;
    //                 newUser.name  = profile.displayName;
    //                 newUser.email = profile.emails[0].value;
    //                 newUser.save(function(err) {
    //                     if (err)
    //                         throw err;
    //                     return done(null, newUser);
    //                 });
    //             }
    //         });
    //     });

    // }));
}