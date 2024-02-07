import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  }, 
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order', // Reference to the User model
    required: true,
  },
  amount: {
    type: Number,
    required: true
  },
  razorpayPaymentId:{
    type:String,
    required:true
  },
  razorpayOrderId:{
    type:String,
    required:true
  },
  razorpaySignature:{
    type:String,
    required:true
  },
  paymentMethod: {
    type: String,
    required :true
  }

},{timestamps:true});

const paymentModel = mongoose.model('Payment', paymentSchema);

export default paymentModel;