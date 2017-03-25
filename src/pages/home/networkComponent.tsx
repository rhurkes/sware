import * as React from 'react';
import { INetworkStats } from '../../middleware/fetchMiddlewareModel';

interface INetworkComponentProps {
  networkStats: INetworkStats;
}

const NetworkComponent = (props: INetworkComponentProps) => {
  const { min, max, avg, count, errors, errorPercent } = props.networkStats;

  return (
    <ol>
      <li>
        <div>Latency (ms):</div>
        <div>{`${min} min, ${avg} avg, ${max} max`}</div>
      </li>
      <li>
        <div>Errors/Requests:</div>
        <div>{errors}/{count} ({errorPercent.toFixed(0)}%)</div>
      </li>
    </ol>
  );
};

export default NetworkComponent;
