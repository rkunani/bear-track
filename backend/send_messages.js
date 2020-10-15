const Track = require('./models/track');
const User = require('./models/user');
const axios = require('axios');
const util = require('util');

const accountSid = process.env.TWILIO_ACCT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = require('twilio')(accountSid, authToken);
const twilioNumber = process.env.TWILIO_NUMBER;
const APP_URL = "tinyurl.com/bear-track-app";

function isRequestedStatus(currentEnrollment, status) {
  const isOpen = (currentEnrollment.enrolled < currentEnrollment.enrolled_max);
  const isClosed = (currentEnrollment.enrolled >= currentEnrollment.enrolled_max);
  if ( (isOpen && status === "Open") || (isClosed && status === "Closed")) {
    return true;
  }
  return false;
}

/* Approach #1: Iterate through all tracks, querying enrollment API each time */
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
              /* Notify the user, if they haven't already been notified */
              User.findOne({ _id: track.creator })
                .then( (user) => {
                  if (!track.notified) {
                    const message = util.format(
                      "From BearTrack:\nHi %s, %s is %s!\n\nIf you'd like to be notified again, visit %s/tracks/list to reactivate the track.",
                      user.name, track.course_code, track.status, APP_URL);
                    twilioClient.messages.create({
                      body: message,
                      from: twilioNumber,
                      to: user.phone
                    }).then(message => console.log("Sent message: " + message.sid))
                      .catch( (error) => { console.log("Could not send message"); });
                    /* Mark the track as notified */
                    track.notified = true;
                    Track.updateOne({ _id: track._id }, track)
                      .then( (result) => {});
                  }
                })
                .catch( (error) => { console.log("could not find creator"); });
            }
          })
          .catch( (error) => {
            /* Weird situation where request has status code 500 but enrollment data is still returned,
            so the request enters both the then and catch blocks
            (theoretically) unable to get enrollment info for this class */
            console.log("GET request to " + requestURL + " failed!");
          });
      }
    })
    .catch( (error) => {
      /* Unable to get tracks */
      console.log("unable to fetch tracks from DB");
    });
}
