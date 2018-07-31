import React from "react";
import PropTypes from "prop-types";
import styles from "../styles/InputStyles.css";

const ButtonClearCancel = ({ text, onClick }) => {
  return (
    <button className={styles.buttonClearCancel} onClick={onClick}>
      {text}
    </button>
  );
};

export default ButtonClearCancel;
