
var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

// load up the user model
var User       		= require('../model/user');


// load the auth variables for Facebook
var configAuth = require('./auth');

module.exports = function(passport) {
/* =================================================== */

// Serialized and deserialized methods when got from session
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

/* =================================================== */

// =========================================================================
// LOCAL SIGNUP ============================================================
// =========================================================================
// we are using named strategies since we have one for login and one for signup
// by default, if there was no name, it would just be called 'local'

// Define the strategy to be used by PassportJS
passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
  function(req, username, password, done) {
    User.findOne({ 'local.username' :  username }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, 'No user found');

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false,'Wrong pw');

            // all is well, return successful user
            return done(null, user);
        });
}));

passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password
    usernameField : 'username',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
},
function(req, username, password, done) {

	// find a user whose username is the same as the forms username
	// we are checking to see if the user trying to login already exists
    User.findOne({ 'local.username' :  username }, function(err, user) {
        // if there are any errors, return the error
        if (err)
            return done(err);

        // check to see if theres already a user with that email
        if (user) {
            return done(null, false,'Mail already taken');
        } else {

			// if there is no user with that email
            // create the user
            var newUser            = new User();

            // set the user's local credentials
            newUser.local.username    = username;
            newUser.local.password = newUser.generateHash(password); // använder modellens generateHash för att "salta pw:et" mha b-crypt

			// save the user
            newUser.save(function(err) {
            console.log("User saved..");
                if (err)
                    throw err;
                return done(null, newUser);
            });
        }

    });

}));

// =========================================================================
// FACEBOOK ================================================================
// =========================================================================
passport.use(new FacebookStrategy({

    // pull in our app id and secret from our auth.js file
    clientID        : configAuth.facebookAuth.clientID,
    clientSecret    : configAuth.facebookAuth.clientSecret,
    callbackURL     : configAuth.facebookAuth.callbackURL

},

// facebook will send back the token and profile
function(token, refreshToken, profile, done) {

    // asynchronous
    process.nextTick(function() {

        // find the user in the database based on their facebook id
        User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

            // if there is an error, stop everything and return that
            // ie an error connecting to the database
            if (err)
                return done(err);

            // if the user is found, then log them in
            if (user) {
                return done(null, user); // user found, return that user
            } else {
                // if there is no user found with that facebook id, create them
                var newUser            = new User();

                // set all of the facebook information in our user model
                newUser.facebook.id    = profile.id; // set the users facebook id                   
                newUser.facebook.token = token; // we will save the token that facebook provides to the user                    
                newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

                // save our user to the database
                newUser.save(function(err) {
                    if (err)
                        throw err;

                    // if successful, return the new user
                    return done(null, newUser);
                });
            }

        });
    });

}));

};