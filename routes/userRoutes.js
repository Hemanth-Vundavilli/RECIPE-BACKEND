const express = require("express");
const router = express.Router();
const userSchema = require("../schema/userSchema");
const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookie = require("cookie-parser");
const { auth } = require("../config/jwt");

//signup
router.post("/signup", (req, res, next) => {
  const details = {
    "name": req.body.name,
    "email": req.body.email,
    "password": req.body.password,
    "role": "user"
  }
  userSchema.find({"email":details.email}).then(userObj=> {
    if(userObj.length == 0){
      userSchema.create(details, (err, data) => {
        if (err) {
          return res.send(err);
        } else {
          res.json(data);
        }
      });
    }else{
      res.status(401).send({
        status: false,
        message: "Email already registered"
      })
    }
  })
  .catch(err=> {
    res.status(400).send({
      status: false,
      error: err
    })
  })
});

const createToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// LogIn
router.post("/login", (req, res) => {
  const { name, email, password } = req.body;
  userSchema.findOne({ email: email })
  .then((userObj) => {
    if (userObj) {
      // databasepassword === given password
      // console.log("data: ",typeof(userObj.password));
      // console.log("password", typeof(password));
      if (userObj.password === password) {
        const token = createToken(userObj);
            res.cookie("access-token", token);
            res.send({
              status: true,
              message: "login successful",
              token: token,
              data: userObj
            });
      } else {
        res.status(400).send({
          status: false,
          message:"Password incorrect"
        });
      }
    } else {
      res.status(400).send({
        status: false,
        message:"No record exits"
      });
    }
  })
  .catch(err => {
    res.status(400).send("err");
  })
});

//get all users
router.get("/get", (req, res, next) => {
  userSchema.find((err, data) => {
    if (err) {
      return next(err);
    } else {
      return res.json(data);
    }
  });
});

// update
router.put("/update/:id", (req, res)=>{
  const details = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  }
  userSchema.findByIdAndUpdate(req.params.id, {$set:details}, function(err, result) {
    if (err)
    {
      res.status(400).send({
        status: false,
        message:err
      });

    }else{
      res.send({
        status: true,
        message:result
      });
    }
})
})

// // delete
// router.delete("/delete/:id", (req, res, next) => {
//   userSchema.findByIdAndRemove(req.params.id, (err, data) => {
//     if (err) {
//       return next(err);
//     } else {
//       return res.json("Deleted Successfully");
//     }
//   });
// });

module.exports = router;
