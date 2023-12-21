import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  }, 
  products: [
    {
      productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // Reference to the Product model
      required: true,
      },
      quantity:{
        type:Number,
        requred:true
      }
    }
  ],
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address', // Reference to the Product model
    required: true,
  },
  shippingAmount: {
    type: Number,
    required: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  expectedDeliveryDate: {
    type: Date
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed','processing','shipped','delivered'],
    default: 'pending', 
  },
  taxAmount: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String
  },
  paymentId: {
    type: String
  }
},{timestamps:true});

const orderModel = mongoose.model('Order', orderSchema);

export default orderModel;