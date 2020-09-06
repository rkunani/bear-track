const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');  // third-party package for creating tokens
const cron = require('node-cron');
const send_message = require('./send_messages');

mongoose.connect("mongodb+srv://rkunani:dbpwd@cluster0.okwcq.mongodb.net/beartrack-dev?retryWrites=true&w=majority")
  .then(() => { console.log("Connected to database!"); })
  .catch((error) => { console.log("Connection failed!"); });

const accountSid = 'ACfbeb368ee751507696a800f8a88394e0';
const authToken = '688d1b16d2cde7680a912a273a57cfeb';
const twilioClient = require('twilio')(accountSid, authToken);
const twilioNumber = '+15102885067';

const app = express();

const User = require('./models/user');
const Track = require('./models/track');
const checkAuth = require('./middleware/check-auth');

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Custom-Header, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  next();
});

// register a new user
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

// login a user
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
      // send the token
      fetchedUser = user;
      const token = jwt.sign(
        { name: fetchedUser.name, phone: fetchedUser.phone, userId: fetchedUser._id },  // input to token hash
        "secret_this_should_be_longer",  // secret to generate/validate token
        { expiresIn: "1h" }  // options for token
      );
      return res.status(200).json( { token: token, expiresIn: 3600 });  // expiresIn is measured in seconds
    })
    .catch( (error) => {
      return res.status(404).json( { message: "Authentication failed" });
    });
});

// create a new track
app.post('/api/tracks/create', checkAuth, (req, res, next) => {
  const track = new Track({
    course_id: req.body.course_id,
    course_code: req.body.course_code,
    semester: req.body.semester,
    status: req.body.status,
    creator: req.userData.userId
  });
  track.save()
    .then( (newTrack) => {
      res.status(201).json({
        message: 'Track successfully added',
        trackId: newTrack._id  // id from Mongo
      });
    });
});

// fetch all tracks by the current user
app.get('/api/tracks', checkAuth, (req, res, next) => {
  Track.find({ creator: req.userData.userId })
    .then((documents) => {
      return res.status(200).json({
        message: "Tracks fetched successfully!",
        tracks: documents
      })
    })
});

// delete a track
app.delete('/api/tracks/:trackId', checkAuth, (req, res, next) => {
  Track.deleteOne({ _id: req.params.trackId, creator: req.userData.userId })
    .then( (result) => {
      if (result.n > 0) {
        res.status(200).json({message: "Track deleted!"});
      }
      else {
        res.status(401).json({message: "User is not authorized to delete this track"});
      }
    });
})

cron.schedule("*/10 * * * * *", () => {  // send every 10 secs
  console.log("---------------------");
  send_message();
});

module.exports = app;  // exports the app
