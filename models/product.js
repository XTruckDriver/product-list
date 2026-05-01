const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  category: String,
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: String,
  reviews: [{type:Schema.Types.ObjectId, ref: "Review"}],
});

module.exports = mongoose.model("Product", ProductSchema);