import mongoose from "mongoose";

// Defining Schema
const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  type: String,
  name:String,
  houseNo:String,
  street: String,
  city: String,
  state: String,
  postalCode: String,
  country: {
    type:String,
    default:"India"
  },
  landmark:String,
  phoneNumber:String,
  default: {
    type:Boolean,
    default:false
  } 
},{timestamps:true});

// Creating a Model
const addressModel = mongoose.model('Address', addressSchema);

export default addressModel;