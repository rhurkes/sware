import * as React from 'react';
import Button from '../../shared-components/button';
import Card from '../../shared-components/card';
import Geolocation from '../../shared-components/geolocation';
import NetworkComponent from './networkComponent';
import swareConfig from '../../config/swareConfig'
import { INetworkStats } from '../../middleware/fetchMiddlewareModel';

interface IHomeComponentProps {
  geolocation: Coordinates;
  networkStats: INetworkStats;
  currentMinute: number;
  updateImages: () => void;
}

const getCurrentMinute = () => new Date(new Date().setMinutes(0)).getTime();

class HomeComponent extends React.Component<IHomeComponentProps, { currentMinute: number }> {
  imageTimer;

  constructor() {
    super();
    this.state = { currentMinute: getCurrentMinute() };
  }

  componentDidMount() {
    this.imageTimer = setInterval(() => {
      this.setState({ currentMinute: getCurrentMinute() });
    }, swareConfig.home.HOME_IMAGE_REFRESH_MS);
  }

  componentWillUnmount() {
    clearTimeout(this.imageTimer);
  }

  render() {
    const { networkStats, geolocation } = this.props;
    const mdURL = `http://www.spc.noaa.gov/products/md/validmd.png?${this.state.currentMinute}`;
    const wwURL = `http://www.spc.noaa.gov/products/watch/validww.png?${this.state.currentMinute}`;

    return (
      <div className="page">
        <Card title="Network">
          <NetworkComponent networkStats={networkStats} />
        </Card>
        <Card title="Geolocation">
          <Geolocation geolocation={geolocation}/>
        </Card>
        <Card title="Active Data"></Card>
        <Card title="Weather">
          <img src={mdURL} />
          <img src={wwURL} />
        </Card>
      </div>
    );
  }
}

export default HomeComponent;
