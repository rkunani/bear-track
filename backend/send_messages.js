const Track = require('./models/track');
const { exit } = require('process');
const https = require('https');
const util = require('util');

const accountSid = 'ACfbeb368ee751507696a800f8a88394e0';
const authToken = '688d1b16d2cde7680a912a273a57cfeb';
const twilioClient = require('twilio')(accountSid, authToken);
const twilioNumber = '+15102885067';

// Approach #1: Iterate through all tracks, querying enrollment API each time
module.exports = () => {
  Track.find()
    .then( (tracks) => {
      for (track of tracks) {
        const courseId = track.course_id;
        const semester = track.semester;
        const status = track.status;
        const term = semester.split(" ")[0].toLowerCase();
        const year = semester.split(" ")[1];
        const requestURL = util.format("https://www.berkeleytime.com/api/enrollment/aggregate/%s/%s/%s/", courseId, term, year);
        console.log(requestURL);
        https.get(requestURL,
          (response) => {
            console.log(response.statusCode);
          }
        ).on('error', (error) => { console.log(error); });
      }
      // exit(0);
    })
    .catch( (error) => {
      console.log(error);
    });
}

console.log("end of send_messages");
