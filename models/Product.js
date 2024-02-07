import mongoose from "mongoose";

// Defining Schema
const productSchema = new mongoose.Schema({
  name: { 
		type: String, 
		required: true 
	},
	category:{
		type: String,
		enum: ['table-top', 'floor-standing','wall-hanging','metal-planter','aroma-candle'],
		required: true
	},
	sku: { 
		type: String, 
		required: true,
		unique: true 
	},
  actualPrice: { 
		type: Number, 
		required: true 
	},
	discountPercentage: {
		type: Number, 
		default: 0
	},
	finalPrice: {
		type: Number
	},
	currency: {
		type: String,
		default:'INR'
	},
	quantity: { 
		type: Number, 
		required: true 
	},
  description: { 
		type: String, 
		required: true 
	},
  images: {
    jpegUrls: [{ 
			type: String, 
			required: true 
		}],
    glbUrl: { type: String },
  },
	video: String,
	ar:  { 
		type: Boolean, 
		default: false,
		required: true 
	},
	requirements:[{ type: String }],
  features: [{ type: String }],
  brand: { type: String },
  manufacturer: { type: String },
  manufacturerAddress: { type: String },
  manufacturerEmail: { type: String },
  soldBy: { type: String },
  arphiboCustomerCareEmail: { type: String },
  arphiboCustomerCarePhone: { type: String },
  includedComponents: { type: String },
  countryOfOrigin: { type: String },
  color: { type: String },
  material: { type: String },
  hazardousMaterial: { type: String },
  transportation: { type: String },
  ageOfThePlant: { type: String },
  organic: { type: String },
  itemDimensions: {
    height: { type: String },
    length: { type: String },
    width: { type: String },
    netWeight: { type: String },
    volume: { type: String },
    depth: { type: String },
  },
	hsn: { type: String },
	numberOfRatings: {
		type: Number,
		default:0
	},
	numberOfReviews: {
		type: Number,
		default:0
	},
	averageRating: {
    type: Number,
    default: 0, // You might want to initialize it with 0 or some default value
  },
  starNumbers: {
    type: [Number],
    default: [0, 0, 0, 0, 0], // Initialize with default number for each star
  },
	starPercentages: {
    type: [Number],
    default: [0, 0, 0, 0, 0], // Initialize with default percentage for each star
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
});

// Creating a Model
const productModel = mongoose.model('Product', productSchema);

export default productModel;