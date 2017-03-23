import { connect } from 'react-redux';
import HomeComponent from './homeComponent';
import { getGeolocation, getNetworkStats } from '../../modules/app/appDuck';

const mapStateToProps = state => ({
  geolocation: getGeolocation(state),
  networkStats: getNetworkStats(state),
});

const HomeContainer = connect(
  mapStateToProps,
)(HomeComponent);

export default HomeContainer;
