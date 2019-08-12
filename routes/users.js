const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');


//NLP related Models
let dataArray = require('./student.json');
let ansArray = require('./answers.json');

const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['en'] });

for (let j = 0; j < dataArray.length; j += 1) {
  manager.addDocument('en',dataArray[j].input , dataArray[j].intent);
 //console.log(dataArray[j].name);         
}



for (let j = 0; j < ansArray.length; j += 1) {
  manager.addAnswer('en',ansArray[j].intent,ansArray[j].output);
 //console.log(dataArray[j].name);         
}




// Bring in User Model
let User = require('../models/user');


let AskQ = require('../models/askq');


// Register Form
router.get('/register', function(req, res){
  res.render('register');
});


router.post('/adq',function(req,res){
   const ans = req.body.name;
  //const ans = req.body.ans;
  //console.log(req.body);
(async() => {
    await manager.train();
    manager.save();
    const response = await manager.process('en', ans);
    const threshold = 0.5;

const answer =
        response.score > threshold && response.answer
          ? response.answer
          : "Sorry, I don't understand";    
    console.log(answer);

    //res.json({ user: 'tobi' });

    res.set({'ans': answer});

    let newUser = new AskQ({answer:answer});
    newUser.save();


})();  

});


router.get('/askq',(req, res,next)=>{
  AskQ.find({},'answer').sort({ _id: -1 }).limit(1)
    .exec()
    .then(docs => {
      res.status(200).json(docs);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});


// Register Proccess
router.post('/register', function(req, res){
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  let errors = req.validationErrors();

  if(errors){
    res.render('register', {
      errors:errors
    });
  } else {
    let newUser = new User({
      name:name,
      email:email,
      username:username,
      password:password
    });

    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(newUser.password, salt, function(err, hash){
        if(err){
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(function(err){
          if(err){
            console.log(err);
            return;
          } else {
            req.flash('success','You are now registered and can log in');
            res.redirect('/users/login');
          }
        });
      });
    });
  }
});

// Login Form
router.get('/login', function(req, res){
  res.render('login');
});

// Login Process
router.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/users/login',
    failureFlash: true
  })(req, res, next);
});

// logout
router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
});

// Add Route
router.get('/add', ensureAuthenticated, function(req, res){
  res.render('add_article', {
    title:'Add Article'
  });
});


// Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}

module.exports = router;
