
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Whiteboard Online' });
};

// Renderar alla views i partials...
exports.partials = function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
};