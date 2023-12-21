import orderModel from "../models/Order.js";
import Razorpay from 'razorpay';

// Razorpay instance 
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async(req,res) => {

  try{
    if(!req.user){
			return res.status(400).send({
				"success":"false",
				"message":"Login Required"
			});
		}

    const {cartTotal} = req.body;
    const shippingAmount = 40;
    const taxAmount = 20;
    
    if(!cartTotal){
      return res.status(406).send(
				{ 
					"success":"false",
					"message":"cartTotal is required to create an Order"
				} 
			);
    }

    const totalAmount = parseFloat(cartTotal) + parseFloat(shippingAmount) + parseFloat(taxAmount);

    const razorpayOrder = await razorpayInstance.orders.create({
      amount:totalAmount * 100,
      currency:"INR",
			receipt:`order_receipt_${Date.now()}`
    });

		if(!razorpayOrder){
			return res.status.send({
				"success":"false",
				"message":"Unable to create a Razorpay order"
			});
		}

    return res.status(201).send({
      "success":"true",
      "message":"New Razorpay Order Created",
      "orderId":razorpayOrder.id,
      "orderTotal":razorpayOrder.amount
    });
  } catch (e) {
    res.status(500).send({
      "success":"false",
      "message":"Something went wrong"
    });
  }
}

// Default export (you can have one default export per module)
const defaultExport = 'Default export value';
export default defaultExport;