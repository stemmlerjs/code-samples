import React from 'react'
import PropTypes from 'prop-types'
import styles from '../styles/Heart.css'

export default class Heart extends React.Component {
  static defaultProps = {
    hearted: false
  }
  constructor (props) {
    super(props);
    this.state = {
      hearted: this.props.hearted
    }

    this.handleToggleHearted = this.handleToggleHearted.bind(this)
  }
  
  handleToggleHearted (e) {
    e.preventDefault();
    e.stopPropagation();

    this.props.handlePinJob(this.props.jobId, this.state.hearted)

    // If successful
    this.setState({
      hearted: !this.state.hearted
    })
  }

  componentWillReceiveProps(newProps) {
    let newHearted = newProps.hearted;
    this.setState({
      ...this.state,
      hearted: newHearted
    })
  }

  render () {
    const { hearted } = this.state;
    return (
      <div onClick={this.handleToggleHearted} className={styles.heartContainer}>
        <i className={hearted 
          ? `fa fa-heart ${styles.heartOn}`
          : `fa fa-heart ${styles.heartOff}`}>
        </i>
      </div>
    )
  }
}

Heart.propTypes = {
  onToggle: PropTypes.func,
  hearted: PropTypes.bool,
  jobId: PropTypes.number.isRequired
}