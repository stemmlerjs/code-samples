import React from "react";
import PropTypes from "prop-types";

import styles from "../styles/TextDisplayField.css";

const TextDisplayField = ({ text, placeholder }) => {
  return (
    <div className={styles.container}>
      {text ? (
        <div>{text}</div>
      ) : (
        <div className={styles.placeholder}>{placeholder}</div>
      )}
    </div>
  );
};

TextDisplayField.propTypes = {
  text: PropTypes.string,
  placeholder: PropTypes.string.isRequired
};

export default TextDisplayField;
