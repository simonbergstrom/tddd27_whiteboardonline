
/*
 * Handle users in the application
 */

// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs'); // Used for hash and validate password in order to make the authorization more safe...

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        username     : String,
        password     : String,
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    canvas           : [{name: String , data: String}]   
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);


exports.list = function(req, res){
  res.send("respond with a resource");
};