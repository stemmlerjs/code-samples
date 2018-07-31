import React from "react";
import PropTypes from "prop-types";
import styles from "../styles/Setting.css";
import {
  TextInput,
  Dropdown,
  Checkboxes,
  Button
} from "modules/SharedComponents/components/Inputs";

const SettingHeader = ({ title, description, icon }) => {
  return (
    <div className={styles.settingHeader}>
      <div className={styles.iconContainer}>
        <i className={`fa ${icon}`} />
      </div>
      <div className={styles.headerDetailsContainer}>
        <div className={styles.headerTitle}>{title}</div>
        <div className={styles.headerDescription}>{description}</div>
      </div>
    </div>
  );
};

/**
 * @class Setting
 * @desc This class holds all of the different configuration components
 * for Settings. By passing in a config with the different groups of
 * items for this Setting component required, it will render the appropriate
 * inputs and place the values inside.
 *
 * It signals intent to update the upper layer component once one of the
 * fields are blurred.
 */

export default class Setting extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log("<Setting/>", this.props);
    return (
      <div className={styles.settingContainer}>
        <SettingHeader
          title={this.props.title}
          description={this.props.description}
          icon={this.props.icon}
        />
        <div className={styles.settingInputsContainer}>
          {this.props.data.map(data => {
            {
              switch (data.type) {
                case "email":
                  return (
                    <TextInput
                      value={data.value}
                      onChange={e =>
                        this.props.updateValue(data.name, e.target.value)
                      }
                      name={data.name}
                      type={data.type}
                      overrideStylesClass={styles.textInputClass}
                    />
                  );
                case "dropdown":
                  return (
                    <Dropdown
                      id={data.name}
                      list={data.list}
                      defaultValue={data.value}
                      textField={data.textField}
                      valueField={data.valueField}
                      onChange={e =>
                        this.props.updateValue(data.name, e[data.valueField])
                      }
                      overrideStylesClass={styles.textInputClass}
                    />
                  );
                case "checkboxes":
                  return (
                    <Checkboxes
                      groups={data.groups}
                      onChange={(group, newValue) =>
                        this.props.updateValue(group, newValue)
                      }
                    />
                  );
                case "button":
                  return (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center"
                      }}
                    >
                      <Button
                        type={data.buttonType}
                        text={data.text}
                        handleClick={data.onClick}
                      />
                    </div>
                  );
                default:
                  return null;
              }
            }
          })}
        </div>
      </div>
    );
  }
}

Setting.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  data: PropTypes.arrayOf({
    type: PropTypes.string.isRequired
  }).isRequired,
  icon: PropTypes.string.isRequired
};
