const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WishSchema = new Schema({
  url: String,
  title: String,
  image: String,
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "account",
  },
  modifiedBy: {
    type: Schema.Types.ObjectId,
    ref: "account",
  },
  createdAt: Number,
  modifiedAt: Number,
});


const modelName = 'wishlist';
const collectionName = 'wishlists';

module.exports = mongoose.model(modelName, WishSchema, collectionName);