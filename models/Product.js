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
  price: { 
		type: Number, 
		required: true 
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
	ar:  { 
		type: Boolean, 
		default: false,
		required: true 
	},
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
  productType: { type: String },
  color: { type: String },
  material: { type: String },
  hazardousMaterial: { type: String },
  transportation: { type: String },
  ageOfThePlant: { type: String },
  organic: { type: String },
  netQuantity: { type: String },
  itemDimensions: {
    height: { type: String },
    length: { type: String },
    width: { type: String },
    netWeight: { type: String },
    volume: { type: String },
    depth: { type: String },
  },
	hsn: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
});

// Creating a Model
const productModel = mongoose.model('Product', productSchema);

export default productModel;