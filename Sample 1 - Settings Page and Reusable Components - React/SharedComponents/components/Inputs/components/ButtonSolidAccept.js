import React from "react";
import PropTypes from "prop-types";
import styles from "../styles/InputStyles.css";

const ButtonSolidAccept = ({ text, onClick }) => {
  return (
    <button className={styles.buttonSolid} onClick={onClick}>
      {text}
    </button>
  );
};

export default ButtonSolidAccept;
