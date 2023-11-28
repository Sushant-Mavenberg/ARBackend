import mongoose from "mongoose";

// Defining Schema
const userSchema = new mongoose.Schema({
	userName: String,
  firstName: String,
  lastName: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  billingAddress: [{
    houseNo:String,
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  }],
  shippingAddress: [{
    houseNo:String,
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    landmark:String
  }],
  phoneNumber: String,
  accountStatus: {
    type: String,
    enum: ['active', 'disabled'],
    default: 'active',
  },
  userRole: {
    type: String,
    enum: ['customer', 'admin','super-admin'],
    default: 'customer',
  },
  profilePicture: String,
  dateOfBirth: Date,
  joinDate: {
    type: Date,
    default: Date.now,
  },
  lastLoginDate: Date,
});

// Creating a Model
const userModel = mongoose.model('User', userSchema);

export default userModel;
