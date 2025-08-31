const express = require('express');
const Router = express.Router();
const User = require('../models/User')
const { validationResult, body } = require('express-validator');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const fetchuser = require('../Middleware/fetchuser');

const Jwt_Secret = "MynameisAh%med"

//ROUTER 1: creaate auser using post "api/auth/createuser". No login requires
Router.post('/createuser', [
  body('name', 'Enter a valid name').isLength({ min: 3 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'password must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {
  let success=false;
  //if there are error-> "return bad request and the errors"
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }
  try {
    //check if user has unique email     
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({success, error: 'sorry a user with this email already exit' });
    }
    const salt = await bcrypt.genSalt(10);
    const secpas = await bcrypt.hash(req.body.password, salt);
    //creat a new user
    user = await User.create({
      name: req.body.name,
      password: secpas,
      email: req.body.email,
    })

    const Data = {
      user: {
        id: user.id
      }
    }
    const JwtToken = jwt.sign(Data, Jwt_Secret);

    success= true;
    res.json({ success, JwtToken });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error")
  }
})


// ROUTER 2: Authenticate a user using post "api/auth/login". No login requires
Router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'password must not be blanked').exists(),
], async (req, res) => {
  let success=false;
  //if there are error-> "return bad request and the errors"
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const {email, password}=req.body;
  try {
    let user = await User.findOne({email});
    if (!user) {
      success=false;
      return res.status(400).json(success,'Please enter correct credtionals')
    }
    let passwordCompare= await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      success=false;
      return res.status(500).json(success, 'Please enter correct credtionals')
    }

    const Data = {
      user: {
        id: user.id
      }
    }
    const JwtToken = jwt.sign(Data, Jwt_Secret);
    success=true;
    res.json({success, JwtToken})

   
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error")
  }
})


// ROUTER 3: Get login user details using post "api/auth/getUser". No login requires
Router.post('/getUser',fetchuser, async (req, res) => {
try {
  userid= req.user.id;
  const user = await User.findById(userid).select("-password");
  res.send(user)
} catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error")
  }
   
})
module.exports = Router