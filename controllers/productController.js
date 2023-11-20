import productModel from "../models/Product.js";

export const fetchAllProducts = async(req,res) => {
	try {
    const products = await productModel.find({});
    res.status(200).send({
			"status":"success",
			"message":"all products are fetched successfully...",
			"products": products
		});
  } catch (e) {
    res.status(500).send({
			"status":"failed",
			"message":e.message
		});
  }
}

export const uploadProduct = async(req,res) => {
    const userRole = req.user.userRole;
    if (userRole === 'seller' || userRole === 'admin') {
			const {name, price,category,sku} = req.body;
			if (name && price && category && sku) {
				const product = await productModel.findOne({sku:sku});
				if(product) {
					res.status(409).send({
						"status":"failed",
						"message":"sku already exists..."
					});
				} else {
					try{
						const newProduct = new productModel(req.body);
						await newProduct.save();
						res.status(201).send({
							"status":"success",
							"message":"product has been uploaded successfully...",
							"Product": newProduct
						});
					} catch(e) {
						res.status(500).send(
							{
								"status":"failed",
								"message":e.message
							}
						);
					}
				}
				
			} else {
				res.status(406).send({
					"status":"failed",
					"message":"fields name,price,category,sku are required..."
				});
			}
    } else {
        res.status(401).send({
          "status":"failed",
          "message":"unauthorized user..."
        });
    }
}

// Default export (you can have one default export per module)
const defaultExport = 'Default export value';
export default defaultExport;