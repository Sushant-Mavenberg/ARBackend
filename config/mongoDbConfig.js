import { MongoClient } from "mongodb";
import mongoose from "mongoose";

async function connectDB(uri) {
    mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB Atlas:', err);
  });
}

export default connectDB;