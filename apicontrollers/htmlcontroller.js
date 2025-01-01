const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const mongoClient = require("mongodb").MongoClient;
const UserModel = require("../models/user");
const ProductModel = require("../models/newproduct");

const urlencodedParser = bodyParser.urlencoded({ extended: false });

module.exports = function(app) {
 
  app.get("/", function(req, res, next) {
    req.session.isManager = false;

    ProductModel.find()
      .then(products => {
        console.log("Tất cả sản phẩm:", products.map(p => ({name: p.productname, category: p.category})));
        var dataiPhone = products.filter(i => i.category == "iPhone");
        var dataMacbook = products.filter(i => i.category.toLowerCase().replace(/\s/g, '') == "macbook");
        var dataAppleWatch = products.filter(i => i.category.toLowerCase().replace(/\s/g, '') == "applewatch");
        var dataAirpods = products.filter(i => i.category == "airpods");
        console.log("iPhone:", dataiPhone.length);
        console.log("Macbook:", dataMacbook.length);
        console.log("Apple Watch:", dataAppleWatch.length);
        console.log("Airpods:", dataAirpods.length);
        res.render("homepage", {
          listproducts: dataiPhone,
          listmacbooks: dataMacbook,
          listapplewatch: dataAppleWatch,
          listairpod: dataAirpods
        });
      })
      .catch(err => {
        console.log(err);
      });
  });

  app.get("/contact", function(req, res, next) {
    res.render("general/contact", {
    });
  }),
    app.get("/about", function(req, res, next) {
      res.render("about", {
      });
    });

  app.get("/blog", function(req, res, next) {
    res.render("blog", {
    });
  });

  //iPhone
  app.get("/iPhone", function(req, res, next) {
      req.session.isManager = false;
      ProductModel.find()
        .then(products => {
          var data = products.filter(i => i.category == "iPhone");
          res.render("product/page-product", {
              kind: 'iphone',
              listproducts: data
            });
        })
        .catch(err => {
          console.log(err);
        });
  });

  //Macbook
  app.get("/macbook", function(req, res, next) {
    req.session.isManager = false;
    ProductModel.find()
      .then(products => {
        var data = products.filter(i => i.category.toLowerCase() == "macbook");
        res.render("product/page-product", {
          kind: 'macbook',
          listproducts: data
        });
      })
      .catch(err => {
        console.log(err);
      });
  });

  //Apple Watch
  app.get("/applewatch", function(req, res, next) {
    req.session.isManager = false;
    ProductModel.find()
      .then(products => {
        var data = products.filter(i => i.category.toLowerCase().replace(/\s/g, '') == "applewatch");
        res.render("product/page-product", {
          kind: 'applewatch',
          listproducts: data
        });
      })
      .catch(err => {
        console.log(err);
      });
  });

  //airpods
  app.get("/airpod", function(req, res, next) {
    req.session.isManager = false;
    ProductModel.find()
      .then(products => {
        var data = products.filter(i => i.category.toLowerCase().replace(/\s/g, '') == "airpods");
        res.render("product/page-product", {
          kind: 'airpods',
          listproducts: data
        });
      })
      .catch(err => {
        console.log(err);
      });
  });

   //airpods
   app.get("/airpod", function(req, res, next) {
    req.session.isManager = false;
    ProductModel.find()
      .then(products => {
        var data = products.filter(i => i.category.toLowerCase().replace(/\s/g, '') == "airpods");
        res.render("product/page-product", {
          kind: 'airpods',
          listproducts: data
        });
      })
      .catch(err => {
        console.log(err);
      });
  });


  //allproduct
  app.get("/allproducts", async function(req, res, next) {
    try {
      req.session.isManager = false;
      
      // Lấy tất cả sản phẩm
      const products = await ProductModel.find();
      
      // Chuẩn hóa category trước khi lấy unique
      const normalizedProducts = products.map(product => ({
        ...product._doc,
        category: product.category.trim().toLowerCase()
      }));
      
      // Lấy danh sách categories duy nhất từ sản phẩm đã chuẩn hóa
      const categories = [...new Set(normalizedProducts.map(product => product.category))];
      
      // Log để kiểm tra
      console.log('Categories:', categories);
      console.log('Products by category:');
      categories.forEach(category => {
        const productsInCategory = normalizedProducts.filter(p => p.category === category);
        console.log(`${category}:`, productsInCategory.map(p => p.productname));
      });
      
      res.render("product/page-product", {
        kind: 'allproducts',
        listproducts: normalizedProducts,
        categories: categories
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  });
};
