import orderModel from "../models/Order.js";

export const fetchOrders = async(req,res) => {
  try {
    if(!req.user){
      return res.status(400).send({
        "success":"false",
        "message":"Login Required"
      });
    } 
  
    const userRole = req.user.userRole;
    if (!(userRole === 'admin' || userRole === 'super-admin')){
      return res.status(401).send({
        "success":"false",
        "message":"Not Authorized"
      });
    }
  
    const orders = await orderModel.find({});
  
    return res.status(200).send({
      "success":"true",
      "message":"Orders fetched",
      "orders":orders
    });
  } catch (e) {
    return res.status(500).send({
      "success":"false",
      "message":"Something went wrong"
    });
  }
}

export const createOrder = async(req,res) => {
  try {
    if(!req.user){
      return res.status(400).send({
        "success":"false",
        "message":"Login Required"
      });
    } 
    const userId = req.user._id 
    const newOrder = new orderModel({
      userId:userId,
      ...req.body
    });
    await newOrder.save();
    console.log({newOrder:newOrder});
    return res.status(201).send({
      "success":"true",
      "message":"Order placed",
      "orderId":newOrder.id
    });
  } catch (e) {
    return res.status(500).send({
      "success":"false",
      "message":"Something went wrong"
    });
  }
}

export const updateOrderStatus = async(req,res) => {
  try {
    if(!req.user){
      return res.status(400).send({
        "success":"false",
        "message":"Login Required"
      });
    } 
  
    const userRole = req.user.userRole;
    if (!(userRole === 'admin' || userRole === 'super-admin')){
      return res.status(401).send({
        "success":"false",
        "message":"Not Authorized"
      });
    }

    const {status} = req.body
    const orderId = req.params
    if(!(status && orderId)){
      return res.status(400).send({
        "success":"false",
        "message":"Updated status and order Id  required"
      });
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { $set: status },
      { new: true, runValidators: true }
    );

    return res.status(200).send({
      "success":"true",
      "message":"Order Status Updated",
      "updatedOrder":updatedOrder
    });
  } catch (e) {
    return res.status(500).send({
      "success":"false",
      "message":"Something went wrong"
    });
  }
}

// Default export (you can have one default export per module)
const defaultExport = 'Default export value';
export default defaultExport;
