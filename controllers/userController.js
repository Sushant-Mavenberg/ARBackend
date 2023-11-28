import userModel from "../models/User.js";
import { redisClient } from "../config/redisConfig.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt  from "jsonwebtoken";
import otplib from 'otplib';
import transporter from "../config/emailConfig.js";
import sendSMS from "../config/smsConfig.js";

dotenv.config();

export const userRegistration = async(req,res) => {
  const {userName,email,password,phoneNumber} = req.body;
	
  if(userName && email && password && phoneNumber){
			const user1 = await userModel.findOne({email:email});
			const user2 = await userModel.findOne({phoneNumber:phoneNumber});
      if(user1){
        res.status(409).send(
          {  
						"success":"false",
            "message":"email already exists..."
          }
				);
      }else if(user2){
				res.status(409).send(
          {  
						"success":"false",
            "message":"phoneNumber already exists..."
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
								"message":"user has been Registered successfully...",
							}
						)
					} catch(e) {
							res.status(500).send(
								{
									"success":"false",
									"message":e.message
								}
							);
					}
      }
  } else {
			res.status(406).send(
				{ 
					"success":"false",
          "message":"all fields are required..."
				}
			);
	}    
}

export const sendOtp = async(req,res) => {
	const {userInput} = req.body;
	let email;
	let phoneNumber;

	// Regular expression to validate phone number and email
  const phoneNumberPattern = /^(\+91)[0-9]{10}$/;
	const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	
	if (phoneNumberPattern.test(userInput)){
		phoneNumber = userInput;
	} else if (emailPattern.test(userInput)){
		email = userInput;
	}

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

	if (email){
		const user = await userModel.findOne({email:email});
		if (user){
			const otp = generateOTP();

			try {
				await redisClient.set(user.email,otp);
				redisClient.expire(user.email,330);

				//Send Email
				transporter.sendMail({
					from:process.env.EMAIL_FROM,
					to:user.email,
					subject:"Arphibo - Login OTP",
					html:`<p>The OTP for login is <strong>${otp}</strong>.</p>
					<p>*This OTP will expire after 5 minutes!!!</p>`
				});
				res.status(200).send(
					{
						"success":"true",
						"message":"otp has been sent to you via email..."
					}
				);
			} catch (e) {
				res.status(500).send(
					{
						"success":"false",
						"message":e.message
					}
				);
			}

		} else{
			res.status(404).send(
				{ 
					"success":"false",
					"message":"email doesn't exist..."
				}
			);
		}
	} else if (phoneNumber) {
		const user = await userModel.findOne({phoneNumber:phoneNumber});
		if (user){
			const otp = generateOTP();

			try {
				await redisClient.set(user.phoneNumber,otp);
				redisClient.expire(user.phoneNumber,330);

				//Send SMS
				const to = user.phoneNumber;
				const body = `${otp} This is the OTP to log in to your Arphibo app...`
				sendSMS(to,body);

				res.status(200).send(
					{
						"success":"true",
						"message":"otp has been sent to you via sms..."
					}
				);
			} catch (e) {
				res.status(500).send(
					{
						"success":"false",
						"message":e.message
					}
				);
			}

		} else{
			res.status(404).send(
				{ 
					"success":"false",
					"message":"phoneNumber doesn't exist..."
				}
			);
		}

	} else {
		res.status(406).send(
			{ 
				"success":"false",
				"message":"please provide valid email or phone number to recieve an OTP...a phone number should have a country code..."
			}
		);
	}
}

export const userLoginViaOtp = async(req,res) => {
	const {email,phoneNumber,otp} = req.body;

	let user;
	let key;
	if (email && otp){
		user = await userModel.findOne({email:email});
		if (user){
			key = user.email;
		}
		
	}else if (phoneNumber && otp){
		user = await userModel.findOne({phoneNumber:phoneNumber});
		if (user){
			key = user.phoneNumber;
		}
	}else {
		res.status(406).send(
			{
				"success":"false",
				"message":"please provide email and otp or phoneNumber and otp..."
			}
		);
	}
	
	try {
		const generatedOtp = await redisClient.get(key);
		if(generatedOtp){
			if (generatedOtp === otp) {
				// Generate JWT token which will expire after 10 days.
				const token = jwt.sign({userID:user._id},process.env.JWT_SECRET_KEY,{expiresIn:'240h'});
				res.status(200).send(
					{
						"success":"true",
						"message":"you are logged in...",
						"token":token
					}
				);
			} else {
				res.status(406).send(
					{
						"success":"false",
						"message":"incorrect otp..."
					}
				);
			}
		} else {
			res.status(406).send(
				{
					"success":"false",
					"message":"invalid otp..."
				}
			);
		}
		
	} catch (e) {
		res.status(500).send(
			{
				"success" : "false",
				"message" : e.message
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
					const token = jwt.sign({userID:user._id},process.env.JWT_SECRET_KEY,{expiresIn:'24h'});

					res.status(200).send(
						{
							"success":"true",
							"message":"you are logged in...",
							"token":token
						}
					);
				} else {
					res.status(406).send(
						{
							"success":"false",
							"message":"incorrect Email or Password..."
						}
					);
				}
			} else {
				res.status(404).send(
					{
						"success":"false",
						"message":"you need to register before login..."
					}
				);
			}
		} else {
			res.status(406).send(
				{ 
					"success":"false",
          "message":"all fields are required..."
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
	const {password,confirmPassword} = req.body;
	if (password && confirmPassword) {
		if (password !== confirmPassword) {
			res.status(409).send(
				{
					"success":"false",
					"message":"password and confirmPassword fields don't match..."
				}
			);
		}else {
			try{
				const salt = await bcrypt.genSalt(10);
				const newHashedPassword = await bcrypt.hash(password,salt);
				await userModel.findByIdAndUpdate(req.user._id,{$set:{password:newHashedPassword}});
				res.status(200).send(
					{
						"success":"true",
						"message":"password changed successfully..."
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
				"message":"all fields are required..."
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
				try{
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
					"message":"Aal fields are required..."
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

// Default export (you can have one default export per module)
const defaultExport = 'Default export value';
export default defaultExport;