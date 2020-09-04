const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');  // third-party package that provides uniqueness checking

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true }  // unique is a property that allows MongoDB to optimize storage
})

userSchema.plugin(uniqueValidator);  // actually performs any uniqueness checks

module.exports = mongoose.model("User", userSchema);
