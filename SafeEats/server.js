const express = require('express');
const app = express();
const { pool } = require("./dbConfig");
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
const passport = require("passport");

const initializePassport = require("./passportConfig");

initializePassport(passport);

const PORT = process.env.PORT || 4000;

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: false}));
app.use('/public', express.static('public'))
app.use(session({
    secret: 'secret',

    resave: false,

    saveUninitialized: false
})
);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());



app.get('/', (req,res)=> {
    res.render('index');
});

app.get('/users/register',checkAuthenticated, (req,res)=>{
    res.render("register");
});

app.get("/users/login", checkAuthenticated, (req, res) => {
  
    res.render("login.ejs");
  });

app.get("/users/search", (req,res)=>{
    res.render("search");
})

app.get("/users/results", (req,res)=>{
    res.render("results");
})

app.get("/users/about", (req,res)=>{
    res.render("about")
})
  app.get("/users/dashboard", checkNotAuthenticated, (req, res) => {
    console.log(req.isAuthenticated());
    res.render("dashboard", { user: req.user.firstname });
  });
  

app.get("/users/logout", (req, res) => {
    req.logout();
    res.render("index", { message: "You have logged out successfully" });
  });


app.post("/users/about", async(req,res)=>{
    let {firstname, lastname, emailaddress, comment} =req.body;
    console.log({
        firstname,
        lastname,
        emailaddress,
        comment
    });
    let errors = [];

    if (!firstname || !lastname || !emailaddress || !comment) {
        errors.push({message: "Please enter all fields"});
    }
    if(errors.length >0){
        res.render("about", {errors, firstname, lastname, emailaddress, comment});
    }else{
        pool.query(
            `INSERT INTO public.comments (firstname, lastname, emailaddress, comment)
            VALUES($1, $2, $3, $4)
            RETURNING commentid, comment`, [firstname, lastname, emailaddress, comment],
            (err, results) => {
                if (err){
                    throw err;
                }
                console.log(results.rows);
                req.flash('success_msg', "Your comment was successfully submitted. Thank you for your feedback.");
                res.redirect("/users/about");
            }
        )
    }
})




app.post("/users/register", async (req,res)=>{
    let { firstname, lastname, emailaddress, password, password2 } = req.body;
  console.log({
      firstname,
      lastname,
      emailaddress,
      password,
      password2
  });
let errors = [];

if (!firstname || !lastname || !emailaddress || !password ||!password2) {
    errors.push({ message: "Please enter all fields"});
}

if(password.length <6) {
    errors.push({message: "Password should be at least 6 characters long"});
}

if(password != password2){
    errors.push({message: "Passwords do not match."});
}

if(errors.length > 0){
    res.render("register", { errors, firstname, lastname, emailaddress, password, password2});
}else{
    //Form was filled in correctly
   //Will have password hashed 10 rounds to ensure security
    let hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);

    pool.query(
        `Select * FROM public.users
        WHERE emailaddress = $1`, [emailaddress], (err, results)=>{
        if (err){
            throw err;
        }
        console.log(results.rows);
//if email check returns email already in database, error message pushed
        if(results.rows.length >0){
            errors.push({message: "Email already registered"});
            res.render('register', {errors});
        }else{
            //insert user into the database
            pool.query(
                `INSERT INTO public.users (firstname, lastname, emailaddress, password)
                VALUES($1, $2, $3, $4)
                RETURNING userid, password`, [firstname, lastname, emailaddress, hashedPassword],
                (err, results) => {
                    if (err){
                        throw err;
                    }
                    console.log(results.rows);
                    req.flash('success_msg', "You are now registered. You may log in now.");
                    res.redirect("/users/login");
                }
            )
        }
}
        )
}


});

app.post('/users/login', passport.authenticate('local', {
        successRedirect:"/users/dashboard",
        failureRedirect: "/users/login",
        failureFlash: true
    })
);


function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/users/dashboard");
    }
    next();
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/users/login");
  }


app.listen(PORT, ()=>{
    console.log('Server running on port ${PORT}');
});