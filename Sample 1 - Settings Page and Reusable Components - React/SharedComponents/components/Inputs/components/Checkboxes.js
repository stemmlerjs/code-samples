import React from "react";
import PropTypes from "prop-types";
import styles from "../styles/InputStyles.css";

const Checkbox = ({ checked, id, label, onClick }) => {
  return (
    <div onClick={onClick} className={styles.checkboxContainer}>
      <div className={styles.checkbox}>
        <input type="checkbox" checked={checked} id={id} />
        <label htmlFor={`${label}`} />
      </div>
      <div>{label}</div>
    </div>
  );
};

export default class Checkboxes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      groups: this.getAllGroups()
    };

    this.isItemChecked = this.isItemChecked.bind(this);
    this.getAllGroups = this.getAllGroups.bind(this);
    this.areAllSelected = this.areAllSelected.bind(this);
    this.handleSelectAll = this.handleSelectAll.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.handleSelectNone = this.handleSelectNone.bind(this);
    this.areNoneSelected = this.areNoneSelected.bind(this);
  }

  /**
   * isItemChecked
   *
   * Determines if a particular item is selected.
   *
   * @param {String} name of the group we're looking in
   * @param {String} the value we're looking to see if this user has
   * enabled.
   *
   * @return {Boolean}
   */

  isItemChecked(groupName, itemValue) {
    if (this.state.groups[groupName].indexOf(itemValue) !== -1) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * areAllSelected
   *
   * Determines if all of the items are selected or not.
   * If they are, returns true. Otherwise, false.
   *
   * @param {Object} the entire group object.
   * @return {Boolean}
   */

  areAllSelected(group) {
    if (group.items.length == this.state.groups[group.name].length) {
      return true;
    }
    return false;
  }

  /**
   * getAllGroups
   *
   * @desc This method only gets all of the groups and places
   * them onto state so that we can use it to reference if
   * an item is checked in n time rather than 2n time.
   * @return {Object}
   */

  getAllGroups() {
    let groups = {};
    for (let group of this.props.groups) {
      groups[group.name] = group.value;
    }
    return groups;
  }

  /**
   * handleSelectAll
   *
   * Select all of the items for this group.
   *
   * @param {Object} the entire group object.
   */

  handleSelectAll(group) {
    this.setState(
      {
        ...this.state,
        groups: {
          ...this.state.groups,
          [group.name]: group.items.map(item => item[group.valueField])
        }
      },
      () => {
        this.props.onChange(group.name, this.state.groups[group.name]);
      }
    );
  }

  /**
   * handleToggle
   *
   * Toggles a value.
   *
   * @param {String} name of the group we're looking in
   * @param {Any} item that we're toggling
   *
   */

  handleToggle(e, groupName, item, singleSelection) {
    e.preventDefault();
    e.stopPropagation();

    let newArr = [];
    let index = this.state.groups[groupName].indexOf(item);

    if (singleSelection) {
      newArr.push(item);
    } else {
      // Add the item if it's not there.
      if (index == -1) {
        newArr = this.state.groups[groupName].concat(item);
      } else {
        // Remove the item if it is in the array.
        newArr = this.state.groups[groupName];
        newArr.splice(index, 1);
      }
    }

    this.setState(
      {
        ...this.state,
        groups: {
          ...this.state.groups,
          [groupName]: newArr
        }
      },
      () => {
        this.props.onChange(groupName, this.state.groups[groupName]);
      }
    );
  }

  handleSelectNone(groupName) {
    this.setState(
      {
        ...this.state,
        groups: {
          ...this.state.groups,
          [groupName]: []
        }
      },
      () => {
        this.props.onChange(groupName, this.state.groups[groupName]);
      }
    );
  }

  /**
   * areNoneSelected
   *
   * Returns true if none of the items are selected,
   * false if otherwise.
   *
   * @param {String} group name
   * @return {Boolean}
   */

  areNoneSelected(groupName) {
    if (this.state.groups[groupName].length == 0) {
      return true;
    }
    return false;
  }

  render() {
    const { groups } = this.props;

    return (
      <div>
        {groups.map(group => (
          <div className={styles.groupContainer}>
            <div className={styles.checkboxGroupTitle}>{group.title}</div>
            {group.allCheckboxEnabled ? (
              <Checkbox
                checked={this.areAllSelected(group)}
                id={group.allCheckboxText}
                label={group.allCheckboxText}
                onClick={() => this.handleSelectAll(group)}
              />
            ) : (
              ""
            )}
            {group.items.map(item => (
              <Checkbox
                checked={this.isItemChecked(group.name, item[group.valueField])}
                id={`${item[group.textField]}`}
                label={`${item[group.textField]}`}
                onClick={e =>
                  this.handleToggle(
                    e,
                    group.name,
                    item[group.valueField],
                    group.singleSelection
                  )
                }
              />
            ))}

            {group.noneCheckboxEnabled ? (
              <Checkbox
                checked={this.areNoneSelected(group.name)}
                id={group.noneCheckboxText}
                label={group.noneCheckboxText}
                onClick={() => this.handleSelectNone(group.name)}
              />
            ) : (
              ""
            )}
          </div>
        ))}
      </div>
    );
  }
}

Checkboxes.propTypes = {
  values: PropTypes.arrayOf(PropTypes.number).isRequired,
  items: PropTypes.array.isRequired,
  allCheckboxEnabled: PropTypes.bool,
  allCheckboxText: PropTypes.string,
  valueField: PropTypes.string.isRequired,
  textField: PropTypes.string.isRequired
};
