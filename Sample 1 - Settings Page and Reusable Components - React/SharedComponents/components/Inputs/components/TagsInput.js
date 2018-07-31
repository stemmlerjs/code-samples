
import React from 'react'
import PropTypes from 'prop-types'
import {
  Multiselect
} from "react-widgets";
import styles from '../styles/InputStyles.css'

/**
 * @class TagsInput
 * @desc Wrapper class for the react-widgets MultiSelect so that we may
 * control it's behavior even closer.
 */

export default class TagsInput extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    return (
      <div className={styles.textInputContainer}>
        <label className={styles.label}>{this.props.title}</label>
        <Multiselect
          data-cy=""
          className={styles.multiSelect}
          valueField={this.props.valueField}
          textField={this.props.textField}
          placeholder={this.props.placeholder}
          // messages={{}}
          data={this.props.data}
          value={this.props.value}
          onCreate={value => this.props.onCreateNewTag({ [this.props.textField]: value })}
          onChange={this.props.onChange}
        />
      </div>
    )
  }
}

TagsInput.propTypes = {
  valueField: PropTypes.string.isRequired,
  textField: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  value: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,

  handleCreateNewTag: PropTypes.func,
  onChange: PropTypes.func.isRequired
}
