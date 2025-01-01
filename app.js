var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose')
const flash = require('connect-flash')
const multer = require('multer');
const bodyParser = require("body-parser");
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);
const passport = require('passport')


const htmlcontroller = require('./apicontrollers/htmlcontroller')

require('dotenv').config()

//Router
const routesUser = require('./routes/users')
const routesAdmin = require('./routes/admin')
const routesProduct = require('./routes/product')
const UserModel = require('./models/user')


var app = express()
var port = process.env.port ||3000

//Connect DB 
  //Update ez
  
mongoose.connect(
  'mongodb+srv://baocaothuctap:1901@cluster0.6jmie.mongodb.net/web?retryWrites=true&w=majority&appName=Cluster0',
  {
    useNewUrlParser: true,
  }
)
const MONGODB_URI =
'mongodb+srv://baocaothuctap:1901@cluster0.6jmie.mongodb.net/web?retryWrites=true&w=majority&appName=Cluster0';

const store = new MongoDBStore({
  uri: MONGODB_URI,
  //collection: 'sessions'
});

mongoose.connect(
  MONGODB_URI,
  { useNewUrlParser: true}
)
// Middleware kiểm tra user session
app.use((req, res, next) => {
  if (!req.session) {
    return next();
  }

  if (req.session.user) {
    UserModel.findById(req.session.user._id)
      .then(user => {
        if (!user) {
          return next();
        }
        req.user = user;
        next();
      })
      .catch(err => {
        console.log(err);
        next();
      });
  } else {
    next();
  }
});
//App use
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/images", express.static(path.join(__dirname, "./public/images/product")));
app.use(bodyParser.urlencoded({ extended: false }));

//- Dùng session để duy trì đăng nhập và để sử dụng flash
app.use(
  session({
  secret: 'tingodlike',
  resave: false, // session sẽ ko lưu với mỗi lệnh request => tốc đô
  saveUninitialized: false, // chắn chăn ko có session đc save mỗi request
  store: store
  }))
  
app.use('/images', express.static(path.join(__dirname, 'images')));

//- Dùng để đưa thông tin message 
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {  
  // gui ve 1 bien trong moi 1 route
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.Manager = req.session.isManager;
  res.locals.currentUser = req.session.user;
  res.locals.session = req.session;
  next();
});


//Routes
htmlcontroller(app);
app.use(routesUser);
app.use(routesAdmin);
app.use(routesProduct);

// view engine setup
app.set('view engine', 'ejs');
app.set('views','views');

//-404 Error
app.use(function(req, res, next) {
  res.status(404).render('404', {
    pageTitle: 'Page Not Found',
    path: '/404',
    isAuthenticated: req.session.isLoggedIn
  });
});

// Error handler
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500).render('404', {
    pageTitle: err.message || 'Something went wrong!',
    path: '/404',
    isAuthenticated: req.session.isLoggedIn
  });
});

app.listen(port,function(){
  console.log('Server already')
})
module.exports = app;
