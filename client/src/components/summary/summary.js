import { React, Fragment, Component } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

/* Creating 'Summary' component */
class Summary extends Component {
  constructor(props) {
    super(props);

    /* Defining the state of the app */
    this.state = {
      userId: "",
      score: 0,
      numberOfQuestions: 0,
      numberOfAnsweredQuestions: 0,
    };
  }

  componentDidMount() {
    const { state } = this.props.location;

    /* Setting the present state */
    this.setState = {
      userId: state.userId,
      score: state.score,
      numberOfQuestions: state.numberOfQuestions,
      numberOfAnsweredQuestions: state.numberOfAnsweredQuestions,
      scoreMessage: state.scoreMessage,
    };
  }
  render() {
    console.log(localStorage.getItem("userId"));
    console.log(
      "scoreMessage from summary",
      localStorage.getItem("scoreMessage")
    );
    console.log(this.props.location.state);

    /* Setting the state and other variables */
    const { state } = this.props.location;
    let stats,
      stressLevel,
      remark,
      relaxImg,
      link1,
      link2,
      link3,
      text1,
      text2,
      text3;

    /* Setting the gifs according to present score */
    if (state.score > -1 && state.score < 14) {
      this.stressLevel = "low";
      this.remark =
        "You have no reason to worry. Your stress levels are under control 🎉";
      this.relaxImg =
        "https://media4.giphy.com/media/pmONR25D6YmkI2qHVg/giphy.gif";
      this.text1 = "Ways to Manage Stress";
      this.link1 =
        "https://www.webmd.com/balance/stress-management/stress-management";
    } else if (state.score > 13 && state.score < 27) {
      this.stressLevel = "moderate";
      this.remark =
        "You have a moderate stress level. Need to work on a few things 🦾";
      this.relaxImg = "https://media3.giphy.com/media/2csuIJj6TmuKA/giphy.webp";
      this.text1 = "How to manage and reduce stress";
      this.link1 =
        "https://www.mentalhealth.org.uk/publications/how-manage-and-reduce-stress";
    } else {
      this.stressLevel = "hight";
      this.remark =
        "You need to relax, my friend! You have a high stress level 🤯";
      this.relaxImg =
        "https://media4.giphy.com/media/dDXZ3qU5nRBIe82Uit/giphy.gif";
      this.text1 = "16 Simple Ways to Relieve Stress and Anxiety";
      this.link1 =
        "https://www.healthline.com/nutrition/16-ways-relieve-stress-anxiety";
    }

    if (state !== undefined) {
      stats = (
        <Fragment>
          <div className="wrapper stats-wrapper">
            <p className="test-over">
              You have successfully completed the test ✅
            </p>
            <img className="relaxImg" src={this.relaxImg} alt="relax" />
            <p className="score">
              {state.userId}, Your score is {state.score}
            </p>
            <p className="score">{state.scoreMessage}</p>
            <div className="wrapper landing-footer-wrapper summary-footer-wrapper">
              <ul className="footer-nav-list">
                <label>Helpful links:</label>
                <a
                  href="https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/tips-to-reduce-stress/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <li className="footer-list-item">10 stress busters</li>
                </a>
                <a href={this.link1} target="_blank" rel="noreferrer">
                  <li className="footer-list-item">{this.text1}</li>
                </a>
              </ul>
            </div>
            <div className="stats-details">
              <div>
                <p>Total number of questions:{" " + state.numberOfQuestions}</p>
                <p>
                  Total number of questions answered:
                  {" " + state.numberOfAnsweredQuestions}
                </p>
              </div>
              <div>
                <Link to="/">
                  <button className="btn btn-form">Exit to Homepage</button>
                </Link>
              </div>
            </div>
          </div>
        </Fragment>
      );
    } else {
      stats = (
        <Fragment>
          <div className="wrapper stats-wrapper">
            <h1>Test results not available</h1>
          </div>
        </Fragment>
      );
    }

    return (
      <Fragment>
        <Helmet>
          <title>Stress Scale</title>
        </Helmet>
        <div className="container summary-container">{stats}</div>
      </Fragment>
    );
  }
}

export default Summary;
