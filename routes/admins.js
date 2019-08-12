const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt=require('jsonwebtoken');
const mongoose=require('mongoose');
const User=require('../models/user');
const Admin=require('../models/admin');
const config=require('../config/database');
const checkAuth = require('./checkauth');

var session = require('express-session');
var cookieParser = require('cookie-parser')
router.use(cookieParser());



// Login Form
router.get('/login',(req, res, next) => {
 // res.render({user: req.user});
  res.render('admin');
});



router.post('/signup', (req, res, next) => {
  Admin.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "Mail exists"
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const newAdmin = new Admin({
              _id: new mongoose.Types.ObjectId(),
              username: req.body.username,
              password: hash
            });
            newAdmin
              .save()
              .then(result => {
                console.log(result);
                res.status(201).json({
                  message: "User created"
                });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
          }
        });
      }
    });
});



// Login Process

router.post("/login",(req, res, next) => {
  Admin.findOne({ email: req.body.email })
    .exec()
    .then(user => {
      console.log(user);
      if (user.length<1) {
        return res.status(401).json({
          message: "Auth failedddd"
        });
      }
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth failed"
          });
        }
        if (result) {
          

          const token=jwt.sign({id:user._id,email:user.email},config.secret,{
                    expiresIn: 86400 // expires in 24 hours
                });

          
              //res.cookie('auth',token);
              res.cookie('authadmin', token, { maxAge: 7*24*60*60*1000, httpOnly: true });


              return res.redirect('/admins/me');
        }
        res.status(401).json({
          message: "Auth failed"
        });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});



router.get("/me",checkAuth,(req, res, next) => {
  User.find({},'name email username password')
    .exec()
    .then(docs => {
      var docsList = [];
      // Loop check on each row
        for (var i = 0; i <docs.length; i++) {

          // Create an object to save current row's data
          var result = {
            'name':docs[i].name,
            'email':docs[i].email,
            'username':docs[i].username,
            'password':docs[i].password,
            '_id':docs[i].id
          }
          // Add object into array
          docsList.push(result);
      }

      // Render index.pug page using array 
      res.render('alluser', {"docsList": docsList});
      
      
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});




router.get('/edit/:id',checkAuth,(req,res,next)=>{
    const query={_id:req.params.id};
    User.findOne(query)
    .exec()
    .then(doc=>{
        //console.log(doc);
        //res.status(200).json(doc);
        res.render('update',{message:doc})

    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({error:err});
    });
    
});




// Update Submit POST Route
router.post('/edit/:id',checkAuth,function(req, res){
  const id= req.params.id;

  let newUser = {};

        newUser.name=req.body.name,
        newUser.email=req.body.email,
        newUser.username=req.body.username,

  //let query = {_id:req.params.id}

  User.findOneAndUpdate({_id:id}, newUser, function(err){
    if(err){
      console.log(err);
      return;
    } else {
      //req.flash('success', 'User Updated');
      //res.send('ok');
      res.redirect('/admins/me');
    }
  });
});



router.delete("/:id", checkAuth, (req, res, next) => {
  const id = req.params.id;
  User.remove({ _id: id })
    .exec()
    .then(result => {
      //alert('Item Deleted Sucessfully.');
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});




module.exports = router;
