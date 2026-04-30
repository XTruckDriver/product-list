const router = require("express").Router();
const faker = require("faker");
const Product = require("../models/product");
const Review = require("../models/review");


router.get("/generate-fake-data", (req, res, next) => {
  for (let i = 0; i < 90; i++) {
    let product = new Product();

    product.category = faker.commerce.department();
    product.name = faker.commerce.productName();
    product.price = faker.commerce.price();
    product.image = "https://via.placeholder.com/250?text=Product+Image";

    product.save()
        .catch(err => {
            console.error(err);
        });
  }
  res.end();
}); 


router.get("/products", async (req, res, next) => {
  try {
    const perPage = 9;
    const page = parseInt(req.query.page, 10) || 1;

    const products = await Product.find({ })
      .skip(perPage * page - perPage)
      .limit(perPage);

    res.status(200).json({
      message: "Products retrieved",
      products,
    });

  } catch (err) {
    res.status(400).json({
      message: "Failed to retrieve products",
      error: err.message,
    });
  }
});


router.get("/products/:product", async (req, res, next) => {
  try {
    const id = req.params.product
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      }); 
    }

    res.status(200).json({
      message: "Product retrieved",
      product,
     });
  } catch (err) {
    res.status(400).json({
      message: "Failed to retrieve product",
      error: err.message,
    });
  }
});


router.post("/products", async (req, res, next) => {
  try {
    const { name, price } = req.body;
    const newProduct = await Product.create({ name, price });

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (err) {
    res.status(400).json({
      message: "Failed to create product",
      error: err.message,
    });
  }
  
});


module.exports = router;