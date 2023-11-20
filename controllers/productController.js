import productModel from "../models/Product.js";

export const fetchAllProducts = async(req,res) => {
	try {
    const products = await productModel.find({});
    res.status(200).send({
			"success":"true",
			"message":"all products are fetched successfully...",
			"products": products
		});
  } catch (e) {
    res.status(500).send({
			"success":"false",
			"message":e.message
		});
  }
}

export const uploadProduct = async(req,res) => {
    const userRole = req.user.userRole;
    if (userRole === 'seller' || userRole === 'admin') {
			const {name, price,category,sku} = req.body;
			if (name && price && category && sku && quantity && description && images) {
				const product = await productModel.findOne({sku:sku});
				if(product) {
					res.status(409).send({
						"success":"false",
						"message":"sku already exists..."
					});
				} else {
					try{
						const newProduct = new productModel(req.body);
						await newProduct.save();
						res.status(201).send({
							"success":"true",
							"message":"product has been uploaded successfully...",
							"Product": newProduct
						});
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
				res.status(406).send({
					"success":"false",
					"message":"name,price,category,sku, quantity,description and images these fields are required..."
				});
			}
    } else {
        res.status(401).send({
          "success":"false",
          "message":"unauthorized user..."
        });
    }
}

// Default export (you can have one default export per module)
const defaultExport = 'Default export value';
export default defaultExport;