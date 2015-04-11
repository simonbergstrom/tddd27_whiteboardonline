// All routes within the application Whiteboard Online
var routes 			= require('./routes');
var User       		= require('./model/user');


module.exports = function(app, passport) {

	// Render the different view...
	app.get('/', routes.index);
	app.get('/partials/:name', routes.partials);

	app.get('/loggedin', function(req, res) {

		// Is Authenticated? when send the username back to the client...
		if(req.isAuthenticated())
		{
			// Check if client has logged in with fb or local
			if(typeof(req.user.local.username) === 'undefined')
				res.send(req.user.facebook.name);	
			else
				res.send(req.user.local.username);
		}
		else
			res.send('0');	
	});


	// Collect all canvases stored in logged in user..
	app.get('/getcanvas',function(req,res){

		User.findOne({'_id' : req.user._id },function(err,user){
			if(err)
				console.log(err);	
			else
				res.send(user.canvas);
		});

	});


	// Local login route... send back only username..
	app.post('/login', passport.authenticate('local-login'), function(req, res) {
	  res.send(req.user.local.username);
	});

	// Local sign up.. send back only username..
	app.post('/signup', passport.authenticate('local-signup'), function(req, res) { 
	  res.send(req.user.local.username);
	});

	// Save current canvas into database..
	app.post('/savecanvas',function(req,res){

		User.update({_id:req.user._id},{
			$push : {
			    canvas :  {
			             "name": req.body.name,
			             "data": req.body.data
			           } 	
			}
		},function(err){

			if(err)
				console.log(err);
			else
				console.log("Saved canvas completed..");
		});

		res.send('Canvas saved!');
	});
	// Delete chosen canvas...
	app.post('/deletecanvas',function(req,res){
		User.update({_id:req.user._id},{

			$pull : {
	    		canvas :  {
	            	 "name": req.body.name
	           	} 	
			}
		},function(err,val){

			if(err)
				console.log(err);
			else
				console.log("Deleted canvas completed..",val);
		});
	});

	// route for facebook authentication and login
	app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

	// handle the callback after facebook has authenticated the user
	app.get('/auth/facebook/callback',
	  passport.authenticate('facebook', {
	    successRedirect : '/auth/success',
	    failureRedirect : '/auth/failure'
	}));

	// If facebook login success... redirect to index page..
	app.get('/auth/success', function(req, res) {
	    res.redirect('/#/index'); 
	});
	// If facebook login fail.... redirect to startpage...
	app.get('/auth/failure', function(req, res) {
	    res.redirect('/#/');
	});
	// Log out current user with passport..
	app.post('/logout', function(req, res){
	    req.logOut();
	    res.send(200);
	});

}