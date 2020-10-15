const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');  // third-party package for creating tokens
const cron = require('node-cron');
const send_message = require('./send_messages');

mongoose.connect("mongodb+srv://rkunani:" + process.env.MONGO_PWD +
                 "@cluster0.okwcq.mongodb.net/" + process.env.MONGO_DB_NAME + "?retryWrites=true&w=majority")
  .then(() => { console.log("Connected to database!"); })
  .catch((error) => { console.log("Connection failed!"); });

const accountSid = process.env.TWILIO_ACCT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = require('twilio')(accountSid, authToken);
const twilioNumber = process.env.TWILIO_NUMBER;

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
  const cleanedName = req.body.name.trim() // remove leading and trailing spaces
  // create a new user
  const user = new User({
    name: cleanedName,
    phone: formattedPhone
  })
  // save user to DB
  user.save()
    .then( (result) => {
      res.status(201).json({
        message: "User added!",
        result: result
      });
      // if user added in DB, send confirmation text to user
      twilioClient.messages.create({
         body: "From BearTrack:\nWelcome to BearTrack, " + cleanedName + "!",
         from: twilioNumber,
         to: formattedPhone
      }).then(message => console.log(message.sid));
    })
    .catch( (error) => {
      return res.status(500).json({message: "User with phone number " + req.body.phone + " already exists"});  // will catch uniqueness errors
    });
});

// login a user
app.post('/api/user/login', (req, res, next) => {
  let fetchedUser;  // for later use in sending the token
  const formattedPhone = req.body.phone.replace(/-/g, "");
  const cleanedName = req.body.name.trim()
  User.findOne({ phone: formattedPhone })
    .then( (user) => {
      if (!user) {
        return res.status(404).json({ message: "No user with phone number " + req.body.phone + " exists" });
      }
      if (user.name != cleanedName) {
        return res.status(404).json({ message: "No user with name " + cleanedName + " and phone number " + req.body.phone + " exists" });
      }
      // send the token
      fetchedUser = user;
      const token = jwt.sign(
        { name: fetchedUser.name, phone: fetchedUser.phone, userId: fetchedUser._id },  // input to token hash
        process.env.JWT_KEY,  // secret to generate/validate token
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
    creator: req.userData.userId,
    notified: false
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

/* Fetch a particular track by ID */
app.get("/api/tracks/:trackId", (req, res, next) => {
  Track.findById(req.params.trackId)
    .then( (track) => {
      if (track) {
        res.status(200).json(track);
      } else {
        res.status(404).json({message: "Could not find track with id: " + req.params.trackId});
      }
    });
})

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

/* Activate a track */
app.put('/api/tracks/activate/:trackId', checkAuth, (req, res, next) => {
  const newTrack = new Track({
    _id: req.body.id,
    notified: false
  })
  Track.updateOne({ _id: req.params.trackId }, newTrack)
    .then( (result) => {
      res.status(200).json({message: "Reactivation successful!"});
    });
})

/* Update a track */
app.put('/api/tracks/edit/:trackId', checkAuth, (req, res, next) => {
  const updatedTrack = new Track({
    _id: req.body.id,
    course_id: req.body.course_id,
    course_code: req.body.course_code,
    semester: req.body.semester,
    status: req.body.status,
    notified: false
  });
  Track.updateOne({ _id: req.params.trackId }, updatedTrack)
    .then( (result) => {
      res.status(200).json({message: "Update successful!"});
    });
});

cron.schedule("*/5 * * * *", () => {  // send every 5 mins
  send_message();
});

module.exports = app;  // exports the app
