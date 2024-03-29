import { json } from "express";
import productModel from "../models/Product.js";
import {BlobServiceClient} from "@azure/storage-blob";

// Azure Storage Blob configuration
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.BLOB_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(process.env.BLOB_STORAGE_CONTAINER);

export const fetchAllProducts = async(req,res) => {
	try {
		const category = req.params.category;
		let products;
		if (category){ 
			products = await productModel.find({category:category});
		} else{
			products = await productModel.find({});
		}
    res.status(200).send({
			"success":"true",
			"message":"All products are fetched",
			"products": products
		});
  } catch (e) {
    res.status(500).send({
			"success":"false",
			"message":"Something went wrong"
		});
  }
}

export const uploadProduct = async(req,res) => {
	if(!req.user){
		return res.status(400).send({
			"success":"false",
			"message":"Login Required"
		});
	} 
	const userRole = req.user.userRole;
	if (userRole === 'admin' || userRole === 'super-admin') {
		const {name, actualPrice,category,sku,quantity,description} = req.body;
	
		const jpegImages = req.files['jpegImages'];
		if (name && actualPrice && category && sku && quantity && description && jpegImages) { 
			const product = await productModel.findOne({sku:sku});
			if(product) {
				res.status(409).send({ 
					"success":"false",
					"message":"SKU already exists"
				});
			} else { 
				try{
					// Process uploaded .jpeg images
					const jpegUrls = [];
					if (req.files['jpegImages']) {
						const promisesJpeg = req.files['jpegImages'].map(async (file) => {
							const blobName = `${Date.now()}-${file.originalname}`;
							const blockBlobClient = containerClient.getBlockBlobClient(blobName);
							await blockBlobClient.upload(file.buffer, file.size,{
								blobHTTPHeaders: { blobContentType: 'application/octet-stream' },
							});
							const imageUrl = blockBlobClient.url;
							jpegUrls.push(imageUrl);
						});
						await Promise.all(promisesJpeg);
					}

					// Process uploaded .glb image
					let glbUrl = null;
					if (req.files['glbImage']) {
							const file = req.files['glbImage'][0];
							const blobName = `${Date.now()}-${file.originalname}`;
							const blockBlobClient = containerClient.getBlockBlobClient(blobName);
							
							await blockBlobClient.upload(file.buffer, file.size,{
								blobHTTPHeaders: { blobContentType: 'application/octet-stream' },
							});
							const imageUrl = blockBlobClient.url;
							glbUrl = imageUrl;
					}

					let ar = false;
					if (glbUrl){
						ar = true;
					}

					// Uploading the video 
					let videoUrl = null;
					if (req.files['video']) {
						const file = req.files['video'][0];
						const blobName = `${Date.now()}-${file.originalname}`;
						const blockBlobClient = containerClient.getBlockBlobClient(blobName);
						
						await blockBlobClient.upload(file.buffer, file.size,{
							blobHTTPHeaders: { blobContentType: 'application/octet-stream' },
						});
						videoUrl = blockBlobClient.url;
					}

					// Calculating finalPrice based on discountPercentage
					let discountPercentage;
					let {finalPrice} = req.body;
					if (finalPrice) { 
						discountPercentage = Math.floor(100-((finalPrice/actualPrice) * 100));
					}else {
						finalPrice = actualPrice;
					}

					// process itemDimensions,features from req body
					let requirements,itemDimensions,features
					requirements = JSON.parse(req.body.requirements);
					itemDimensions = JSON.parse(req.body.itemDimensions);
					features = JSON.parse(req.body.features);
					
					// Create a new product with the received data and the Azure Blob Storage URLs
					const productData = {
						...req.body,
						discountPercentage:discountPercentage,
						finalPrice:finalPrice,
						ar:ar,
						video:videoUrl,
						requirements:requirements,
						itemDimensions:itemDimensions,
						features:features,
						images: {
							jpegUrls: jpegUrls,
							glbUrl: glbUrl,
						}
					};
					
					const newProduct = new productModel(productData);
					const savedProduct = await newProduct.save();
					res.status(201).send({
						"success":"true",
						"message":"Product uploaded",
						"product": savedProduct
					});
				} catch(e) {
					console.log(e);
					res.status(500).send(
						{
							"success":"false",
							"message":"Something went wrong"
						}
					);
				}
			}
			
		} else {
			res.status(406).send({
				"success":"false",
				"message":"name,price,category,sku, quantity,description and jpegImages these fields are required"
			});
		} 
	} else {
			res.status(401).send({
				"success":"false",
				"message":"Unauthorized User"
			});
	}
}

export const fetchProduct = async(req,res) => {
	try {
		const productId = req.params.id;
		const product = await productModel.findOne({_id:productId});
		
		if(product) {
			res.status(200).send({
				"success":"true",
				"message":"Product fetched successfully",
				"product":product
			});
		} else {
			res.status(404).send({
				"success":"false",
				"message":`Product not found`
			});
		}
	} catch (e) {
		res.status(500).send({
			"success":"false",
			"message": e.message
		});
	}
}

export const updateProduct = async(req,res) => {
	if(!req.user){
		return res.status(400).send({
			"success":"false",
			"message":"Login Required"
		});
	} 
	const userRole = req.user.userRole;
	if (userRole === 'admin' || userRole === 'super-admin') {
		try {
			const productId = req.params.id;
			const updateFields = req.body;
			const product = await productModel.findById(productId);

			// Process uploaded .jpeg images
			const jpegUrls = [];
			if (req.files['jpegImages']) { 
				const promisesJpeg = req.files['jpegImages'].map(async (file) => {
					const blobName = `${Date.now()}-${file.originalname}`;
					const blockBlobClient = containerClient.getBlockBlobClient(blobName);
					await blockBlobClient.upload(file.buffer, file.size,{
						blobHTTPHeaders: { blobContentType: 'application/octet-stream' },
					});
					const imageUrl = blockBlobClient.url;
					jpegUrls.push(imageUrl);
				}); 
				await Promise.all(promisesJpeg);
				product.images.jpegUrls = jpegUrls;
				await product.save();
			}

			// Process uploaded .glb image
			let glbUrl = null;
			if (req.files['glbImage']) { 
					const file = req.files['glbImage'][0];
					const blobName = `${Date.now()}-${file.originalname}`;
					const blockBlobClient = containerClient.getBlockBlobClient(blobName);
					
					await blockBlobClient.upload(file.buffer, file.size,{
						blobHTTPHeaders: { blobContentType: 'application/octet-stream' },
					});
					const imageUrl = blockBlobClient.url;
					glbUrl = imageUrl;
					product.images.glbUrl = glbUrl;
					product.ar = true;
					await product.save();
			}

			// Uploading the video 
			let videoUrl = null;
			if (req.files['video']) {
				const file = req.files['video'][0];
				const blobName = `${Date.now()}-${file.originalname}`;
				const blockBlobClient = containerClient.getBlockBlobClient(blobName);
				
				await blockBlobClient.upload(file.buffer, file.size,{
					blobHTTPHeaders: { blobContentType: 'application/octet-stream' },
				});
				videoUrl = blockBlobClient.url;
				product.video = videoUrl;
				await product.save();
			}

			const updatedProduct = await productModel.findByIdAndUpdate(
				productId,
				{ $set: updateFields },
				{ new: true, runValidators: true }
			);
			if (updatedProduct){
				res.status(200).send({
					"success":"true",
					"message":"Product updated",
					"updatedProduct":updatedProduct
				});
			} else { 
				res.status(404).send({
					"success":"false",
					"message":`Product doesn't exist`
				});
			}
		} catch (e) {
			res.status(500).send({
				"success":"false",
				"message": "Something went wrong"
			});
		}
	} else {
		res.status(401).send({
			"success":"false",
			"message":"Unauthorized User"
		});
	}
}

export const getImages = async(req,res) => {
	const products = await productModel.find({ar:true});
	const images = []
	products.forEach((product) => {
		images.push(product.images);
	});
	res.status(200).send({
		"success":"true",
		"message":"Product images fetched",
		"images":images
	});
}

// Default export (you can have one default export per module)
const defaultExport = 'Default export value';
export default defaultExport;