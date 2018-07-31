import React from "react";
import PropTypes from "prop-types";
import styles from "../styles/InputStyles.css";
import { monthsArry, getYearList } from "helpers/date";
import { DropdownList } from "react-widgets";
import { isValidDate, isDate } from "helpers/date";

/**
 * DateComponent
 *
 * @class DateComponent
 * @desc The date component uses two dropdown lists that
 * mutate the value of a date object through the MONTH
 * and the YEAR for the date but not the DAY.
 */

export default class DateComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  /**
   * PropTypes
   */

  static propTypes = {
    // required
    title: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    datacy: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,

    // optional
    error: PropTypes.bool,
    errorMessage: PropTypes.string,
    required: PropTypes.bool,
    hideTitle: PropTypes.bool
  };

  /**
   * Default Props
   */

  static defaultProps = {
    error: false,
    errorMessage: "",
    required: false,
    hideTitle: false
  };

  /**
   * getValueFor
   *
   * @desc Returns the value for the YEAR or the MONTH
   * type.
   * @param {String} month || year.
   * @return {String | Number}
   */

  getValueFor(type) {
    let date = this.props.value;

    if (!!date == false) return "";
    if (!isValidDate(date)) return "";
    if (!isDate(date)) {
      date = new Date(date);
    }

    switch (type) {
      case "month":
        return monthsArry[date.getMonth()].name; // getMonth returns int
      case "year":
        return date.getFullYear();
      default:
        console.warn("invalid type for getValueFor " + type);
        return;
    }
  }

  /**
   * handleChange
   *
   * @desc Changes the value of either the 'month' or the 'year'
   * part of the date object.
   *
   * @param {Object | Number} new value
   * @param {String} either 'month' or 'year'
   * @return void
   */

  handleChange(value, type) {
    let date = !!this.props.value ? this.props.value : new Date();

    if (!isDate(date)) {
      date = new Date(date);
    }

    if (type == "year") {
      date.setYear(value);
    } else {
      date.setMonth(value.id);
    }

    this.props.onChange(date);
  }

  render() {
    const props = this.props;
    return (
      <div className={styles.textInputContainer}>
        <label className={styles.label}>{props.displayName}</label>
        <div className={styles.dateComponent}>
          <div>
            <DropdownList
              id={`${props.id}_month`}
              data-cy={`${props.datacy}-month`}
              className={styles.dateComponentDropdown}
              data={monthsArry}
              textField={"name"}
              valueField={"id"}
              value={this.getValueFor("month")}
              filter={true}
              onChange={value => this.handleChange(value, "month")}
            />
          </div>

          <div>
            <DropdownList
              id={`${props.id}_year`}
              data-cy={`${props.datacy}-year`}
              className={styles.dateComponentDropdown}
              data={getYearList(14, 6)}
              value={this.getValueFor("year")}
              onChange={value => this.handleChange(value, "year")}
            />
          </div>
        </div>
      </div>
    );
  }
}
