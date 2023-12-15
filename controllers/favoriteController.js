import favoriteModel from "../models/Favorite.js";
import productModel from "../models/Product.js";

export const fetchFavorites = async(req,res) => {
  try {
    const userId = req.user._id;

  const favorites = await favoriteModel.find({userId:userId});
  if(favorites.length !== 0){
    return res.status(200).send({
      "success":"true",
      "message":"fetched favorites successfully...",
      "favorites":favorites
    });
  } else {
    return res.status(404).send({
      "success":"false",
      "message":`favorites doesn't exist for userId ${userId}...`
    });
  }
} catch (e) {
    return res.status(500).send({
      "success":"false",
      "message": e.message
    });
  }
}
  
export const addToFavorite = async(req,res) => {
  try {
    const {productId} = req.body;
    const userId = req.user._id;
  
    if (!productId) {
      return res.status(400).send({
        "success":"false",
        "message":"please provide productId..."
      });
    }
  
    const product = await productModel.findById(productId);
  
    if (!product){
      return res.status(404).send({
        "success":"false",
        "message":"product with an id productId doesn't exist..."
      });
    }
  
    const favorites = await favoriteModel.find({userId:userId});
    const exists = favorites.find(item => item.productId.toString() === product._id.toString());
  
    if (exists) {
      return res.status(400).send({
        "success":"false",
        "message":"product already exists in favorites..."
      });
    } else {
      const newFavorite = new favoriteModel({
        userId:userId,
        productId:product._id,
        productName:product.name,
        productImage:product.images.jpegUrls[0]
      });
      const savedFavorite = await newFavorite.save();
  
      return res.status(201).send({
        "success":"true",
        "message":"product added to favorites...",
        "savedFavorite":savedFavorite
      });
    } 
  } catch (e) {
    return res.status(500).send({
      "success":"false",
      "message": e.message
    });
  }
}

export const removeFromFavorites = async(req,res) => {
  try {
    const userId = req.user._id;
    const {productId} = req.body;

    if (!productId) {
      return res.status(400).send({
        "success":"false",
        "message":"please provide productId..."
      });
    }
  
    const product = await productModel.findById(productId);
  
    if (!product){
      return res.status(404).send({
        "success":"false",
        "message":`product with an id ${productId} doesn't exist...`
      });
    }
    const favorite = await favoriteModel.findOne({userId:userId,productId:productId});

    if(favorite){
      await favoriteModel.findByIdAndDelete(favorite._id);
      return res.status(200).send({
        "success":"true",
        "message":"product deleted from favorites..."
      });
    } else {
      return res.status(404).send({
        "success":"false",
        "message":"this product is not in favorites..."
      });
    }

  } catch (e) {
    return res.status(500).send({
      "success":"false",
      "message": e.message
    });
  }
}

// Default export (you can have one default export per module)
const defaultExport = 'Default export value';
export default defaultExport;