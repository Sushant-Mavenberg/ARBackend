import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Reference to the Product model
    required: true,
  },
  productName: {
    type: String,
    required: true
  },
  productImage: {
    type: String,
    required: true
  }
}, {timestamps:true});

const favoriteModel = mongoose.model('Favorite', favoriteSchema);

export default favoriteModel;
