import React from "react";
import PropTypes from "prop-types";
import styles from "../styles/InputStyles.css";

export default class TextInput extends React.Component {
  static defaultProps = {
    title: "",
    required: false,
    maxCharacters: undefined,
    defaultValue: undefined,
    onChange: () => {},
    name: "",
    displayName: "",
    minValue: 0,
    maxValue: 35000,
    type: "text"
  };

  constructor(props) {
    super(props);
    this.handleEnterPress = this.handleEnterPress.bind(this);
  }

  handleEnterPress(e) {
    if (e.keyCode == 13 && this.props.onEnterPress) {
      this.props.onEnterPress();
    }
  }

  render() {
    const {
      title,
      required,
      maxCharacters,
      value,
      onChange,
      name,
      displayName,
      minValue,
      maxValue,
      type,
      overrideStylesClass
    } = this.props;

    return (
      <div
        className={`text-input ${
          styles.textInputContainer
        } ${overrideStylesClass}`}
      >
        <label className={styles.label}>
          {displayName ? displayName : ""}
          {title}
          {required ? " *" : ""}
        </label>

        <input
          onKeyUp={this.handleEnterPress}
          data-cy={`text-input-${name}`}
          maxLength={maxCharacters}
          onChange={onChange}
          value={value}
          min={minValue ? minValue : null}
          max={maxValue ? maxValue : null}
          type={type ? type : "text"}
        />
      </div>
    );
  }
}
