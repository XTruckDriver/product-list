const router = require("express").Router();
const faker = require("faker");
const Product = require("../models/product");

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
  const perPage = 9;
  const page = req.query.page || 1;

  try {
    const products = await Product.find({})
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const count = await Product.countDocuments().exec();

    // only sending products now, but count is available
    res.send(products);
  } catch (err) {
    next(err);
  }
});

module.exports = router;