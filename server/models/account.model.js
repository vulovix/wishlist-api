const { Schema, model } = require("mongoose");

const AccountSchema = new Schema({
  email: String,
  lastName: String,
  firstName: String,
  password: String,
  createdAt: Number,
  modifiedAt: Number,
  emailConfirmed: Boolean,
});

module.exports = model("account", AccountSchema); 