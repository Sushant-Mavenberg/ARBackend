import mongoose from "mongoose";

// Defining Schema
const userSchema = new mongoose.Schema({

  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true,
  },

  phoneNumber: {
    type: String,
    unique: true,
  },

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

  dateOfBirth: Date,
  gender:{
    type: String,
    enum: ['male', 'female','other']
  },

  loyaltyPoints:Number,
  amountSpent:Number,
  referrals:Number,
  joinDate: {
    type: Date,
    default: Date.now,
  },
  lastLoginDate: Date,
});

// Creating a Model
const userModel = mongoose.model('User', userSchema);

export default userModel;
