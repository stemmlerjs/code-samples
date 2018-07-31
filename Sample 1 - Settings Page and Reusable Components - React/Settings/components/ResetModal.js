import React from "react";
import PropTypes from "prop-types";
import styles from "../styles/ChangePasswordModal.css";

const ResetModal = props => {
  return (
    <div className={styles.innerModalContainer}>
      <h1>Enter your new password</h1>
      <TextInput
        type="password"
        title="Your new password"
        onChange={e =>
          props.onUpdatePassword("confirmPassword", e.target.value)
        }
        onEnterPress={props.onEnter}
      />
      <TextInput
        type="password"
        title="One more time"
        onChange={e =>
          props.onUpdatePassword("confirmPasswordAgain", e.target.value)
        }
        onEnterPress={props.onEnter}
      />
      {props.isSubmitting ? <Loading /> : ""}
      <ErrorMessage text={props.errorMessage} />
    </div>
  );
};

ResetModal.propTypes = {
  onUpdatePassword: PropTypes.func.isRequired,
  onEnter: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired
};

export default ResetModal;
