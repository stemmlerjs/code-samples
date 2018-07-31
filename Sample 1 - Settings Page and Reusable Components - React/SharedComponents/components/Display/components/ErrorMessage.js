import React from "react";
import PropTypes from "prop-types";
import { ClipLoader } from "react-spinners";
import styles from "../styles/ErrorMessage.css";

const ErrorMessage = ({ text }) => {
  return (
    <div
      style={{
        opacity: !!text == false ? 0 : 1
      }}
      className={styles.errorText}
    >
      {text}
    </div>
  );
};

ErrorMessage.propTypes = {
  text: PropTypes.string.isRequired
};

export default ErrorMessage;
