import userModel from "../models/User.js";
import bcrypt from "bcrypt";
import jwt  from "jsonwebtoken";
import transporter from "../config/emailConfig.js";

export const userRegistration = async(req,res) => {
  const {userName,email,password,phoneNumber} = req.body;

	// Regular expression to validate phone number and email
  const phoneNumberPattern = /^[0-9]{10}$/;
	const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	
  if(userName && email && password && phoneNumber){
		if(!phoneNumberPattern.test(phoneNumber)){
			res.status(406).send({
				"Status":"Failed",
				"Message":"Please enter a valid phone number..."
			});
		}else if(! emailPattern.test(email)){
			res.status(406).send({
				"Status":"Failed",
				"Message":"Please enter a valid email address..."
			});
		}else {
			const user = await userModel.findOne({email:email});
      if(user){
        res.status(409).send(
          {  
						"Status":"Failed",
            "Message":"Email already exists..."
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
								"Status":"Success",
								"Message":"User has been Registered successfully...",
							}
						)
					} catch(e) {
							console.error(e);
							res.status(500).send(
								{
									"Status":"Failed",
									"Message":"Unable to Register..."
								}
							);
					}
      }
		}
    
  } else {
			res.status(406).send(
				{ 
					"Status":"Failed",
          "Message":"All fields are required..."
				}
			);
	}    
}

export const userLogin = async(req,res) => {
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
							"Status":"Success",
							"Message":"You are logged in...",
							"token":token
						}
					)
				} else {
					res.status(406).send(
						{
							"Status":"Failed",
							"Message":"Incorrect Email or Password..."
						}
					)
				}
			} else {
				res.status(404).send(
					{
						"Status":"Failed",
						"Message":"You need to register before login..."
					}
				)
			}
		} else {
			res.status(406).send(
				{ 
					"Status":"Failed",
          "Message":"All fields are required..."
				}
			);
		}
	} catch (e){
		console.log(e);
		res.status(500).send(
			{ 
				"Status":"Failed",
				"Message":"Unable to login..."
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
					"Status":"Failed",
					"Message":"Password and Confirm Password fields don't match..."
				}
			)
		}else {
			const salt = await bcrypt.genSalt(10);
			const newHashedPassword = await bcrypt.hash(password,salt);
			console.log(req.user);
			await userModel.findByIdAndUpdate(req.user._id,{$set:{password:newHashedPassword}});
			res.status(200).send(
				{
					"Status":"Success",
					"Message":"Password Changed Successfully..."
				}
			);
		}
	}else {
		res.status(406).send(
			{
				"Status":"Failed",
				"Message":"All Fields are required..."
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
				secret = user._id + process.env.JWT_SECRET_KEY
				const token = jwt.sign({userID:user._id},secret,{expiresIn:"15m"});
				const link = `http://127.0.0.1:3000/api/user/reset-password/${user._id}/${token}`;
				console.log(link);

				//Send Email
				let info = await transporter.sendMail({
					from:process.env.EMAIL_FROM,
					to:user.email,
					subject:"Arphibo - Password Reset Link",
					html:`<a href=${link}>Click Here<a/> to reset your password.`
				});

				res.status(200).send(
					{
						"Status":"Success",
						"Message":"Password reset link has been sent to you via email...",
						"Info":info
					}
				)
			}else {
				res.status(404).send(
					{
						"Status":"Failed",
						"Message":"Email doesn't exist..."
					}
				)
			}
		}else{
			res.status(406).send(
				{
					"Status":"Failed",
					"Message":"Email is required..."
				}
			)
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
						"Status":"Success",
						"Message":"Password reset complete..."
					}
				);
			}else {
				res.status(406).send(
					{
						"Status":"Failed",
						"Message":"Password and Confirm Password fields don't match..."
					}
				);
			}
		}else {
			res.status(406).send(
				{
					"Status":"Failed",
					"Message":"All Fields are required..."
				}
			);
		}
	} catch (e){
		console.log(e);
	}
}

// Default export (you can have one default export per module)
const defaultExport = 'Default export value';
export default defaultExport;