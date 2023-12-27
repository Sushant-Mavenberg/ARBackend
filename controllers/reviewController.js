import reviewModel from "../models/Review.js";
import productModel from "../models/Product.js";

export const fetchProductReviews = async(req,res) => {
  try {
    const {productId }= req.params;
    if (!productId) {
      return res.status(400).send({
        "success":"false",
        "message":"Product Id is required"
      });
    } 

    const reviews = await reviewModel.find({productId:productId, isVerified:true});
    if (reviews.length === 0) {
      return res.status(404).send({
        "success":"false",
        "message":"Reviews not found"
      });
    }
    return res.status(200).send({
      "success":"true",
      "message":"Reviews fetched",
      "reviews":reviews
    });
  } catch (e) {
    res.status(500).send({
      "success":"false",
      "message":"Something went wrong"
    });
  }
}

export const postReview = async(req,res) => {
  try {
    
    if(!req.user){
      return res.status(400).send({
        "success":"false",
        "message":"Please Login"
      });
    } 
    const userId = req.user._id;
    const {productId,rating,comment} = req.body;
  
    if (!(productId && rating)) {
      return res.status(400).send({
        "success":"false",
        "message":"Product Id and Rating is required"
      })
    } 

    // Create a new review based on the request body
    const newReview = new reviewModel({
      userId:userId,
      productId:productId,
      ...req.body
    });
    
    // Save the review to the database
    const savedReview = await newReview.save();
    
    return res.status(201).send({
      "success":"true",
      "message":"Review posted",
      "savedReview": savedReview
    });
  } catch (e) {
    res.status(500).send({
      "success":"false",
      "message":e.message
    });
  }
}

export const verifyReview = async(req,res) => {
  try {
    const {reviewId} = req.body;

    if(!(req.user.userRole === "admin" || req.user.userRole === "super-admin")){
      return res.status(401).send({
        "success":"false",
        "message":"Not Authorized"
      });
    }
    
    if (!reviewId){
      return res.status(400).send({
        "success":"false",
        "message":"Please provide reviewId"
      });
    }

    const review = await reviewModel.findById(reviewId);

    if (review) {
      review.isVerified = true;
    review.save()
    } else {
      return res.status(404).send({
        "success":"false",
        "message":"Review not found"
      });
    }
    
    // Updating product ratings
    const product = await productModel.findById(review.productId);

    if (!product) {
      return res.status(404).send({ 
        "success":"false",
        "message":"Product not found"
      });
    }

    // Update the number of ratings
    product.numberOfRatings += 1;

    // Update the number of reviews
    const comment = review.comment;
    product.numberOfReviews = comment ? product.numberOfReviews+1 : product.numberOfReviews;

    const rating = review.rating;
    // Update the average rating
    product.starNumbers[rating-1] += 1;
    
    let totalRatingsSum = 0;
    for (const [index, value] of product.starNumbers.entries()) {
      totalRatingsSum += ((index+1)*value);
    }
    product.averageRating = totalRatingsSum/product.numberOfRatings;
    
    // Update the star percentages
    for (const [index, value] of product.starNumbers.entries()) {
      const starRatio = (value/(product.starNumbers.reduce((accumulator, currentValue) => accumulator + currentValue, 0)));
      const starPercentage = (starRatio * 100).toFixed(2);
      product.starPercentages[index] = starPercentage;
    }
   
    await product.save();

    return res.status(200).send({
      "success":"true",
      "message":"Review verified"
    });

  } catch (e) {
    console.log(e);
    res.status(500).send({
      "success":"false",
      "message":"Something went wrong"
    });
  }
}

export const deleteReview = async(req,res) => {
  try {
    if(!req.user){
      return res.status(400).send({
        "success":"false",
        "message":"Please Login"
      });
    }
    const { reviewId } = req.params;
    const userId = req.user._id;

    if(!reviewId){
      res.status(400).send({
        "success":"false",
        "message":"Review Id is required"
      });
    }

    // Find the review by ID and userId and remove it
    const archivedReview = await reviewModel.findOne({userId:userId,_id:reviewId,archived:false});

    if (!archivedReview) {
      return res.status(404).send({ 
        "success":"false",
        "message":"Review not found" 
      });
    }

    archivedReview.archived = true;
    archivedReview.save()

    res.status(200).send({ 
      "success": "true",
      "message": "Review deleted successfully" 
    });
  } catch (e) {
    res.status(500).send({
      "success":"true",
      "message":"Internal server error"
    });
  }
}

export const fetchUserRating = async(req,res) => {
  try {
    if(!req.user){
      return res.status(400).send({
        "success":"false",
        "message":"Login Required"
      });
    }
    const {productId} = req.params;
    if (!productId){
      return res.status(400).send({
        "success":"false",
        "message":"productId is required"
      });
    }

    const userId = req.user._id;
    const review = await reviewModel.findOne({productId:productId,userId:userId,isVerified:true});

    if(review){
      const rating = review.rating;
      const dateString = review.createdAt;
      const date = new Date(dateString);
  
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZone: 'Asia/Kolkata', // Setting time zone to India (IST)
      };
  
      const userReadableFormat = date.toLocaleString('en-IN', options);
      return res.status(200).send({
        "success":"true",
        "message":"Rating Fetched",
        "rating":rating,
        "date":userReadableFormat
      });
    } else {
      return res.status(404).send({
        "success":"false",
        "message":"Rating not found for this product"
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).send({
      "success":"true",
      "message":"Something went wrong"
    });
  }
}
// Default export (you can have one default export per module)
const defaultExport = 'Default export value';
export default defaultExport;