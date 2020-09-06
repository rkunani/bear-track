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
        const courseId = track.course_id;
        const semester = track.semester;
        const status = track.status;
        const creator = track.creator;
        const term = semester.split(" ")[0].toLowerCase();
        const year = semester.split(" ")[1];
        const requestURL = util.format("https://www.berkeleytime.com/api/enrollment/aggregate/%s/%s/%s/", courseId, term, year);
        axios.get(requestURL)
          .then( (response) => {
            const enrollmentHistory = response.data.data;
            const currentEnrollment = enrollmentHistory[enrollmentHistory.length - 1];
            if (isRequestedStatus(currentEnrollment, status)) {
              // find the creator
              User.findOne({ _id: creator })
                .then( (user) => {
                  const message = util.format("Send to %s: Hi %s, %s is %s!", user.phone, user.name, track.course_code, status);
                  console.log(message);
                  // send a message
                  // twilioClient.messages.create({
                  //    body: 'Hello' + req.body.name + '!',
                  //    from: twilioNumber,
                  //    to: formattedPhone
                  // }).then(message => console.log(message.sid));
                })
            }
          })
          .catch( (error) => {
            console.log(error);
          });
      }
    })
    .catch( (error) => {
      console.log(error);
    });
}

console.log("end of send_messages");
