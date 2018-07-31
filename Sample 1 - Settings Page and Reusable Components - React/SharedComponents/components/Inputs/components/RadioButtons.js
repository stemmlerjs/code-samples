import React from "react";
import PropTypes from "prop-types";
import styles from "../styles/InputStyles.css";

const RadioButton = props => {
  return (
    <label className={styles.radioButton}>
      <input
        checked={props.value == props.option.value}
        className={styles.checkmark}
        type="radio"
        name={props.displayName}
        data-check-value={props.option.value}
        onChange={props.onChange}
      />
      {props.option.name}
    </label>
  );
};

RadioButton.propTypes = {
  defaultValue: PropTypes.bool.isRequired,
  option: PropTypes.shape({
    value: PropTypes.any.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  displayName: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export default class RadioButtons extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      options,
      displayName,
      required,
      value,
      onChange
    } = this.props;
    return (
      <div className={styles.textInputContainer}>
        <label>
          {displayName}
          {required ? " *" : ""}
        </label>
        <div className={styles.radioButtonsContainer}>
          {options.map((option, index) => {
            return (
              <RadioButton
                key={index}
                value={value}
                option={option}
                displayName={displayName}
                onChange={onChange}
              />
            );
          })}
        </div>
      </div>
    );
  }
}
