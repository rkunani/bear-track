const mongoose = require('mongoose');

const trackSchema = mongoose.Schema({
  course: { type: String, required: true },
  semester: { type: String, required: true },
  status: { type: String, required: true }
})

module.exports = mongoose.model("Track", trackSchema);
