const Track = require('./models/track');
const User = require('./models/user');
const axios = require('axios');
const util = require('util');

const accountSid = 'ACfbeb368ee751507696a800f8a88394e0';
const authToken = '688d1b16d2cde7680a912a273a57cfeb';
const twilioClient = require('twilio')(accountSid, authToken);
const twilioNumber = '+15102885067';

function isRequestedStatus(currentEnrollment, status) {
  const isOpen = (currentEnrollment.enrolled < currentEnrollment.enrolled_max);
  const isClosed = (currentEnrollment.enrolled >= currentEnrollment.enrolled_max);
  if ( (isOpen && status === "Open") || (isClosed && status === "Closed")) {
    return true;
  }
  return false;
}

// Approach #1: Iterate through all tracks, querying enrollment API each time
module.exports = () => {
  Track.find()
    .then( (tracks) => {
      for (track of tracks) {
        const term = track.semester.split(" ")[0].toLowerCase();
        const year = track.semester.split(" ")[1];
        const requestURL = util.format("https://www.berkeleytime.com/api/enrollment/aggregate/%s/%s/%s/", track.course_id, term, year);
        axios.get(requestURL)
          .then( (response) => {
            const enrollmentHistory = response.data.data;
            const currentEnrollment = enrollmentHistory[enrollmentHistory.length - 1];
            if (isRequestedStatus(currentEnrollment, track.status)) {
              // find the creator
              User.findOne({ _id: track.creator })
                .then( (user) => {
                  if (!track.notified) {  // only send text once per track
                    const message = util.format("From BearTrack:\nHi %s, %s is %s!", user.name, track.course_code, track.status);
                    console.log(message);
                    // send a message
                    twilioClient.messages.create({
                      body: message,
                      from: twilioNumber,
                      to: user.phone
                    }).then(message => console.log("Sent message: " + message.sid));
                    // mark the track as notified
                    track.notified = true;
                    Track.updateOne({ _id: track._id }, track)
                      .then( (result) => { console.log("Updated track to 'notified': true"); });
                  }
                });
            }
          })
          .catch( (error) => {
            // unable to get enrollment info for this class
            console.log("GET request to " + requestURL + " failed");
          });
      }
    })
    .catch( (error) => {
      // unable to get tracks
      console.log(error);
    });
}
