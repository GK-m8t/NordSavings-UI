import React, { Component } from "react";
import Countdown from "react-countdown";
import PropTypes from "prop-types";

class CountdownTimer extends Component {
  constructor(props) {
    super(props);
    this.props = {};
  }

  displayUnboundingTimeRemaining = ({
    days,
    hours,
    minutes,
    seconds,
    completed,
  }) => {
    if (completed) {
      return (
        <p className="text-primary dark:text-primary">
          You can claim your stake now
        </p>
      );
    } else {
      return (
        <p className="text-primary dark:text-primary">
          {"You can claim in " +
            (days ? days + " day" + (days === 1 ? " " : "s ") : "") +
            (hours ? hours + " hour" + (hours === 1 ? " " : "s ") : "") +
            (minutes
              ? minutes + " minute" + (minutes === 1 ? " " : "s ")
              : "") +
            (seconds ? seconds + " second" + (seconds === 1 ? "" : "s") : "")}
        </p>
      );
    }
  };

  render() {
    return (
      <>
        <Countdown
          date={Number(this.props.unstakeTimeRemaining) * 1000}
          renderer={this.displayUnboundingTimeRemaining}
        />
      </>
    );
  }
}

CountdownTimer.propTypes = {
  unstakeTimeRemaining: PropTypes.string.isRequired,
};
export default CountdownTimer;
