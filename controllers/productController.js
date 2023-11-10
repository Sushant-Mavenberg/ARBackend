import productModel from "../models/Product.js";

export const fetchAllProducts = async(req,res) => {
	try {
    const products = await productModel.find({});
    res.status(200).send({
			"Status":"Success",
			"Message":"All products are fetched successfully...",
			"Products": products
		});
  } catch (e) {
    res.status(500).send({
			"Status":"Failed",
			"Message":e.message
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
						"Status":"Failed",
						"Message":"SKU already exists..."
					});
				} else {
					try{
						const newProduct = new productModel(req.body);
						await newProduct.save();
						res.status(201).send({
							"Status":"Success",
							"Message":"Product has been uploaded successfully...",
							"Product": newProduct
						});
					} catch(e) {
						res.status(500).send(
							{
								"Status":"Failed",
								"Message":e.message
							}
						);
					}
				}
				
			} else {
				res.status(406).send({
					"Status":"Failed",
					"Message":"Fields Name,Price,Category,SKU are required..."
				});
			}
    } else {
        res.status(401).send({
          "Status":"Failed",
          "Message":"Unauthorized User..."
        });
    }
}

// Default export (you can have one default export per module)
const defaultExport = 'Default export value';
export default defaultExport;