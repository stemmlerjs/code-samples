import React from "react";
import PropTypes from "prop-types";
import styles from "../styles/DeleteAccountModal.css";
import { Modal } from "modules/SharedComponents/components/Display";
import Feedback from "./FeedbackModal";
import { deleteAccount } from "helpers/account";

const feedbackReasons = [
  { name: "I found work through Univjobs", id: 1 },
  { name: "I found work elsewhere", id: 2 },
  { name: "Not enough jobs I'm interested in", id: 3 },
  { name: "Other", id: 4 }
];

const Initial = props => {
  return (
    <div className={styles.innerModalContainer}>
      <h1>Delete account</h1>
      <div>Are you sure</div>
    </div>
  );
};

const Success = () => {
  return (
    <div className={styles.innerModalContainer}>
      <h1>Done!</h1>
      <div>Your account has been deleted.</div>
      <div>Thanks for trying Univjobs 😊</div>
    </div>
  );
};

export default class DeleteAccountModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      page: "INITIAL",
      comments: "",
      checkboxes: [],
      isDeletingAccount: false,
      isDeletingAccountSuccess: false,
      isDeletingAccountFailure: false,
      errorMessage: ""
    };

    this.getAcceptButtonText = this.getAcceptButtonText.bind(this);
    this.getAcceptButtonFunction = this.getAcceptButtonFunction.bind(this);
    this.handleShowFeedback = this.handleShowFeedback.bind(this);
    this.updateFeedbackForm = this.updateFeedbackForm.bind(this);
    this.handleDeleteAccount = this.handleDeleteAccount.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  getAcceptButtonText() {
    if (this.state.page == "INITIAL") {
      return "OK";
    } else if (this.state.page == "FEEDBACK") {
      return "Delete account";
    } else if (this.state.page == "SUCCESS") {
      return "Finish";
    }
  }

  getAcceptButtonFunction() {
    if (this.state.page == "INITIAL") {
      return this.handleShowFeedback;
    } else if (this.state.page == "FEEDBACK") {
      return this.handleDeleteAccount;
    } else if (this.state.page == "SUCCESS") {
      return this.handleLogout;
    }
  }

  handleLogout() {
    window.location.reload();
  }

  handleShowFeedback() {
    this.setState({
      ...this.state,
      page: "FEEDBACK"
    });
  }

  updateFeedbackForm(fieldName, value) {
    this.setState({
      ...this.state,
      [fieldName]: value,
      errorMessage: "",
      isDeletingAccountSuccess: false,
      isDeletingAccountFailure: false
    });
  }

  async handleDeleteAccount() {
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
      isDeletingAccount: true,
      isDeletingAccountSuccess: false,
      isDeletingAccountFailure: false
    });

    try {
      await deleteAccount(comments, reasons);

      this.setState({
        ...this.state,
        isDeletingAccount: false,
        isDeletingAccountSuccess: true,
        isDeletingAccountFailure: false,
        page: "SUCCESS"
      });
    } catch (err) {
      this.setState({
        ...this.state,
        isDeletingAccount: false,
        isDeletingAccountSuccess: false,
        isDeletingAccountFailure: true,
        errorMessage:
          "We ran into an unexpected error deleting your account. Please try again later."
      });
    }
  }

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onClose={this.props.onClose}
        centered={true}
        buttons={{
          accept: {
            text: this.getAcceptButtonText(),
            onClick: this.getAcceptButtonFunction()
          },
          cancel: {
            text: "Cancel",
            onClick: this.props.onClose
          }
        }}
      >
        {(() => {
          switch (this.state.page) {
            case "INITIAL":
              return <Initial />;
            case "FEEDBACK":
              return (
                <Feedback
                  updateFeedbackForm={this.updateFeedbackForm}
                  comments={this.state.comments}
                  isSubmitting={this.state.isDeletingAccount}
                  errorMessage={this.state.errorMessage}
                  title={"Before you go"}
                  subTitle={
                    "Care to let us know why you're leaving? We'd really appreciate your feedback!"
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

DeleteAccountModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};
