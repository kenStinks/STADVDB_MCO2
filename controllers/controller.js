const controller = {

    getIndex: function (req, res) {
        res.render('index', res);
    },
    
}

/*
    exports the object `controller` (defined above)
    when another script exports from this file
*/
module.exports = controller;