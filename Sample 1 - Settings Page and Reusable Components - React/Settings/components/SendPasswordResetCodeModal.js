import React from "react";
import PropTypes from "prop-types";
import styles from "../styles/SendPasswordResetCodeModal.css";
import {
  Modal,
  Loading,
  ErrorMessage
} from "modules/SharedComponents/components/Display";
import { TextInput } from "modules/SharedComponents/components/Inputs";
import { submitPasswordReset } from "helpers/reset";

const InitialModal = props => {
  return (
    <div>
      <h1>Reset password</h1>
      <div style={{ marginTop: "1em" }}>
        Can't remember your password, eh? Want us to send you a reset code to
        the email you signed up with?
      </div>
      <button onClick={props.handleSendCode} className={styles.button}>
        Send me a code
      </button>
      {props.isSendingCode ? <Loading /> : ""}
      <ErrorMessage text={props.errorMessage} />
    </div>
  );
};

const SuccessModal = () => {
  return (
    <div>
      <h1>Reset password</h1>
      <div style={{ marginTop: "1em" }}>
        Done. You should get an email shortly!
      </div>
    </div>
  );
};

export default class SendPasswordResetCodeModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSendingCode: false,
      isSendingCodeSuccess: false,
      isSendingCodeFailure: false,
      errorMessage: ""
    };

    this.handleSendCode = this.handleSendCode.bind(this);
  }

  async handleSendCode() {
    let email = this.props.email;
    this.setState({
      ...this.state,
      isSendingCode: true,
      isSendingCodeSuccess: false,
      isSendingCodeFailure: false,
      errorMessage: ""
    });

    try {
      await submitPasswordReset(email);

      this.setState({
        isSendingCode: false,
        isSendingCodeSuccess: true,
        isSendingCodeFailure: false
      });
    } catch (err) {
      console.log(err);

      this.setState({
        isSendingCode: false,
        isSendingCodeSuccess: false,
        isSendingCodeFailure: true,
        errorMessage:
          "Looks like something's broken on our end. Please try again later."
      });
    }
  }

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onClose={this.props.onClose}
        centered={true}
      >
        {!this.state.isSendingCodeSuccess ? (
          <InitialModal
            handleSendCode={this.handleSendCode}
            isSendingCode={this.state.isSendingCode}
            errorMessage={this.state.errorMessage}
          />
        ) : (
          <SuccessModal />
        )}
      </Modal>
    );
  }
}

SendPasswordResetCodeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};
