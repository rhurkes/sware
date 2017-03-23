import * as React from 'react';
import datetimeHelper from '../utility/datetimeHelper';

const updateTick = 1000;

export default class Clock extends React.Component<any, any> {
  timerReference: number;

  constructor() {
    super();
    this.state = {
      time: datetimeHelper.timestamp(),
    };
  }

  componentDidMount() {
    this.timerReference = setInterval(() => {
      this.setState({ time: datetimeHelper.timestamp() });
    }, updateTick);
  }

  componentWillUnmount() {
    clearInterval(this.timerReference);
  }

  render() {
    return (<div id="clock">{this.state.time}</div>);
  }
}
