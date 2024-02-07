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
  orderTotal: { 
    type: Number,
    required: true
  },
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address', // Reference to the Address model
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
    enum: ['pending', 'confirmed','processing','shipped','delivered','replaced','cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
		enum: ['pending', 'paid', 'failed'],
    default:'pending'
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }
},{timestamps:true}); 

const orderModel = mongoose.model('Order', orderSchema);

export default orderModel;