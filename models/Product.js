import mongoose from "mongoose";

// Defining Schema
const productSchema = new mongoose.Schema({
    name: {
			type:String,
			required: true
		},
    description: String,
    category:{
    	type: String,
    	enum: ['table top', 'floor standing','wall hanging','metal planter','aroma candle'],
			required: true
    },
		price: {
			type:Number,
			required: true
		},
		currency: {
			type: String,
			default:'INR'
		},
		quantity: Number,
		images: [{ 
			type: String
			// required:true
		}],
		sku: { 
			type: String,
			unique:true,
			required:true
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		updatedAt:Date
});

// Creating a Model
const productModel = mongoose.model('Product', productSchema);

export default productModel;