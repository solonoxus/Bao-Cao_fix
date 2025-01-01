const bodyParser = require("body-parser");
//Model

const ProductModel = require("../models/newproduct");
const UserModel = require("../models/user");
const urlencodedParser = bodyParser.urlencoded({ extended: false });

module.exports = {
  /* NEW DB*/
  getAddProduct: function(req, res, next) {
    let message = req.flash("error");
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    req.session.isManager = false;
    res.render("product/addproduct", {
      errorMessageProduct: message,
      successMessageProduct: null
    });
  },

//   postAddProduct: function(req, res, next) {
//     const {
//         productname,
//         price,
//         imagePath,
//         description,
//         quantity,
//         category
//     } = req.body;
//     const today = new Date();
//     var date_format = new Date(today).toDateString("yyyy-MM-dd");
//     const created = date_format;

//     ProductModel.findOne({ imagePath: imagePath })
//         .then(function(product) {
//             if (product) {
//                 return res.render("product/addproduct", {
//                     errorMessageProduct: "Product is Exists",
//                     productt: null
//                 });
//             }
//             if (
//                 productname == "" ||
//                 price == "" ||
//                 imagePath == "" ||
//                 description == ""
//             ) {
//                 return res.render("product/addproduct", {
//                     errorMessageProduct: "Product name or Price or Imagepath or Description is Empty",
//                     productt: null
//                 });
//             } else {
//                 const newproductData = new ProductModel({
//                     productname: productname,
//                     imagePath: imagePath,
//                     price: price,
//                     description: description,
//                     quantity: quantity,
//                     category: category,
//                     created: created
//                 });
//                 return newproductData.save().then(function(product) {
//                     console.log(product);
//                     res.render("product/addproduct", {
//                         successMessageProduct: "Product added successfully!",
//                         productt: null // Làm trống form
//                     });
//                 });
//             }
//         })
//         .catch(function(err) {
//             console.log(err);
//             res.render("product/addproduct", {
//                 errorMessageProduct: "An error occurred while adding the product.",
//                 productt: null
//             });
//         });
// },
postAddProduct: function(req, res, next) {
  const {
      productname,
      price,
      imagePath,
      description,
      quantity,
      category
  } = req.body;
  const today = new Date();
  var date_format = new Date(today).toDateString("yyyy-MM-dd");
  const created = date_format;

  // Kiểm tra các trường bắt buộc
  if (productname == "" || price == "" || imagePath == "" || description == "") {
      return res.render("product/addproduct", {
          errorMessageProduct: "Vui lòng điền đầy đủ thông tin sản phẩm",
          productt: null
      });
  }

  // Tự động xác định category dựa trên tên sản phẩm
  let detectedCategory = category;
  if (!detectedCategory) {
      const productNameLower = productname.toLowerCase();
      if (productNameLower.includes('iphone')) {
          detectedCategory = 'iphone';
      } else if (productNameLower.includes('Macbook')) {
          detectedCategory = 'macbook';
      } else if (productNameLower.includes('watch') || productNameLower.includes('apple watch')) {
          detectedCategory = 'applewatch';
      } else if (productNameLower.includes('airpod')) {
          detectedCategory = 'airpods';
      } else {
          detectedCategory = 'other';
      }
  }

  // Tạo sản phẩm mới
  const newproductData = new ProductModel({
      productname: productname,
      imagePath: imagePath,
      price: price,
      description: description,
      quantity: quantity || 0, // Mặc định là 0 nếu không có số lượng
      category: detectedCategory,
      created: created
  });

  newproductData.save()
      .then(function(product) {
          console.log("Sản phẩm đã được thêm:", product);
          res.render("product/addproduct", {
            errorMessageProduct: null,
              successMessageProduct: "Thêm sản phẩm thành công!",
              productt: null
          });
      })
      .catch(function(err) {
          console.log(err);
          res.render("product/addproduct", {
              errorMessageProduct: "Có lỗi xảy ra khi thêm sản phẩm.",
              productt: null
          });
      });
},

  getProductDetail: async function(req, res, next) {
    try {
      const productId = req.params._id;
      const product = await ProductModel.findById(productId);
      
      if (!product) {
        return res.status(404).render('404', {
          pageTitle: 'Product Not Found',
          path: '/404',
          isAuthenticated: req.session.isLoggedIn
        });
      }

      res.render("product/product-detail", {
        product: product,
        pageTitle: product.productname,
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  // Thêm route xử lý cập nhật giỏ hàng
  updateCart: async function(req, res) {
    try {
        const { productId, productQuantity } = req.body;
        const userId = req.session.user._id;

        // Kiểm tra sản phẩm tồn tại và số lượng tồn kho
        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.json({ 
                success: false, 
                message: 'Sản phẩm không tồn tại' 
            });
        }

        if (productQuantity > product.stockQuantity) {
            return res.json({ 
                success: false, 
                message: `Số lượng vượt quá tồn kho! Tối đa: ${product.stockQuantity}` 
            });
        }

        // Cập nhật số lượng trong giỏ hàng
        const user = await UserModel.findById(userId);
        const cartItemIndex = user.cart.findIndex(
            item => item.productId.toString() === productId
        );

        if (cartItemIndex > -1) {
            user.cart[cartItemIndex].quantity = productQuantity;
            await user.save();
            
            return res.json({ 
                success: true,
                message: 'Cập nhật giỏ hàng thành công'
            });
        } else {
            return res.json({ 
                success: false, 
                message: 'Sản phẩm không có trong giỏ hàng' 
            });
        }
    } catch (error) {
        console.error('Error updating cart:', error);
        return res.json({ 
            success: false, 
            message: 'Có lỗi xảy ra khi cập nhật giỏ hàng' 
        });
    }
  },

  // Thêm route xóa sản phẩm khỏi giỏ hàng
  removeCartProduct: async function(req, res) {
    try {
        const { productId } = req.body;
        const userId = req.session.user._id;

        const user = await UserModel.findById(userId);
        user.cart = user.cart.filter(
            item => item.productId.toString() !== productId
        );
        await user.save();

        return res.json({ 
            success: true,
            message: 'Đã xóa sản phẩm khỏi giỏ hàng'
        });
    } catch (error) {
        console.error('Error removing product from cart:', error);
        return res.json({ 
            success: false, 
            message: 'Có lỗi xảy ra khi xóa sản phẩm' 
        });
    }
  },
};
