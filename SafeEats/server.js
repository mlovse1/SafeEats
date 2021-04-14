const express = require("express");
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const dotenv = require("dotenv").config();
const app = express();

const PORT = process.env.PORT || 4000;

const initializePassport = require("./passportConfig");

initializePassport(passport);

// Middleware

// Parses details from a form
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
//Work around code below not working
app.use(session({ resave: true ,secret: '123456' , saveUninitialized: true}));

// ****Isn't working...need to fix****
/*
app.use(
  session({
    // Key we want to keep secret which will encrypt all of our information
    secret:process.env.SESSIONSECRET,
    // Should we resave our session variables if nothing has changes which we dont
    resave: false,
    // Save empty value if there is no vaue which we do not want to do
    saveUninitialized: false,
  })
);
*/
app.use('/public', express.static('public'))

// Funtion inside passport which initializes passport
app.use(passport.initialize());
// Store our variables to be persisted across the whole session. Works with app.use(Session) above
app.use(passport.session());
app.use(flash());

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/user/register", checkAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.get("/user/login", checkAuthenticated, (req, res) => {
  // flash sets a messages variable. passport sets the error message
  console.log(req.session.flash.error);
  res.render("login.ejs");
});

app.get("/user/dashboard", checkNotAuthenticated, (req, res) => {
  console.log(req.isAuthenticated());
  res.render("dashboard", { user: req.user.name });
});

app.get("/user/logout", (req, res) => {
  req.logout();
  res.render("index.ejs", { message: "You have logged out successfully" });
});

app.get("/user/about", (req,res)=>{
  res.render("about.ejs");
});

app.get("/user/search", (req, res)=> {
  res.render("search.ejs");
});

app.post("/user/register", async (req, res) => {
  let { name, email, password, password2 } = req.body;

  let errors = [];

  console.log({
    name,
    email,
    password,
    password2,
  });

  if (!firstName || !lastName || !email || !password || !password2) {
    errors.push({ message: "Please enter all fields" });
  }

  if (password.length < 6) {
    errors.push({ message: "Password must be a least 6 characters long" });
  }

  if (password !== password2) {
    errors.push({ message: "Passwords do not match" });
  }

  if (errors.length > 0) {
    res.render("register", { errors, firstName, lastName, email, password, password2 });
  } else {
    hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    // Validation passed
    pool.query(
      `SELECT * FROM user
        WHERE email = $1`,
      [email],
      (err, results) => {
        if (err) {
          console.log(err);
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          return res.render("register", {
            message: "Email already registered",
          });
        } else {
          pool.query(
            `INSERT INTO user (firstName, lastName, email, password)
                VALUES ($1, $2, $3, $4)
                RETURNING id, password`,
            [firstName, lastName, email, hashedPassword],
            (err, results) => {
              if (err) {
                throw err;
              }
              console.log(results.rows);
              req.flash("success_msg", "You are now registered. Please log in");
              res.redirect("/user/login");
            }
          );
        }
      }
    );
  }
});

app.post(
  "/user/login",
  passport.authenticate("local", {
    successRedirect: "/user/dashboard",
    failureRedirect: "/user/login",
    failureFlash: true,
  })
);

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/user/dashboard");
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/user/login");
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
