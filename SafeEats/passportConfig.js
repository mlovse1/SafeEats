const LocalStrategy = require("passport-local").Strategy;
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");


function initialize(passport) {
  console.log("Initialized");

  const authenticateUser = (emailaddress, password, done) => {
    console.log(emailaddress, password);
    pool.query(
      `SELECT * FROM public.users WHERE emailaddress = $1`,
      [emailaddress],
      (err, results) => {
        if (err) {
          throw err;
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          const user = results.rows[0];

          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
              console.log(err);
            }
            if (isMatch) {
              return done(null, user);
            } else {
              //password is incorrect
              return done(null, false, { message: "Password is incorrect" });
            }
          });
        } else {
          // No user
          return done(null, false, {
            message: "No user with that email address"
          });
        }
      }
    );
  };

  passport.use(
    new LocalStrategy(
      { usernameField: "emailaddress", passwordField: "password" },
      authenticateUser
    )
  );
  // Storing the user details inside the session. This determines what data from the  user
  // object should be stored in the session. The results are attached
  // to the session as req.session.passport.user = {}. 
  passport.serializeUser((user, done) => done(null, user.userid));

  // In deserializeUser that key we are using is matched with the what is found in the database.
  // The retrieved object is attached to the request object as req.user

  passport.deserializeUser((id, done) => {
    pool.query(`SELECT * FROM public.users WHERE userid = $1`, [id], (err, results) => {
      if (err) {
        return done(err);
      }
      console.log(`ID is ${results.rows[0].userid}`);
      return done(null, results.rows[0]);
    });
  });
}

module.exports = initialize;