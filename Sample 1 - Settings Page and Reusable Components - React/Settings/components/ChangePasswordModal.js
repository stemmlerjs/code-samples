import React from "react";
import PropTypes from "prop-types";
import styles from "../styles/ChangePasswordModal.css";
import {
  Modal,
  ErrorMessage,
  Loading
} from "modules/SharedComponents/components/Display";
import { TextInput } from "modules/SharedComponents/components/Inputs";
import SendPasswordResetCodeModal from "./SendPasswordResetCodeModal";
import { generatePasswordResetCode, changePassword } from "helpers/auth";
import { validatePassword } from "helpers/utils";
import ResetModal from "./ResetModal";

/**
 * @class SuccessModal
 * @desc Shows at the end of the flow, after having successfully
 * updated the password.
 */

const SuccessModal = () => {
  return (
    <div className={styles.innerModalContainer}>
      <h1>Success!</h1>
      <div>You've updated your password.</div>
      <div>You can close this window.</div>
    </div>
  );
};

/**
 * @class InitialModal
 * @desc The first modal in order to reset your account password.
 * State = INITIAL
 */

const InitialModal = props => {
  return (
    <div className={styles.innerModalContainer}>
      <h1>Change Password</h1>
      <TextInput
        type="password"
        title="Your current password"
        onChange={e =>
          props.onUpdatePassword("initialPassword", e.target.value)
        }
        onEnterPress={props.onEnter}
      />
      <div
        onClick={props.handleOpenSendPasswordResetCodeModal}
        className={styles.underlineLabel}
      >
        Forgot?
      </div>
      {props.isSubmitting ? <Loading /> : ""}
      <ErrorMessage text={props.errorMessage} />
    </div>
  );
};

InitialModal.propTypes = {
  onUpdatePassword: PropTypes.func.isRequired,
  handleOpenSendPasswordResetCodeModal: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  error: PropTypes.string.isRequired,
  onEnter: PropTypes.func.isRequired
};

/**
 * @class ChangePasswordModal
 * @desc This modal will allow us to reset our password.
 */

export default class ChangePasswordModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: "INITIAL",
      initialPassword: "",
      confirmPassword: "",
      confirmPasswordAgain: "",
      resetCode: "",
      errorMessage: "",
      sendPasswordResetModal: {
        isOpen: false
      },
      isSubmitting: false,
      isSubmittingSuccess: false,
      isSubmittingFailure: false
    };

    this.handleOpenSendPasswordResetCodeModal = this.handleOpenSendPasswordResetCodeModal.bind(
      this
    );
    this.handleCloseSendPasswordResetCodeModal = this.handleCloseSendPasswordResetCodeModal.bind(
      this
    );
    this.handleVerifyInitialPassword = this.handleVerifyInitialPassword.bind(
      this
    );
    this.handleUpdatePassword = this.handleUpdatePassword.bind(this);
    this.handleSubmitNewPasswordReset = this.handleSubmitNewPasswordReset.bind(
      this
    );
    this.getAcceptButtonFunction = this.getAcceptButtonFunction.bind(this);
    this.getAcceptButtonText = this.getAcceptButtonText.bind(this);
  }

  /**
   * handleOpenSendPasswordResetCodeModal
   *
   * @desc Opens the send password reset code modal
   */

  handleOpenSendPasswordResetCodeModal() {
    this.setState({
      ...this.state,
      sendPasswordResetModal: {
        ...this.state.sendPasswordResetModal,
        isOpen: true
      }
    });
  }

  /**
   * handleCloseSendPasswordResetCodeModal
   *
   * @desc Closes the send password reset code modal
   */

  handleCloseSendPasswordResetCodeModal() {
    this.setState({
      ...this.state,
      sendPasswordResetModal: {
        ...this.state.sendPasswordResetModal,
        isOpen: false
      }
    });
  }

  /**
   * handleVerifyInitialPassword
   *
   * @desc Checks to see if the current password for this
   * user really is valid and generates a valid password redirect
   * code for this user if it is.
   */

  async handleVerifyInitialPassword() {
    let password = this.state.initialPassword;
    let response;
    let code;

    this.setState({
      ...this.state,
      isSubmitting: true,
      isSubmittingSuccess: false,
      isSubmittingFailure: false
    });

    try {
      response = await generatePasswordResetCode(password);
      code = response.data.code;
      this.setState({
        ...this.state,
        resetCode: code,
        page: "RESET",
        isSubmitting: false,
        isSubmittingSuccess: true,
        isSubmittingFailure: false
      });
    } catch (err) {
      // 400 => Wrong password
      if (err.status == 400) {
        this.setState({
          ...this.state,
          errorMessage: "Password not correct",
          isSubmitting: false,
          isSubmittingFailure: true,
          isSubmittingSuccess: false
        });
      } else {
        this.setState({
          ...this.state,
          errorMessage: "We encountered an error, please try again later.",
          isSubmitting: false,
          isSubmittingFailure: true,
          isSubmittingSuccess: false
        });
      }
    }
  }

  /**
   * handleUpdatePassword
   *
   * @desc Hold the password text in state when the user is typing.
   * @param {String} new text value
   */

  handleUpdatePassword(fieldName, newValue) {
    this.setState({
      ...this.state,
      [fieldName]: newValue,
      errorMessage: "",
      isSubmitting: false,
      isSubmittingFailure: false,
      isSubmittingSuccess: false
    });
  }
  /**
   * handleSubmitNewPasswordReset
   *
   * @desc Confirm the new password from the two fields
   * and then change the password in the backend.
   */

  async handleSubmitNewPasswordReset() {
    let passwordOne = this.state.confirmPassword;
    let passwordTwo = this.state.confirmPasswordAgain;

    if (!passwordOne || !passwordTwo) {
      return this.setState({
        ...this.state,
        errorMessage: "Hey! Don't you want to enter your new password?"
      });
    }

    if (passwordOne != passwordTwo) {
      return this.setState({
        ...this.state,
        errorMessage: "Passwords don't match."
      });
    }

    if (!validatePassword(passwordOne)) {
      return this.setState({
        ...this.state,
        errorMessage:
          "Passwords need to be at least 8 characters, contain 1 upper case character, 1 lower case, 1 symbol and 1 number.\n\nTrust us!"
      });
    }

    // All good, now we submit
    this.setState({
      ...this.state,
      isSubmitting: true,
      isSubmittingSuccess: false,
      isSubmittingFailure: false
    });

    try {
      await changePassword(passwordOne, this.state.resetCode);

      this.setState({
        ...this.state,
        page: "SUCCESS",
        isSubmitting: false,
        isSubmittingFailure: true,
        isSubmittingSuccess: false
      });
    } catch (err) {
      if (err.status == 400) {
        this.setState({
          ...this.state,
          errorMessage:
            "Too slow! The password reset code expired. Refresh the page and try again.",
          isSubmitting: false,
          isSubmittingFailure: true,
          isSubmittingSuccess: false
        });
      } else {
        this.setState({
          ...this.state,
          errorMessage: "We encountered an error, please try again later.",
          isSubmitting: false,
          isSubmittingFailure: true,
          isSubmittingSuccess: false
        });
      }
    }
  }

  /**
   * getAcceptButtonFunction
   *
   * @desc Gets the appropriate action that needs to
   * happen when we click the accept button.
   */

  getAcceptButtonFunction() {
    if (this.state.page == "INITIAL") {
      return this.handleVerifyInitialPassword;
    } else if (this.state.page == "RESET") {
      return this.handleSubmitNewPasswordReset;
    } else if (this.state.page == "SUCCESS") {
      this.setState({
        page: "INITIAL",
        initialPassword: "",
        confirmPassword: "",
        confirmPasswordAgain: "",
        resetCode: "",
        errorMessage: "",
        sendPasswordResetModal: {
          isOpen: false
        },
        isSubmitting: false,
        isSubmittingSuccess: false,
        isSubmittingFailure: false
      });
      return this.props.onClose;
    }
  }

  /**
   * getAcceptButtonText
   *
   * @desc Get the appropriate text that needs to show
   * on the modal.
   */

  getAcceptButtonText() {
    if (this.state.page == "INITIAL") {
      return "OK";
    } else if (this.state.page == "RESET") {
      return "Change password";
    } else if (this.state.page == "SUCCESS") {
      return "OK";
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
        <SendPasswordResetCodeModal
          isOpen={this.state.sendPasswordResetModal.isOpen}
          onClose={this.handleCloseSendPasswordResetCodeModal}
          email={this.props.email}
        />

        {(() => {
          switch (this.state.page) {
            case "INITIAL":
              return (
                <InitialModal
                  handleOpenSendPasswordResetCodeModal={
                    this.handleOpenSendPasswordResetCodeModal
                  }
                  onUpdatePassword={this.handleUpdatePassword}
                  onEnter={this.handleVerifyInitialPassword}
                  errorMessage={this.state.errorMessage}
                  isSubmitting={this.state.isSubmitting}
                />
              );
            case "RESET":
              return (
                <ResetModal
                  onUpdatePassword={this.handleUpdatePassword}
                  onEnter={this.handleSubmitNewPasswordReset}
                  errorMessage={this.state.errorMessage}
                  isSubmitting={this.state.isSubmitting}
                />
              );
            case "SUCCESS":
              return <SuccessModal />;
            default:
              return "";
          }
        })()}
      </Modal>
    );
  }
}

ChangePasswordModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};
