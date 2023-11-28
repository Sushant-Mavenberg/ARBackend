import cartModel from '../models/Cart.js';
import productModel from '../models/Product.js';

export const getCartByUserId = async(req,res) => {
  try {
    const userId = req.user._id;
    const activeCart = await cartModel.findOne({ userId, isActive: true }).populate('items.productId', 'name price images');
    if (!activeCart) {
      return res.status(404).send({ 
        "success":"false",
        "message": "cart doesn't exist for this user...",
        "cart":activeCart
      });
    }
  } catch (e) {
    return res.status(500).send({ 
      "success":"false",
      "message": e.message
    });
  }
}

export const createCart = async (req,res) => {
  try {
    const userId = req.user._id;
    const items = req.body.items;

    // Validate that 'items' is an array
    if (!Array.isArray(items)) {
    return res.status(400).send({
      "success" : "false",
      "message" : "items should be an array..."
    });
    }
    
    if (items.length === 0) {
      return res.status(400).send({
        "success" : "false",
        "message" : "items should not be an empty array..."
      });
    }

    const cart = await cartModel.findOne({ userId, isActive: true });
    if(cart){ 
      return res.status(406).send({
        "success":"false",
        "message":"user already has an active cart...",
        "cart":cart
      });
    } else {
      const totalItems = items.length;
      let totalCartPrice = 0;
      let cartItems = [];
      
      // Processing items array
      async function processItemsAsync(items) {
        try {
          for (const item of items) {
            const productId = item.productId;
            const quantity = item.quantity;
            const product = await productModel.findById({_id:productId});
            if (product) {
              const price = product.price;
              const totalItemPrice = quantity * price;
              const cartItem = {
                productId:productId,
                quantity:quantity,
                price:totalItemPrice
              }
              cartItems.push(cartItem);
              totalCartPrice += totalItemPrice;

            } else {
              return res.status(404).send({
                "success" : "false",
                "message" : `Product with ID ${productId} not found...`
              });
            }
          }
        } catch (e) {
          return res.status(500).send({
            "success" : "false",
            "message" : e.message
          });
        }
      }

      await processItemsAsync(items);

      const newCart = new cartModel({
        userId:userId,
        items:cartItems,
        totalItems:totalItems,
        totalPrice:totalCartPrice
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
// Default export (you can have one default export per module)
const defaultExport = 'Default export value';
export default defaultExport;