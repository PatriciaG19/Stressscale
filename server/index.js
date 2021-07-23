const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

/* Creating a session to store the user information */
app.use(
  session({
    key: "user",
    secret: "stressScale",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24,
    },
  })
);

/* Creating Database connection */
const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "",
  database: "stressScale",
});

/* Handaling post requests on path '/login' */
app.post("/login", (req, res, next) => {
  const userId = req.body.userId;
  const userPassword = req.body.userPassword;

  /* Getting and storing current date and time */
  const date = new Date();
  const dateData =
    // '"' +
    date.getFullYear().toString() +
    "-" +
    (date.getMonth() + 1).toString() +
    "-" +
    date.getDate().toString() +
    " " +
    date.getHours().toString() +
    ":" +
    date.getMinutes().toString() +
    ":" +
    date.getSeconds().toString() +
    "";
  console.log("JS DATE: ", dateData);

  /*Selecting the users with ID, Password to see if that user is in database*/
  db.query(
    "SELECT * FROM users WHERE uid = ? AND password = ?",
    [userId, userPassword],
    (err, result) => {
      if (err) {
        res.send({
          message: err,
        });
      } else if (result.length > 0) {
        //Setting Session
        req.session.user = result;
        console.log(req.session.user);

        /* Checking date and time with last logged in date and time */
        let dbDate = result[0].lastLogin;
        if (dbDate === null) {
          dbDate = "0000-00-00 00:00:00";
        }
        console.log("dbDate: ", dbDate.toString());
        const dbDateYear = dbDate.split(" ")[0].split("-")[0];
        const dbDateMonth = dbDate.split(" ")[0].split("-")[1];
        const dbDateDate = dbDate.split(" ")[0].split("-")[2];
        const dbDateHour = dbDate.split(" ")[1].split(":")[0];
        const dbDateMinute = dbDate.split(" ")[1].split(":")[1];
        console.log(
          "DB DATE: ",
          dbDateYear,
          dbDateMonth,
          dbDateDate,
          dbDateHour,
          dbDateMinute
        );
        if (date.getFullYear().toString() - dbDateYear >= 0) {
          if ((date.getMonth() + 1).toString() - dbDateMonth >= 0) {
            if (date.getDate().toString() - dbDateDate > 0) {
              // if (date.getHours().toString() - dbDateHour > 0) {
              // if (date.getMinutes().toString() - dbDateMinute > 0) {
              console.log("Logged!");

              /* Updating date and time in database  and preventing user from logging in more than once a day */
              db.query(
                "UPDATE users SET lastLogin = ? WHERE uid = ?",
                [dateData, userId],
                (err1, result1) => {
                  if (err1) {
                    console.log(err1);
                  } else {
                    console.log(result1);
                    res.send({
                      message: result,
                    });
                  }
                }
              );
              // } else {
              //    console.log("You are allowed to login again next minute");
              //   res.send({ fail: "You are allowed to login again next minute" });
              // }
              // } else {
              //   console.log("You are allowed to login again next hour");
              //   res.send({ fail: "You are allowed to login again next hour" });
              // }
            } else {
              console.log("You are allowed to login again next day");
              res.send({ fail: "You are allowed to login again next day" });
            }
          } else {
            console.log("You are allowed to login again next month");
            res.send({ fail: "You are allowed to login again next month" });
          }
        } else {
          console.log("You are allowed to login again next year");
          res.send({ fail: "You are allowed to login again next year" });
        }
      } else {
        res.send({ message: "User Id and Password combination wrong!" });
      }
    }
  );
});

/* Handaling post requests on path '/register' */
app.post("/register", (req, res, next) => {
  const userId = req.body.userId;
  const userPassword = req.body.userPassword;

  /*Selecting the users with ID, Password to see if that user is already in database*/
  db.query("SELECT * FROM users WHERE uid = ?", [userId], (err, result) => {
    if (err) {
      res.send({
        message: err,
      });
    } else if (result.length > 0) {
      res.send({
        message: "User already exists, please choose a different User ID.",
      });
    } else {
      /* If user not in database, then create user with ID, Password, and put in database */
      db.query(
        "INSERT INTO users (uid, password) VALUES (?, ?)",
        [userId, userPassword],
        (err, result) => {
          if (err) {
            res.send({
              message: err,
            });
          } else if (result) {
            res.send({
              message:
                "User registered successfully. Please Login to continue!",
            });
          } else {
            res.send({ message: "Some unrecognizable error occured!" });
          }
        }
      );
    }
  });
});

/* Handaling get requests for path '/login' */
app.get("/login", (req, res, next) => {
  if (req.session.user) {
    /* Sending session information to the client */
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

/* Adding score to database for logged in user */
app.post("/addScore", (req, res, next) => {
  const userId = req.body.userId;
  const score = req.body.dailyScore;
  // let scoreMessage = "";
  console.log("User ID: " + userId);
  console.log("Today's Score: " + score);

  /* Selecting user from database with logged in ID */
  db.query("SELECT * FROM users WHERE uid = ?", [userId], (err, result) => {
    if (err) {
      res.send({
        message: err,
      });
    } else if (result || result.length > 0) {
      /* Saving user's everyday test details in variables for comparison */
      console.log(result[0].day1);
      const day1Score = result[0].day1;
      const day2Score = result[0].day2;
      const day3Score = result[0].day3;
      const day4Score = result[0].day4;
      const day5Score = result[0].day5;

      /* Checking if particular day's score is null and updating current score in that day's variable */
      if (day1Score === null) {
        db.query(
          "UPDATE users SET day1 = ? WHERE uid = ?",
          [score, userId],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              console.log("Day1: " + result);
            }
          }
        );
      } else if (day2Score === null) {
        db.query(
          "UPDATE users SET day2 = ? WHERE uid = ?",
          [score, userId],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              console.log("Day2: " + result);
            }
          }
        );
      } else if (day3Score === null) {
        db.query(
          "UPDATE users SET day3 = ? WHERE uid = ?",
          [score, userId],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              console.log("Day3: " + result);
            }
          }
        );
      } else if (day4Score === null) {
        db.query(
          "UPDATE users SET day4 = ? WHERE uid = ?",
          [score, userId],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              console.log("Day4: " + result);
            }
          }
        );
      } else if (day5Score === null) {
        db.query(
          "UPDATE users SET day5 = ? WHERE uid = ?",
          [score, userId],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              console.log("Day5: " + result);
            }
          }
        );
      }
      res.send({ message: result });
    } else {
      res.send({ message: "Some unrecognizable error occured!" });
    }
  });
});

/* Handaling post requests for '/showScore' path */
app.post("/showScore", (req, res, next) => {
  const userId = req.body.userId;
  console.log("User ID: ", userId);
  const score = req.body.dailyScore;
  console.log("Score: ", score);
  db.query("SELECT * FROM users WHERE uid = ?", [userId], (err, result) => {
    if (err) {
      console.log(err);
    } else if (result || result.length > 0) {
      /* Saving user's everyday test details in variables for comparison */
      const day1Score = result[0].day1;
      const day2Score = result[0].day2;
      const day3Score = result[0].day3;
      const day4Score = result[0].day4;
      const day5Score = result[0].day5;
      let scoreMessage = "";

      /* Checking if particular day's score is null and updating 'scoreMessage' according to that' */
      if (day1Score === null) {
        scoreMessage = " ";
      } else if (day2Score === null) {
        if (day1Score > score) {
          scoreMessage =
            "Well done 👍🏼 your score has gone down since yesterday by " +
            (day1Score - score);
        } else if (day1Score === score) {
          scoreMessage =
            "Your score is equal to that of yesterday. Below are some links to help you with any stress you are having.";
        } else {
          scoreMessage =
            "Your scores have increased by " +
            (score - day1Score) +
            ". You need to take it easy by taking a walk or doing some breathing exercises";
        }
      } else if (day3Score === null) {
        if (day2Score > score) {
          scoreMessage =
            "Well done 👍🏼 your score has gone down since yesterday by " +
            (day2Score - score);
        } else if (day2Score === score) {
          scoreMessage =
            "Your score is equal to that of yesterday. Below are some links to help you with any stress you are having.";
        } else {
          scoreMessage =
            "Your scores have increased by " +
            (score - day2Score) +
            ". You need to take it easy by taking a walk or doing some breathing exercises";
        }
      } else if (day4Score === null) {
        if (day3Score > score) {
          scoreMessage =
            "Well done 👍🏼 your score has gone down since yesterday by " +
            (day3Score - score);
        } else if (day3Score === score) {
          scoreMessage =
            "Your score is equal to that of yesterday. Below are some links to help you with any stress you are having.";
        } else {
          scoreMessage =
            "Your scores have increased by " +
            (score - day3Score) +
            ". You need to take it easy by taking a walk or doing some breathing exercises";
        }
      } else if (day5Score === null) {
        if (day4Score > score) {
          scoreMessage =
            "Well done 👍🏼 your score has gone down since yesterday by " +
            (day4Score - score);
        } else if (day4Score === score) {
          scoreMessage =
            "Your score is equal to that of yesterday. Below are some links to help you with any stress you are having.";
        } else {
          scoreMessage =
            "Your scores have increased by " +
            (score - day4Score) +
            ". You need to take it easy by taking a walk or doing some breathing exercises";
        }
      } else {
        scoreMessage =
          "Your average score is " +
          (day1Score + day2Score + day3Score + day4Score + day5Score) / 5;
      }
      if (scoreMessage) {
        /* Sending the message we stored in 'scoreMessage' */
        res.send({ scoreMessage: scoreMessage });
      } else {
        console.log("No scoreMesssage");
      }
    } else {
      console.log("Some unrecognizable error!");
    }
  });
});

/* Running the server on Port 3001 */
app.listen(3001, () => {
  console.log("App running!");
});

/*  Database - stressScale
    Table - users
    Columns - id, uid, password, day1, day2, day3, day4, day5, lastLogin
*/
