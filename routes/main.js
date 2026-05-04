const router = require("express").Router();
const mongoose = require("mongoose");
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


router.get("/products/:product/reviews", async (req, res, next) => {
  try {
    const productId = req.params.product;
    const perPage = 4;
    const page = parseInt(req.query.page, 10) || 1;

    const productReviews = await Review.find({product: productId})
      .skip(perPage * page - perPage)
      .limit(perPage);
    
    if (!productReviews) {
      return res.status(404).json({
        message: "Product reviews not found",
      });
    };


    res.status(200).json({
       message: "Reviews retrieved",
       productReviews,
    });

  } catch (err) {
    res.status(400).json({
      message: "Failed to retrieve reviews",
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


router.post("/products/:product/reviews", async (req, res, next) => {
  try {
    const { text } = req.body;
    const { userName } = req.body || "anonymous";
    const productId = req.params.product;

    const product = await Product.findOne({ _id: productId });

    const review = new Review({
      _id: new mongoose.Types.ObjectId(), 
      userName: userName, 
      text: text, 
      product: product._id 
    });
    await review.save();
    await product.reviews.push(review);
    await product.save();


    res.status(201).json({
      message: "Review created",
      review: review,
    });

  } catch (err) {
    res.status(400).json({
      message: "Failed to create review",
      error: err.message,
    });
  }
});

router.delete("/products/:product", async (req, res, next) => {
  try {
    const productId = req.params.product;
    
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Do I want to delete the product's reviews? Currently, does not remove them. Not sure if needed in future?
    

    return res.status(200).json({
      message: "Product deleted",
      deletedProduct: deletedProduct.name,
    });

  } catch (err) {
    res.status(400).json({
      message: "Failed to delete product",
      error: err.message,
    }); 
  }
});



module.exports = router;