import jwt from "jsonwebtoken";
import userModel from "../models/User.js";

export const checkUserAuth = async(req,res,next) => {
    let token;

		// Getting token from header
    const {authorization} = req.headers;
		console.log(typeof authorization)
    if (authorization && authorization.startsWith("Bearer")){
			try{
				token = authorization.split(" ")[1];

				// Verify token
				const {userID} = jwt.verify(token,process.env.JWT_SECRET_KEY);

				// Get user from token
				req.user = await userModel.findOne({_id:userID}).select("-password");
				next();
			}catch (e){
				console.log(e);
				res.status(401).send(
					{
						"Status":"Failed",
						"Message":"Unauthorized User..."
					}
				);
			}
    }else{
			res.status(401).send(
				{
					"Status":"Failed",
					"Message":"Unauthorized user, No token..."
				}
			);
    }
}

// Default export (you can have one default export per module)
const defaultExport = 'Default export value';
export default defaultExport;	