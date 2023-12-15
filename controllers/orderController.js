import orderModel from "../models/Order.js";
import cartModel from "../models/Cart.js";

export const createOrder = async(req,res) => {
  try {
    const userId = req.user._id;
    const {cartId,shippingAddress} = req.body;
    const shippingAmount = 40;
    const taxAmount = 20;
    
    if(!(cartId && shippingAddress)){
      return res.status(406).send(
				{ 
					"success":"false",
					"message":"cartId and shippingAddress is required"
				} 
			);
    }

    const cart = await cartModel.findById(cartId);
    const cartTotal = cart.totalPrice;
    const totalAmount = cartTotal + shippingAmount + taxAmount;

    const newOrder = new orderModel({
      userId:userId,
      cartId:cartId,
      shippingAddress:shippingAddress,
      shippingAmount:shippingAmount,
      taxAmount:taxAmount,
      totalAmount:totalAmount
    });

    const savedOrder = await newOrder.save();
    res.status(201).send({
      "success":"true",
      "message":"new order has been created successfully",
      "newOrder":savedOrder
    });
  } catch (e) {
    res.status(500).send({
      "success":"false",
      "message":e.message
    });
  }
}

// Default export (you can have one default export per module)
const defaultExport = 'Default export value';
export default defaultExport;