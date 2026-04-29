const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
  userName: String,
  text: { type: String, required: true },
  product: {type: Schema.Types.ObjectId, ref: "product", required: true },
});

module.exports = mongoose.model("Review", ReviewSchema);