require('dotenv').config();

const express = require("express");
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const connectDB = require('./server/config/db');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const {isActiveRoute} = require('./server/helpers/routerHelpers');
const app = express();
const PORT = 5000 || process.env.PORT;

connectDB();

app.use(express.urlencoded( { extended : true}));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI
    }),
    //cookie: { maxAge: new Date ( Date.now() + (3600000) ) } 
  }));
  
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));


app.locals.isActiveRoute = isActiveRoute;
//Template Engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');



// Define your data
const blogData = {
    blogName: 'My Blog',
    blogFocus: 'fashion, technology, travel, cooking',
    mission: 'inspire, educate, entertain',
    // story: 'Here is the story of how and why we started the blog...',
    contentTypes: [
        { type: 'In-depth articles', description: 'Detailed articles on various topics.' },
        { type: 'Tutorials', description: 'Step-by-step guides and how-tos.' },
        { type: 'Reviews', description: 'Honest reviews of products and services.' }
    ],
    // teamMembers: [
    //     { name: 'John Doe', bio: 'Founder and main writer.' },
    //     { name: 'Jane Smith', bio: 'Editor and content strategist.' }
    // ],
    socialMedia: [
        { name: 'Facebook', link: 'https://facebook.com/yourblog' },
        { name: 'Twitter', link: 'https://twitter.com/yourblog' },
        { name: 'Instagram', link: 'https://instagram.com/yourblog' }
    ],
    contactEmail: 'adya@myblog.com',
    yourName: 'Adya Srivastava'
};


app.post('/send-email', (req, res) => {
  // Retrieve form data from request body
  const { name, email, subject, message } = req.body;

  // Nodemailer configuration (replace with your SMTP details)
  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: 'adyasrivastava9088@gmail.com', // your email
          pass: 'adya@2004' // your password
      }
  });

  // Email message options
  const mailOptions = {
      from: email,
      to: 'kksrivastava1234@gmail.com', // recipient's email
      subject: subject,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
   
      res.send('Thank you for your message. We will get back to you soon!');
  });
});

// Middleware to set the currentRoute
app.use((req, res, next) => {
    res.locals.currentRoute = req.path;
    next();
});

// Define a route to render the "About" page
app.get('/about', (req, res) => {
    res.render('about', blogData);
});

app.get('/contact', (req, res) => {
  res.render('contact', blogData);
});




app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));

app.listen(PORT, ()=> {
    console.log(`App listening on port ${PORT}`);
});