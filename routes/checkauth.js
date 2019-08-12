const jwt = require('jsonwebtoken');
const config=require('../config/database');

module.exports=function(req, res, next) {

  var token = req.cookies.authadmin;
  //console.log(token);
  //console.log(req.headers);

  // decode token
  if (token) {

    jwt.verify(token, config.secret, function(err, token) {
      if (err) {
         return res.status(403).send('Error');
      } else {
        req.user = token;
        next();
      }
    });

  } else {
    return res.status(403).send('Sorry, for Now This page is not authorized for you. Please Login!');
  }
};



