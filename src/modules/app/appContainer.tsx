import { connect, MergeProps } from 'react-redux';
import AppComponent from './appComponent';
import { routeMappings, RouteMapping } from '../../pages/routes';
import {
  toggleSidebarOpen, getSidebarOpen, getGeolocation, updateGeolocation, getAudioQueue,
  popAudioQueue, getUserConfig,
} from './appDuck';

const mapStateToProps = (state: any, ownProps) => ({
  audioQueue: getAudioQueue(state),
  sidebarOpen: getSidebarOpen(state),
  geolocation: getGeolocation(state),
  userConfig: getUserConfig(state),
});

const mergeProps = (stateProps, dispatchProps, ownProps): MergeProps<{}, {}, RouteMapping[]> => {
  return Object.assign({}, ownProps, stateProps, dispatchProps, { routeMappings });
};

const AppContainer = connect(
  mapStateToProps,
  { toggleSidebarOpen, updateGeolocation, popAudioQueue },
  mergeProps,
)(AppComponent);

export default AppContainer;
