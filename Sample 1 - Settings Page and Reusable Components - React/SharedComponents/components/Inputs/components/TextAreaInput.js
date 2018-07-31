import React from "react";
import PropTypes from "prop-types";
import styles from "../styles/InputStyles.css";

/**
 * TextAreaInput
 */

const TextAreaInput = ({
  title,
  required,
  maxCharacters,
  value = "",
  onChange,
  name,
  displayName
}) => {
  if (!!value == false) {
    value = "";
  }
  return (
    <div className={styles.textAreaInputContainer}>
      <div className={styles.textAreaInputMaxCharsContainer}>
        <label>
          {displayName ? displayName : ""}
          {title}
          {required ? " *" : ""}
        </label>
        <label>{maxCharacters - value.length}</label>
      </div>
      <textarea
        data-cy={`text-input-${name}`}
        maxLength={maxCharacters}
        onChange={onChange}
        value={value}
        type="text"
      />
    </div>
  );
};

export default TextAreaInput;
