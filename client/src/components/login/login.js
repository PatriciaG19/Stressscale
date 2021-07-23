import { React, Fragment, useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Axios from "axios";

/* Checking if there is any scoreMessage variables set in localstorage and removing them */
if (localStorage.getItem("scoreMessage") !== null) {
  localStorage.removeItem("scoreMessage");
}

/* Creating the 'login' component */
function Login() {
  const [loginIdInput, setloginIdInput] = useState("");
  const [loginPasswordInput, setloginPasswordInput] = useState("");

  /* Enabling Axios withCredentials to be able to use sessions */
  Axios.defaults.withCredentials = true;

  /* Handaling the Login functionalities with log() */
  const log = () => {
    Axios.post("http://localhost:3001/login", {
      userId: loginIdInput,
      userPassword: loginPasswordInput,
    }).then((response) => {
      if (response.data.message === "User Id and Password combination wrong!") {
        alert(response.data.message);
      } else if (response.data.fail) {
        alert(response.data.fail);
      } else {
        localStorage.setItem("userId", response.data.message[0].uid);
        // let userId = response.data.message[0].uid;
        let userId = localStorage.getItem("userId");
        alert("Welcome " + userId);
        console.log(response.data.message);
        // window.location = "/questions?uid=" + userId;
        window.location = "/questions";
      }
    });
  };

  /* Using useEffect() to send get request to backend server  and store logged in user's user Id in local storage */
  useEffect(() => {
    Axios.get("http://localhost:3001/login").then((response) => {
      // console.log(response.data.user[0].uid);
      if (response.data.user) {
        localStorage.setItem("userId", response.data.user[0].uid);
      }
    });
  });

  return (
    <Fragment>
      <Helmet>
        <title>Stress Scale</title>
      </Helmet>
      <div className="container landing-container">
        <div className="wrapper landing-nav-wrapper">
          <div className="logo"></div>
          <div className="form login-form">
            {/* Setting up the ID and Password for sending to server */}
            <input
              type="text"
              id="loginIdInput"
              onChange={(e) => {
                setloginIdInput(e.target.value);
              }}
              placeholder="Enter your User ID..."
            />
            <input
              type="text"
              id="loginPasswordInput"
              onChange={(e) => {
                setloginPasswordInput(e.target.value);
              }}
              placeholder="Enter your Password..."
            />
            <ul className="nav-list">
              {/* Calling log() function on clicking the button */}
              <Link onClick={log}>
                <li className="list-item">Login and take test</li>
              </Link>
            </ul>
          </div>
          {/* Link to go back to landing page */}
          <Link to="/">
            <button type="button" className="btn btn-form btn-login">
              Go Back
            </button>
          </Link>
        </div>
        <div className="wrapper landing-footer-wrapper">
          <ul className="footer-nav-list">
            <label>Helpful links:</label>
            <a
              href="https://www.healthline.com/nutrition/16-ways-relieve-stress-anxiety"
              target="_blank"
              rel="noreferrer"
            >
              <li className="footer-list-item">
                16 Simple Ways to Relieve Stress and Anxiety
              </li>
            </a>
            <a
              href="https://www.mentalhealth.org.uk/publications/how-manage-and-reduce-stress"
              target="_blank"
              rel="noreferrer"
            >
              <li className="footer-list-item">
                How to manage and reduce stress
              </li>
            </a>
          </ul>
        </div>
      </div>
    </Fragment>
  );
}

export default Login;
