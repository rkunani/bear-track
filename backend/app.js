const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const accountSid = 'ACfbeb368ee751507696a800f8a88394e0';
const authToken = '688d1b16d2cde7680a912a273a57cfeb';
const twilioClient = require('twilio')(accountSid, authToken);
const twilioNumber = '+15102885067';

const app = express();

const User = require('./models/user');
const Track = require('./models/track');

mongoose.connect("mongodb+srv://rkunani:dbpwd@cluster0.okwcq.mongodb.net/beartrack-dev?retryWrites=true&w=majority")
  .then(() => { console.log("Connected to database!"); })
  .catch((error) => { console.log("Connection failed!"); });

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Custom-Header, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  next();
});

app.post('/api/user/signup', (req, res, next) => {
  const formattedPhone = req.body.phone.replace(/-/g, "");  // weird syntax replaces all "-" instead of just one
  // create a new user
  const user = new User({
    name: req.body.name,
    phone: formattedPhone
  })
  // send data to DB
  user.save()
    .then( (result) => {
      res.status(201).json({
        message: "User added!",
        result: result
      });
      console.log("sending text to " + formattedPhone);
      // twilioClient.messages.create({
      //    body: 'Hello' + req.body.name + '!',
      //    from: twilioNumber,
      //    to: formattedPhone
      // }).then(message => console.log(message.sid));
    })
    .catch( (error) => {
      return res.status(500).json({error: error});  // will catch uniqueness errors
    });
});

app.post('/api/user/login', (req, res, next) => {
  let fetchedUser;  // for later use in sending the token
  const formattedPhone = req.body.phone.replace(/-/g, "");
  User.findOne({ phone: formattedPhone })
    .then( (user) => {
      if (!user) {
        return res.status(404).json({ message: "No user with phone number " + req.body.phone + " exists" });
      }
      if (user.name != req.body.name) {
        return res.status(404).json({ message: "No user with name " + req.body.name + " and phone number " + req.body.phone + " exists" });
      }
      return res.status(200).json({ message: "User logged in!" });
      // send the token
    })
    .catch( (error) => {
      return res.status(404).json( { message: "Authentication failed" });
    });
});

app.post('/api/track/create', (req, res, next) => {
  const track = new Track({
    course: req.body.course,
    semester: req.body.semester,
    status: req.body.status
  });
  track.save()
    .then( (newTrack) => {
      res.status(201).json({
        message: 'Track successfully added',
        trackId: newTrack._id  // id from Mongo
      });
    });
});

module.exports = app;  // exports the app
