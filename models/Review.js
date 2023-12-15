import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    },
    archived: {
      type:Boolean,
      default:false
    }
  },
  {
    timestamps: true, // Add createdAt and updatedAt automatically
  }
);

const reviewModel = mongoose.model('Review', reviewSchema);

export default reviewModel;
