import cartModel from '../models/Cart.js';
import productModel from '../models/Product.js';

export const getCartByUserId = async(req,res) => {
  try {
    const userId = req.user._id;
  
    const activeCart = await cartModel.findOne({ userId, isActive: true });
    if (activeCart) {
      return res.status(200).send({ 
        "success":"true",
        "message": "cart fetched successfully...",
        "cart":activeCart
      });
    } else {
      return res.status(404).send({ 
        "success":"false",
        "message": "cart doesn't exist for this user...",
      });
    }
  } catch (e) {
    return res.status(500).send({ 
      "success":"false",
      "message": e.message
    });
  }
}

export const addToCart = async (req,res) => {
  try {
    const userId = req.user._id;
    const productId = req.body.productId;

    // Validate that 'item'
    if (!productId) {
      return res.status(400).send({
        "success":"false",
        "message":"please provide productId..."
      });
    }
    
    // Get product data from database
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).send({
        "success":"false",
        "message":"product doesn't exist..."
      });
    }

    // Check if cart exists or not
    const cart = await cartModel.findOne({ userId, isActive: true });
    if(cart){ 
      const existingItems = cart.items;

      const existingItem = existingItems.find(item => item.productId.toString() === product._id.toString());

      // If product already exists then increase the quantity
      if(existingItem){
        const existingItemIndex = existingItems.indexOf(existingItem);
        const updatedExistingItem = {
          productId:product.id,
          productName:product.name,
          productImage:product.images.jpegUrls[0],
          quantity:existingItem.quantity + 1,
          price:existingItem.price + product.price
        } 
        const updatedItems = existingItems.map((item, index) =>
          index === existingItemIndex ? updatedExistingItem : item
        );
  
        const updatedTotalPrice = cart.totalPrice + product.price
        const updatedTotalItems = cart.totalItems + 1;
        const updatedCart = {
          userId:userId,
          items:updatedItems,
          totalItems:updatedTotalItems,
          totalPrice:updatedTotalPrice
        }
        
        await cartModel.updateOne(
          {_id:cart._id}, { $set: updatedCart }
        );
        
        const finalCart = await cartModel.findById(cart._id);
        return res.status(200).send({
          "success":"true",
          "message":"cart updated successfully...",
          "cart":finalCart
        });
      } else {
        const newItem = {
          productId:product.id,
          productName:product.name,
          productImage:product.images.jpegUrls[0],
          quantity:1,
          price:product.price
        }
        const updatedItems = [...cart.items,newItem];
        const updatedTotalPrice = cart.totalPrice + product.price
        const updatedTotalItems = cart.totalItems + 1;
        const updatedCart = {
          userId:userId,
          items:updatedItems,
          totalItems:updatedTotalItems,
          totalPrice:updatedTotalPrice
        }

        await cartModel.updateOne(
          {_id:cart._id}, { $set: updatedCart }
        );
        const finalCart = await cartModel.findById(cart._id);
        return res.status(200).send({
          "success":"true",
          "message":"cart updated successfully...",
          "cart":finalCart
        });
      }
    } else {
      let cartItems = [];

      const cartItem = {
        productId:product.id,
        productName:product.name,
        productImage:product.images.jpegUrls[0],
        quantity:1,
        price:product.price
      }

      cartItems.push(cartItem);

      const newCart = new cartModel({
        userId:userId,
        items:cartItems,
        totalItems:1,
        totalPrice:product.price
      });
      const savedCart = await newCart.save();
      
      return res.status(201).send({
        "success":"true",
        "message":"cart created successfully...",
        "newCart":savedCart
      });
    }
  } catch (e) {
    return res.status(500).send({ 
      "success":"false",
      "message": e.message
    });
  }
}

export const updateCart = async(req,res) => {
  try {
    const { cartId } = req.params;
    const { action,productId } = req.body; 
    const userId = req.user._id;

    if(!(action && productId)){
      return res.status(400).send({ 
        "success":"false",
        "message": "please provide both action and productId..." 
      });
    }

    // Find the cart for the user
    const cart = await cartModel.findOne({ _id:cartId,userId:userId,isActive:true });

    if (!cart) {
      return res.status(404).send({ 
        "success":"false",
        "message": "cart doesn't exist..." 
      });
    }

    const product = await productModel.findById(productId);
    if(!product) {
      return res.status(404).send({ 
        "success":"false",
        "message": "invalid productId" 
      });
    }
    // Find the item in the cart
    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex === -1) {
      return res.status(404).send({ 
        "success":"false",
        "message": `product with an id ${productId} doesn't exist in cart...` 
      });
    }

    // Handle the action based on the provided property
    if (action === 'delete') {
      // Remove the entire product from the cart
      cart.totalItems -= cart.items[itemIndex].quantity;
      cart.totalPrice -= cart.items[itemIndex].price;
      cart.items.splice(itemIndex, 1);

    } else if (action === 'decrease') {
      // Decrease the quantity
      if (cart.items[itemIndex].quantity > 1) {
        cart.items[itemIndex].quantity -= 1;
        cart.items[itemIndex].price -= product.price;
        cart.totalItems -= 1;
        cart.totalPrice -= product.price;
      } else {
        // Remove the item if the quantity becomes 0
        cart.items.splice(itemIndex, 1);
        cart.totalItems -= 1;
        cart.totalPrice -= product.price;
      }
    } else if (action === "increase") {
      if(product.quantity > cart.items[itemIndex].quantity) {
        cart.items[itemIndex].quantity += 1;
        cart.items[itemIndex].price += product.price;
        cart.totalItems += 1;
        cart.totalPrice += product.price;
      } else {
        return res.status(400).send({ 
          "sucess":"false",
          "message": "product out of stock..." 
        });
      }
    } else {
      return res.status(400).send({ 
        "sucess":"false",
        "message": "invalid action..." 
      });
    }

    // Save the updated cart
    const updatedCart = await cart.save();

    res.status(200).send({
      "success":"true",
      "message":"cart updated successfully...",
      "updatedCart":updatedCart
    });
    
  } catch (e) {
    return res.status(500).send({ 
      "success":"false",
      "message": e.message
    });
  }
}

export const deleteCart = async(req,res) => {
  const userId = req.user._id;
  const {cartId} = req.params;
  if (!cartId) { 
    res.status(400).send({
      "success":"false",
      "message":"please provide cartId..."
    })
  }
  const cart = await cartModel.findOne({_id:cartId,userId:userId,isActive:true});
  if(!cart){
    return res.status(404).send({ 
      "success":"false",
      "message": "cart doesn't exist..." 
    });
  }

  cart.isActive = false;
  await cart.save();
  res.status(200).send({
    "success": "true",
    "message": "cart deleted successfully..."
  }); 
}


// Default export (you can have one default export per module)
const defaultExport = 'Default export value';
export default defaultExport;