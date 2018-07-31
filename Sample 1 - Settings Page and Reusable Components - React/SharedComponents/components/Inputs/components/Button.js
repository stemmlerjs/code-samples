import React from "react";
import PropTypes from "prop-types";
import styles from "../styles/InputStyles.css";

export default class Button extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { text, type, handleClick } = this.props;
    return (
      <button
        className={
          type == "normal-clear"
            ? `${styles.buttonBase} ${styles.normalClear}`
            : type == "danger-clear"
              ? `${styles.buttonBase} ${styles.dangerClear}`
              : type == "danger-bold"
                ? `${styles.buttonBase} ${styles.dangerBold}`
                : ""
        }
        onClick={handleClick}
      >
        {text}
      </button>
    );
  }
}

Button.propTypes = {
  text: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired
};
