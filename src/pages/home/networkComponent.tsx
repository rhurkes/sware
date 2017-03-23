import * as React from 'react';
import { INetworkStats } from '../../middleware/fetchMiddlewareModel';

interface INetworkComponentProps {
  networkStats: INetworkStats;
}

const NetworkComponent = (props: INetworkComponentProps) => {
  const { min, max, avg, count, errors, errorPercent } = props.networkStats;

  return (
    <ol>
      <li>Min/avg/max: {`${min}/${avg}/${max}`}</li>
      <li>Count: {count}</li>
      <li>Errors: {errors} ({errorPercent.toFixed(0)}%)</li>
    </ol>
  );
};

export default NetworkComponent;
