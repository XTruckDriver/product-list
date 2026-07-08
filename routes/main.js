const router = require("express").Router();
const mongoose = require("mongoose");
const faker = require("faker");
const Product = require("../models/product");
const Review = require("../models/review");


router.get("/generate-fake-data", async (req, res, next) => {
  for (let i = 0; i < 90; i++) {
    const product = new Product();

    product.category = faker.commerce.department();
    product.name = faker.commerce.productName();
    product.price = faker.commerce.price();
    product.image = "https://via.placeholder.com/250?text=Product+Image";

    for (let j = 0; j < 3; j++) {
      const userName = faker.internet.userName();
      const text = faker.lorem.paragraphs(1);
  
      const review = await Review.create({
        userName, 
        text, 
        product: product._id, 
      });
      

      product.reviews.push(review._id);
    };

    await product.save();
  }

  res.end();
}); 



router.get("/products", async (req, res, next) => {
  try {
    const perPage = 9;
    const page = parseInt(req.query.page, 10) || 1;
    const category = req.query.category;

    let queryOptions = {};
    let sortOrder = null;

    if (category) { queryOptions.category = category };
    
    const products = await Product.find(queryOptions)
      .sort(sortOrder)
      .skip(perPage * (page - 1))
      .limit(perPage)
      .populate("reviews");
  
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



router.get("/products/:product", async (req, res, next) => {
try {
  const productId = req.params.product;

  const product = await Product.findById(productId).populate("reviews");

  res.status(200).json({
    message: "product retrieved",
    product: product,
  });


} catch (err) {
  res.status(400).json({
    message: "Failed to retrieve product",
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
      deletedProduct: deletedProduct,
    });

  } catch (err) {
    res.status(400).json({
      message: "Failed to delete product",
      error: err.message,
    }); 
  }
});



router.get("/products/:product/reviews", async (req, res, next) => {
  try {
    const productId = req.params.product;
    const perPage = 4;
    const page = parseInt(req.query.page, 10) || 1;

    const reviews = await Review.find({ product: productId })
      .skip(perPage * (page - 1))
      .limit(perPage);

    res.status(200).json({
      message: "Reviews retrieved",
      reviews,
    });


  } catch (err) {
    res.status(400).json({
      message: "Failed to retrieve reviews",
      error: err.message,
    });
  }
});



router.post("/products/:product/reviews", async (req, res, next) => {
  try {
    const { text, userName } = req.body;
    const productId = req.params.product;

    const newReview = await Review.create({
      userName: userName, 
      text: text, 
      product: productId, 
    });

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    product.reviews.push(newReview._id);
    await product.save();

    res.status(201).json({
      message: "Review created",
      review: newReview,
    });


  } catch (err) {
    res.status(400).json({
      message: "Failed to create review",
      error: err.message,
    });
  }
});



router.delete("/reviews/:review", async (req, res, next) => {
  try {
    const reviewId = req.params.review;

    const deletedReview = await Review.findByIdAndDelete(reviewId);
    
    if (!deletedReview) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    await Product.findByIdAndUpdate(
      deletedReview.product,
      { $pull: { reviews: reviewId } }
    );

    return res.status(200).json({
      message: "Review deleted",
      deletedReview: deletedReview,
    });

  } catch (err) {
    res.status(400).json({
      message: "Failed to delete review",
      error: err.message,
    });
  }
});



module.exports = router;

