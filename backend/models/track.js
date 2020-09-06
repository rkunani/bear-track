const mongoose = require('mongoose');

const trackSchema = mongoose.Schema({
  course_id: { type: Number, required: true },
  course_code: {type: String, required: true },
  semester: { type: String, required: true },
  status: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
})

module.exports = mongoose.model("Track", trackSchema);
