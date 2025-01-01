const express = require("express");
const router = express.Router();

const cors = require("cors");
const isAuth = require("../middleware/is-auth");
const UserController = require("../apicontrollers/user");
const VNPayController = require("../apicontrollers/vnpay");

router.use(cors());

// VNPay Routes
router.post("/create_payment_url", isAuth, VNPayController.createPayment);
router.get("/vnpay_return", VNPayController.vnpayReturn);

//Sign Up
router.get("/signup", UserController.getSignUp);
router.post("/signup", UserController.postSignUp);

//Login
router.get("/login", UserController.getLogin);
router.post("/login", UserController.postLogin);

//Logout
router.post("/logout", UserController.postLogout);

//Account
router.get("/account/:_id", isAuth, UserController.getAccount);
router.post("/account", isAuth, UserController.postEditUser);
//router.get('/account/:_id',UserController.getEditUser)

//Cart
router.get("/cart", isAuth, UserController.getCartPage);

//-Cart__GetCart
router.get("/api/cart", isAuth, UserController.getCart);
//-Cart__AddToCart
router.post("/cart", isAuth, UserController.postCart);
//-Cart__RemoveProduct
router.post("/remove-cart", isAuth, UserController.postRemoveProductCart);
//-Cart__UpdateCart
router.post("/update-cart", isAuth, UserController.postUpdateCart);
//-Cart__Checkout
router.post("/cart/checkout", isAuth, UserController.postCheckout);

// Orders
router.get("/orders", isAuth, UserController.getOrders);
router.get("/order/:orderId", isAuth, UserController.getOrderDetails);

module.exports = router;
