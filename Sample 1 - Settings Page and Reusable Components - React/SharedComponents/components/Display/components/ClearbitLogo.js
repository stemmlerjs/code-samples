import React from "react";
import PropTypes from "prop-types";
import axios from "axios";
import company from "assets/svg/company.svg";
import { ClipLoader } from "react-spinners";

function stripChars(txt) {
  return txt.replace(" ", "").replace(",", "");
}

/**
 * @class ClearbitLogo
 * @desc Display the clearbit logo of a company sourced from
 * their company name.
 *
 * Works with schools, companies, institutions- anything that
 * has a website.
 */

export default class ClearbitLogo extends React.Component {
  static defaultProps = {
    companyName: ""
  };

  constructor(props) {
    super(props);
    this.state = {
      isRetrievingImage: false,
      isRetrievingImageSuccess: false,
      isRetrievingImageFailure: false,
      image: null
    };

    this.updateFetchLifecycle = this.updateFetchLifecycle.bind(this);
    this.getCompanyLogo = this.getCompanyLogo.bind(this);
  }

  /**
   * updateFetchLifecycle
   */

  updateFetchLifecycle(
    isRetrievingImage,
    isRetrievingImageSuccess,
    isRetrievingImageFailure,
    image
  ) {
    this.setState({
      ...this.state,
      isRetrievingImage,
      isRetrievingImageSuccess,
      isRetrievingImageFailure,
      image
    });
  }

  /**
   * getCompanyLogo
   *
   * @desc Attempt to get the company logo using the ClearBit API endpoint.
   * @param {String} new company name - this is used when we change from one
   * company to another; we can't access the logo in props.companyName because
   * the change hasn't propogated yet.
   */

  async getCompanyLogo(newCompanyName) {
    let logo;
    let companyName = newCompanyName ? newCompanyName : this.props.companyName;

    /**
     * If the company name exists, then we'll attempt
     * to get the company logo.
     */

    if (!!companyName) {
      // Getting logo
      this.updateFetchLifecycle(true, false, false, null);

      try {
        let response = await axios.get(
          `https://autocomplete.clearbit.com/v1/companies/suggest?query=${stripChars(
            companyName
          )}`
        );

        /**
         * Getting logo success
         */

        if (response.data.length !== 0) {
          logo = response.data[0].logo;
          return this.updateFetchLifecycle(false, true, false, logo);
        }
      } catch (err) {
        console.log(err);
      }

      /**
       * Getting logo failure
       */

      return this.updateFetchLifecycle(false, false, true, null);
    }
  }

  /**
   * componentDidMount
   *
   * On initial component will mount, we want to attempt to
   * look for the new company logo url.
   */

  componentDidMount() {
    this.getCompanyLogo();
  }

  /**
   * componentWillReceiveProps
   *
   * When the company name changes (it may have came back async
   * from an API call), then we want to retrigger looking for
   * a clearbit logo.
   */

  componentWillReceiveProps(nextProps) {
    if (this.props.companyName !== nextProps.companyName) {
      console.log(
        "company name changed!!!!",
        this.props.companyName,
        nextProps.companyName
      );
      this.getCompanyLogo(nextProps.companyName);
    }
  }

  render() {
    return (
      <div>
        {this.state.isRetrievingImage ? (
          <ClipLoader color={"#53a7d8"} loading={true} />
        ) : !!this.state.image ? (
          <img src={this.state.image} />
        ) : (
          <img src={company} />
        )}
      </div>
    );
  }
}

ClearbitLogo.propTypes = {
  companyName: PropTypes.string
};
