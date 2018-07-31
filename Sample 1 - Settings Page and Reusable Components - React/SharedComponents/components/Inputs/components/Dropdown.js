import React from "react";
import PropTypes from "prop-types";
import { DropdownList } from "react-widgets";
import styles from "../styles/InputStyles.css";

/**
 * Dropdown
 *
 * @class The Dropdown component is a wrapper for our
 * standard DropdownList from react-components. It inherits a style
 * from './Input.global.css'.
 *
 */

const Dropdown = props => {
  console.log("<Dropdown/>", props.textField, props);
  return (
    <div
      className={`${styles.textInputContainer} ${props.overrideStylesClass}`}
    >
      <label className={styles.fileName}>
        {props.displayName ? props.displayName : ""}{" "}
        {props.required ? " *" : ""}
      </label>
      <DropdownList
        id={props.id}
        // data-cy={props.datacy}
        data={props.list}
        textField={props.textField}
        valueField={props.valueField}
        value={
          Array.isArray(props.defaultValue)
            ? props.defaultValue[0]
            : props.defaultValue
        }
        filter={"contains"}
        allowCreate={props.allowCreate}
        onChange={value => props.onChange(value)}
        // onCreate={value => (!!props.onCreate ? props.onCreate(value) : null)}
        // onSelect={value => (!!props.onSelect ? props.onSelect(value) : null)}
      />
    </div>
  );
};

Dropdown.propTypes = {
  displayName: PropTypes.string,
  required: PropTypes.string,
  id: PropTypes.any,
  list: PropTypes.array.required,
  textField: PropTypes.string.isRequired,
  valueField: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  defaultValue: PropTypes.isRequired,
  allowCreate: PropTypes.bool
};

export default Dropdown;
