/*
 * GET home page.
 */

exports.webappindex = function(req, res) {
    res.render('webappindex');
};

exports.partial = function (req, res) {
    var name = req.params.name;
    res.render('partials/partial' + name);
};