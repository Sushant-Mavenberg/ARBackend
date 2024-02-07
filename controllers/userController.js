import userModel from "../models/User.js";
import { redisClient } from "../config/redisConfig.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt  from "jsonwebtoken";
import otplib from 'otplib';
import transporter from "../config/emailConfig.js";
import sendSMS from "../config/smsConfig.js";
import {BlobServiceClient} from "@azure/storage-blob";
import addressModel from "../models/Address.js";

dotenv.config();

// Azure Storage Blob configuration
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.BLOB_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(process.env.BLOB_STORAGE_CONTAINER);

// User Authentication...

export const userRegistration = async(req,res) => {
  const {userName,email,password,phoneNumber} = req.body;
	
  if(userName && email && password && phoneNumber){
			const user1 = await userModel.findOne({email:email});
			const user2 = await userModel.findOne({phoneNumber:phoneNumber});
      if(user1){ 
        res.status(409).send(
          {   
						"success":"false",
            "message":"Email already exists"
          }
				);
      }else if(user2){
				res.status(409).send(
          {  
						"success":"false",
            "message":"Phone Number already exists"
          }
				);
			} else {
					try {
						const salt = await bcrypt.genSalt(10);
						const hashedPassword = await bcrypt.hash(password,salt);
						
						const newUser = new userModel(
							{
								userName:userName,
								email:email,
								password:hashedPassword,
								phoneNumber:phoneNumber
							}
						);

						await newUser.save();

						res.status(201).send(
							{
								"success":"true",
								"message":"User Registered",
							}
						);
					} catch(e) {
							res.status(500).send(
								{
									"success":"false",
									"message":"Something went wrong"
								}
							);
					}
      } 
  } else {
			res.status(406).send(
				{ 
					"success":"false",
          "message":"userName, password, email, phoneNumber is required to register a user"
				} 
			);
	}    
}

export const sendOtp = async(req,res) => {
	try {
		const {phoneNumber} = req.body; 

		const secretKey = process.env.OTP_SECRET_KEY;

		// Configure the OTP length to 4 digits
		otplib.authenticator.options = {
			digits: 4,
		};

		// Generate TOTP
		function generateOTP() {
			const otp = otplib.authenticator.generate(secretKey);
			return otp;
		}

		// const user = await userModel.findOne({phoneNumber:phoneNumber});
		// if (user){

		const otp = generateOTP();

		try {
			await redisClient.set(phoneNumber,otp);
			redisClient.expire(phoneNumber,330);

			//Send SMS
			// const to = phoneNumber;
			// const body = `OTP:${otp}`
			// sendSMS(to,body);

			//Send Email
			// transporter.sendMail({
			// 	from:process.env.EMAIL_FROM,
			// 	to:user.email,
			// 	subject:"Arphibo - Login OTP",
			// 	html:`<p>The OTP for login is <strong>${otp}</strong>.</p>
			// 	<p>*This OTP will expire after 5 minutes!!!</p>`
			// });

			res.status(200).send(
				{
					"success":"true",
					"message":"OTP sent"
				}
			); 
		} catch (e) {
			res.status(500).send(
				{
					"success":"false",
					"message":"Error while sending an OTP"
				}
			);
		}

		// } else{
		// 	res.status(404).send(
		// 		{ 
		// 			"success":"false",
		// 			"message":"This Phone Number is not registered with us"
		// 		}
		// 	);
		// } 

	} catch (e) {
		res.status(500).send( 
			{
				"success":"false",
				"message":"Something went wrong. please, try again later"
			} 
		);	 
	} 
}

export const userLoginViaOtp = async(req,res) => {
	try { 
		const {phoneNumber,otp} = req.body;
		if (!(phoneNumber && otp)) { 
			return res.status(400).send({
				"success":"false",
				"message":"Please, provide phone number and OTP"
			});
		}

		let user;
		let key;

		user = await userModel.findOne({phoneNumber:phoneNumber});

		if(!user){
			const newUser = new userModel({
				phoneNumber:phoneNumber,
				email:`${phoneNumber}@nomail.arphibo.com`
			});
			await newUser.save();
			user = newUser;
		}
		key = phoneNumber;
		try { 
			const generatedOtp = await redisClient.get(key);
			if(generatedOtp){ 
				if (generatedOtp === otp) {  

					// Generate JWT token which will expire after 10 days.
					const token = jwt.sign({userID:user._id},process.env.JWT_SECRET_KEY,{expiresIn:'240h'});
					res.status(200).send(
						{ 
							"success":"true",
							"message":"Login Successful",
							"token":token,
							"firstName":user.firstName,
							"email":user.email
						} 
					);
				} else {        
					res.status(406).send(
						{ 
							"success":"false",
							"message":"Incorrect OTP"
						}
					);
				} 
			} else { 
				res.status(406).send(
					{
						"success":"false",
						"message":"Invalid OTP"
					}
				);
			}
			
		} catch (e) { 
			res.status(500).send(
				{
					"success" : "false",
					"message" : "Something went wrong"
				}
			);
		}
		
	} catch (e) {
		res.status(500).send(
			{
				"success" : "false",
				"message" : "Something went wrong"
			}
		);
	} 
} 

export const userLoginViaPassword = async(req,res) => {
	try { 
		const {email,password} = req.body;
		if (email && password){
			const user = await userModel.findOne({email:email});
			if (user){ 
				const isMatch = await bcrypt.compare(password,user.password);

				if (isMatch){

					// Generate JWT token
					const token = jwt.sign({userID:user._id},process.env.JWT_SECRET_KEY,{expiresIn:'240h'});

					res.status(200).send(
						{
							"success":"true",
							"message":"Login Successful",
							"token":token,
							"firstName":user.firstName,
							"email":user.email,
						
						}
					);
				} else {
					res.status(406).send(
						{
							"success":"false",
							"message":"Incorrect Email or Password"
						}
					);
				}
			} else {
				res.status(404).send(
					{
						"success":"false",
						"message":"You need to Register before Login"
					}
				);
			}
		} else {
			res.status(406).send(
				{ 
					"success":"false",
          "message":"All Fields are required"
				}
			);
		}
	} catch (e){
		res.status(500).send(
			{ 
				"success":"false",
				"message":e.message
			}
		);
	}
}

export const changeUserPassword = async(req,res) => {
	const {currentPassword,newPassword} = req.body;
	const userId = req.user._id;
	const user = await userModel.findById(userId);

	if(!(await bcrypt.compare(currentPassword,user.password))){
		return res.status(400).send({
			"success":"false",
			"message":"Incorrect current password"
		});
	}

	if (newPassword && currentPassword) {
		if(currentPassword === newPassword){
			return res.status(400).send(
				{
					"success":"false",
					"message":"You can't use your old password as a new password"
				}
			);
		}else {
			try {
				const salt = await bcrypt.genSalt(10);
				const newHashedPassword = await bcrypt.hash(newPassword,salt);
				await userModel.findByIdAndUpdate(req.user._id,{$set:{password:newHashedPassword}});
				res.status(200).send(
					{
						"success":"true",
						"message":"Password changed"
					}
				);
			} catch(e) {   
				res.status(500).send(
					{
						"success":"false",
						"message":e.message
					}
				);
			}
		} 
	}else {
		res.status(406).send(
			{
				"success":"false",
				"message":"All fields are required"
			}
		);
	}
}

export const sendUserPasswordResetEmail = async(req,res) => {
		const {email} = req.body;
		if (email) {
			const user = await userModel.findOne({email:email});
			let secret;
			if (user) {
				try {
					secret = user._id + process.env.JWT_SECRET_KEY
					const token = jwt.sign({userID:user._id},secret,{expiresIn:"15m"});
					const link = `http://127.0.0.1:3000/api/user/reset-password/${user._id}/${token}`;
					console.log(link);

					//Send Email
					transporter.sendMail({
						from:process.env.EMAIL_FROM,
						to:user.email,
						subject:"Arphibo - Password Reset Link",
						html:`<a href=${link}>Click Here<a/> to reset your password.
						<p>*This link will expire after 15 minutes!</p>`
					});

					res.status(200).send(
						{
							"success":"true",
							"message":"password reset link has been sent to you via email..."
						}
					);
				} catch(e) {
					res.status(500).send(
						{
							"success":"false",
							"message":e.message
						}
					);
				}
				
			}else {
				res.status(404).send(
					{
						"success":"false",
						"message":"email doesn't exist..."
					}
				);
			}
		}else{
			res.status(406).send(
				{
					"success":"false",
					"message":"email is required..."
				}
			);
		}
}

export const userPasswordReset = async(req,res) => {
	const {password,confirmPassword} = req.body;
	const {id,token} = req.params;
	const user = await userModel.findById(id);
	const new_secret = user._id + process.env.JWT_SECRET_KEY;
	try {
		jwt.verify(token,new_secret);
		if (password && confirmPassword){
			if (password === confirmPassword){
				const salt = await bcrypt.genSalt(10);
				const newHashedPassword = await bcrypt.hash(password,salt);
				await userModel.findByIdAndUpdate(user._id,{$set:{password:newHashedPassword}});
				res.status(200).send(
					{
						"success":"true",
						"message":"password reset complete..."
					}
				);
			}else {
				res.status(406).send(
					{
						"success":"false",
						"message":"Password and confirmPassword fields don't match..."
					}
				);
			}
		}else {
			res.status(406).send(
				{
					"success":"false",
					"message":"All fields are required"
				}
			);
		}
	} catch (e){
		res.status(500).send(
			{
				"success":"false",
				"message":e.message
			}
		);
	}
}

export const userLogout = async(req,res) => {
	const user = req.user;
	// Issue a new token with a very short expiration time
  const token = jwt.sign({userID:user._id},process.env.JWT_SECRET_KEY,{expiresIn:"1s"});
	res.status(200).send(
		{
			"success":"true",
			"message":"you have been successfully logged out...please use this new token for any subsequent requests...",
			"Token" : token
		}
	);
}

// Address
export const fetchAddresses = async(req,res) => {
	try {
		if(!req.user){
			return res.status(400).send({
				"success":"false",
				"message":"Login required"
			});
		}
		const userId = req.user._id;
		const addresses = await addressModel.find({userId:userId});
		if (addresses.length === 0){
			return res.status(404).send({
				"success":"false",
				"message":"User doesn't have any address"
			});
		} 
		return res.status(200).send({
			"success":"true",
			"message":"Addresses fetched",
			"addresses":addresses
		}); 
	} catch (e) {
		return res.status(500).send({
			"success":"false",
			"message":e.message
		}); 
	}
}

export const addAddress = async(req,res) => {
	try {
		if(!req.user){
			return res.status(400).send({
				"success":"false",
				"message":"Login Required"
			});
		}
		const userId = req.user._id;
		const newAddress = new addressModel({
			userId:userId,
			...req.body
		});
		const savedAddress = await newAddress.save();
		return res.status(201).send({
			"success":"true",
			"message":"Address added",
			"savedAddress":savedAddress
		});
	} catch (e) {
		return res.status(500).send({
			"success":"false",
			"message":e.message
		});
	}
}

export const updateAddress = async(req,res) => {
	try {
		const {id} = req.params;
		const updatedAddress = await addressModel.findByIdAndUpdate(id, { $set: req.body }, { new: true });
		if(!updatedAddress){ 
			return res.status(404).send({
				"success":"false",
				"message":"Address not found"
			});
		} 
		return res.status(200).send({
			"success":"true",
			"message":"Address updated",
			"updatedAddress":updatedAddress 
		});
	} catch (e) { 
		return res.status(500).send({
			"success":"false",
			"message":e.message
		});
	}
}

export const deleteAddress = async(req,res) => {
	try { 
		const {id} = req.params;
		await addressModel.findByIdAndDelete(id);
		return res.status(200).send({
			"success":"true",
			"message":"Address deleted"
		});
	} catch (e) {
		return res.status(500).send({
			"success":"false",
			"message":"Something went wrong"
		});
	}
}

// User Profile...
export const updateUserProfile = async(req,res) => {
	try {
		const userId = req.user._id;
		const updateFields = req.body;			

		// Find the user by ID and update the specified fields
		const updatedUserProfile = await userModel.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });
		if (!updatedUserProfile){
			return res.status(404).send({
				"success":"false",
				"message":"User not found"
			});
		}

		return res.status(200).send({
			"success":"true",
			"message":"User profile updated",
			"updatedUserProfile":await userModel.findById(userId).select("-accountStatus -userRole")
		});

	} catch (e) {
		console.log(e);
		return res.status(500).send({
			"success":"false",
			"message": e.message
		});
	}
}

export const getUser = async(req,res) => {
	try {
		return res.status(200).send({
			"success":"true",
			"message":"user fetched",
			"user":req.user
		});
	} catch (e) {
		console.log(e);
		return res.status(500).send({
			"success":"false",
			"message": "Error fetching user"
		});
	}
}
// Default export (you can have one default export per module)
const defaultExport = 'Default export value';
export default defaultExport;
