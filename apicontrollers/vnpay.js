const moment = require('moment');
const querystring = require('qs');
const crypto = require('crypto');
const config = require('../config/vnpay');
const OrderModel = require('../models/order');

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj){
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

module.exports = {
    createPayment: async function(req, res) {
        try {
            const orderIdFromClient = req.body.orderId;
            const order = await OrderModel.findById(orderIdFromClient);
            
            if (!order) {
                return res.status(404).json({error: 'Không tìm thấy đơn hàng'});
            }

            let date = new Date();
            let createDate = moment(date).format('YYYYMMDDHHmmss');
            let ipAddr = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;

            let tmnCode = config.vnp_TmnCode;
            let secretKey = config.vnp_HashSecret;
            let vnpUrl = config.vnp_Url;
            let returnUrl = config.vnp_ReturnUrl;
            let vnpTxnRef = moment(date).format('DDHHmmss');
            let amount = order.totalAmount;
            let bankCode = req.body.bankCode || '';
            let locale = req.body.language || 'vn';
            let currCode = 'VND';
            let vnp_Params = {};
            
            vnp_Params['vnp_Version'] = '2.1.0';
            vnp_Params['vnp_Command'] = 'pay';
            vnp_Params['vnp_TmnCode'] = tmnCode;
            vnp_Params['vnp_Locale'] = locale;
            vnp_Params['vnp_CurrCode'] = currCode;
            vnp_Params['vnp_TxnRef'] = vnpTxnRef;
            vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderIdFromClient;
            vnp_Params['vnp_OrderType'] = 'other';
            vnp_Params['vnp_Amount'] = amount * 100;
            vnp_Params['vnp_ReturnUrl'] = returnUrl;
            vnp_Params['vnp_IpAddr'] = ipAddr;
            vnp_Params['vnp_CreateDate'] = createDate;
            
            if(bankCode !== null && bankCode !== ''){
                vnp_Params['vnp_BankCode'] = bankCode;
            }

            vnp_Params = sortObject(vnp_Params);

            let signData = querystring.stringify(vnp_Params, { encode: false });
            let hmac = crypto.createHmac("sha512", secretKey);
            let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex"); 
            vnp_Params['vnp_SecureHash'] = signed;
            vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

            // Cập nhật orderId trong database
            order.orderId = vnpTxnRef;
            order.paymentMethod = 'vnpay';
            await order.save();

            res.json({code: '00', data: vnpUrl})
        } catch (error) {
            console.error('VNPay payment error:', error);
            res.status(500).json({error: 'Có lỗi xảy ra khi tạo thanh toán'});
        }
    },

    vnpayReturn: async function(req, res) {
        try {
            let vnp_Params = req.query;
            let secureHash = vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHashType'];

            vnp_Params = sortObject(vnp_Params);
            let secretKey = config.vnp_HashSecret;
            let signData = querystring.stringify(vnp_Params, { encode: false });
            let hmac = crypto.createHmac("sha512", secretKey);
            let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");

            if(secureHash === signed){
                let vnpTxnRef = vnp_Params['vnp_TxnRef'];
                let rspCode = vnp_Params['vnp_ResponseCode'];
                
                // Cập nhật trạng thái đơn hàng
                if(rspCode === '00') {
                    // Thanh toán thành công
                    const order = await OrderModel.findOne({
                        orderId: vnpTxnRef
                    });
                    if(order) {
                        order.paymentStatus = 'paid';
                        await order.save();
                    }
                    
                    req.flash('errorMessage', 'Thanh toán thành công!');
                    req.flash('error', 'false');
                } else {
                    // Thanh toán thất bại
                    req.flash('errorMessage', 'Thanh toán thất bại!');
                    req.flash('error', 'true');
                }
            } else {
                req.flash('errorMessage', 'Chữ ký không hợp lệ!');
                req.flash('error', 'true');
            }

            res.redirect('/cart');
        } catch (error) {
            console.error('VNPay return error:', error);
            req.flash('errorMessage', 'Có lỗi xảy ra khi xử lý kết quả thanh toán');
            req.flash('error', 'true');
            res.redirect('/cart');
        }
    }
};
