import Razorpay from 'razorpay';
import paymentModel from '../models/Payment.js';
import orderModel from '../models/Order.js';
import crypto from 'crypto';
import io from '../server.js';
import userModel from '../models/User.js';

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
    
    if(!cartTotal){
      return res.status(406).send(
				{ 
					"success":"false",
					"message":"cartTotal is required to create an Order"
				} 
			);
    }

    const razorpayOrder = await razorpayInstance.orders.create({
      amount:cartTotal * 100,
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
      "razorpayOrderId":razorpayOrder.id,
      "amount":razorpayOrder.amount
    });
  } catch (e) {
    res.status(500).send({
      "success":"false",
      "message":"Something went wrong"
    });
  }
}


export const verifyPayment = async(req,res) => {
  try {
    if(!req.user){
			return res.status(400).send({
				"success":"false",
				"message":"Login Required"
			});
		}

    const userId = req.user._id;
    const {orderId,amount,razorpayPaymentId,razorpayOrderId,razorpaySignature,paymentMethod} = req.body;
    console.log(orderId,"1");
    if(!(orderId && amount && paymentMethod && razorpayPaymentId && razorpayOrderId && razorpaySignature)) {
      return res.status(200).send({ 
        "success":"false",
        "message":"orderId,amount,paymentMethod,razorpayPaymentId,razorpayOrderId and razorpaySignature required"
      });
    } 

    // Function to verify the Razorpay payment signature
    const verifyRazorpaySignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
      try {
        // Concatenate the orderId and paymentId with a pipe ('|') symbol
        const text = `${razorpayOrderId}|${razorpayPaymentId}`;

        // Create an HMAC instance with SHA256 hash function and your secret key
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);

        // Update the HMAC with the text data
        hmac.update(text);

        // Get the computed HMAC signature
        const generatedSignature = hmac.digest('hex');
        console.log({generatedSignature:generatedSignature});
        console.log({razorpaySignature:razorpaySignature});
        // Compare the generated signature with the received signature
        return generatedSignature === razorpaySignature;
      } catch (error) {
        // Handle any errors during the verification process
        console.error('Error verifying Razorpay signature:', error);
        return false;
      }
    };

    const isVerified = verifyRazorpaySignature(razorpayOrderId,razorpayPaymentId,razorpaySignature);
    if (isVerified) { 

      const newPayment = new paymentModel({
        userId : req.user._id,
        orderId:orderId,
        amount:amount,
        razorpayPaymentId:razorpayPaymentId,
        razorpayOrderId:razorpayOrderId,
        razorpaySignature:razorpaySignature,
        paymentMethod:paymentMethod
      });

      await newPayment.save();
      console.log(newPayment);

      const order = await orderModel.findByIdAndUpdate(orderId,{$set:{paymentId:newPayment._id,paymentStatus:'paid'}},{ new: true });
      console.log(order);

      // const user =  await userModel.findById(userId);
      // const amountSpent = user.amountSpent + amount
      // const loyaltyPoints = parseInt(user.loyaltyPoints) + parseInt(amount/100);
      
      // user.loyaltyPoints = loyaltyPoints;
      // user.amountSpent = amountSpent;
      // await user.save();

      // io.on('connection', (socket) => {
      //   console.log('Server connected...');
        
      //   socket.on('orderPlaced', () => { 
      //     console.log(`Order placed: ${order._id}`);
      //     io.emit('newOrder', { order: order });
      //   });
      // });

      return res.status(200).send({
        "success":"true",
        "message":`Order placed`,
        "order":order
      });
    } else { 
      const order = orderModel.findByIdAndUpdate(orderId,{$set:{paymentStatus:'failed'}},{ new: true });

      return res.status(200).send({
      "success":"false",
      "message":"Payment not verified"
    });
    }

  } catch (e) {
    console.log(e);
    return res.status(500).send({
      "success":"false",
      "message":"Something went wrong"
    });
  }
}

// Default export (you can have one default export per module) 
const defaultExport = 'Default export value';
export default defaultExport;