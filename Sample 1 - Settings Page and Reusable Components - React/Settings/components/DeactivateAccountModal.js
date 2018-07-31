import React from "react";
import PropTypes from "prop-types";
import styles from "../styles/DeactivateAccountModal.css";
import {
  Modal,
  ErrorMessage,
  Loading
} from "modules/SharedComponents/components/Display";
import {
  TextInput,
  Checkboxes,
  TextAreaInput
} from "modules/SharedComponents/components/Inputs";
import { deactivateAccount } from "helpers/account";
import Feedback from "./FeedbackModal";

const feedbackReasons = [
  { name: "I found work through Univjobs", id: 1 },
  { name: "I found work elsewhere", id: 2 },
  { name: "Not enough jobs I'm interested in", id: 3 },
  { name: "Other", id: 4 }
];

const InitialDeactivate = () => {
  return (
    <div className={styles.innerModalContainer}>
      <h1>Deactivate account</h1>
      <div>Need a break? You can always come back if you like.</div>
    </div>
  );
};

const Success = () => {
  return (
    <div className={styles.innerModalContainer}>
      <h1>Done!</h1>
      <div>Your account has been deactivated.</div>
      <div>You're always welcome back 😊</div>
    </div>
  );
};

export default class DeactivateAccountModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      page: "INITIAL",
      comments: "",
      checkboxes: [],
      isSubmitting: false,
      isSubmittingSuccess: false,
      isSubmittingFailure: false,
      errorMessage: ""
    };

    this.getAcceptButtonFunction = this.getAcceptButtonFunction.bind(this);
    this.getAcceptButtonText = this.getAcceptButtonText.bind(this);
    this.handleAskForFeedback = this.handleAskForFeedback.bind(this);
    this.updateFeedbackForm = this.updateFeedbackForm.bind(this);
    this.handleDeactivate = this.handleDeactivate.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  getAcceptButtonFunction() {
    if (this.state.page == "INITIAL") {
      return this.handleAskForFeedback;
    } else if (this.state.page == "FEEDBACK") {
      return this.handleDeactivate;
    } else if (this.state.page == "SUCCESS") {
      return this.handleLogout;
    }
  }

  getAcceptButtonText() {
    if (this.state.page == "INITIAL") {
      return "Yes";
    } else if (this.state.page == "FEEDBACK") {
      return "Deactivate";
    } else if (this.state.page == "SUCCESS") {
      return "Logout";
    }
  }

  handleAskForFeedback() {
    this.setState({
      ...this.state,
      page: "FEEDBACK",
      comments: ""
    });
  }

  updateFeedbackForm(fieldName, value) {
    this.setState({
      ...this.state,
      [fieldName]: value,
      errorMessage: "",
      isSubmittingSuccess: false,
      isSubmittingFailure: false
    });
  }

  async handleDeactivate() {
    let comments = this.state.comments;
    let reasons = this.state.checkboxes[0];

    // Gather the reason text.
    // We will submit everything and save it
    // as text.
    if (reasons) {
      for (let reason of feedbackReasons) {
        if (reason.id == reasons) {
          reasons = reason.name;
        }
      }
    }

    this.setState({
      ...this.state,
      isSubmitting: true,
      isSubmittingSuccess: false,
      isSubmittingFailure: false
    });

    try {
      await deactivateAccount(comments, reasons);

      this.setState({
        ...this.state,
        isSubmitting: false,
        isSubmittingSuccess: true,
        isSubmittingFailure: false,
        page: "SUCCESS"
      });
    } catch (err) {
      this.setState({
        ...this.state,
        isSubmitting: false,
        isSubmittingSuccess: false,
        isSubmittingFailure: true,
        errorMessage:
          "We ran into an unexpected error deactivating your account. Please try again later."
      });
    }
  }

  handleLogout() {
    window.location.reload();
  }

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onClose={this.props.onClose}
        centered={true}
        buttons={{
          accept: {
            onClick: this.getAcceptButtonFunction(),
            text: this.getAcceptButtonText()
          },
          cancel: {
            onClick: this.props.onClose,
            text: "Cancel"
          }
        }}
      >
        {(() => {
          switch (this.state.page) {
            case "INITIAL":
              return <InitialDeactivate />;
            case "FEEDBACK":
              return (
                <Feedback
                  updateFeedbackForm={this.updateFeedbackForm}
                  comments={this.state.comments}
                  isSubmitting={this.state.isSubmitting}
                  errorMessage={this.state.errorMessage}
                  title={"Before you go"}
                  subTitle={
                    "Could you let us know why you're taking a break? We'd really appreciate it."
                  }
                />
              );
            case "SUCCESS":
              return <Success />;
            default:
              return null;
          }
        })()}
      </Modal>
    );
  }
}

DeactivateAccountModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

/**
 * Deactivate
 * 1. Deactivate Account
 * Do you really want to deactivate your account?
 *
 */
