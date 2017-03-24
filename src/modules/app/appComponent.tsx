import * as React from 'react';
import { RouteMapping } from '../../pages/routes';
import ChromeComponent from '../chrome/chromeComponent';
import audio, { AudioType } from '../../utility/audio';
import swareConfig from '../../config/swareConfig';
import geolocation from '../../utility/geolocation';

const timers = {
  geolocation: null,
};

export interface IAppProps {
  children: any;
  location: any;
  routeMappings: Array<RouteMapping>;
  sidebarOpen: boolean;
  audioQueue: any;
  popAudioQueue: () => void;
  toggleSidebarOpen: (open: boolean) => void;
  updateGeolocation: (geolocation: Coordinates) => void;
}

export default class App extends React.Component<any, undefined> {
  constructor(props) {
    super(props);
    
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  componentDidMount() {
    const { router } = this.props;

    document.addEventListener('keydown', this.handleKeydown);
    this.getGeolocation();

    if (swareConfig.speech.PLAY_INTRO) {
      audio.speak([swareConfig.utterances.INTRO]);
    }
  }

  componentWillUnmount() {
    Object.keys(timers).forEach(key => clearTimeout(timers[key]));
  }

  getGeolocation() {
    geolocation.getCurrentLocation()
      .then((data: Coordinates) => {
        this.props.updateGeolocation(data);
        timers.geolocation = setTimeout(() => this.getGeolocation(),
          swareConfig.geolocation.UPDATE_INTERVAL_MS);
      })
      .catch();
  }

  handleKeydown(e) {
    // const { pathname } = this.props.location;
    console.log(`keydown: ${e.which}`);
    switch (e.which) {
      case 219:
        // move preventdefault into move functions
        e.preventDefault();
        //movePrevPage(pathname);
        break;
      case 221: {
        e.preventDefault();
        //moveNextPage(pathname);
        break;
      }
      default:
        break;
    }
  }

  render() {
    /* This component is for ubiquitous DOM logic and scheduling of async events only -
      rendered elements should appear in the Chrome component */
    const { children, userConfig, location, routeMappings, sidebarOpen, toggleSidebarOpen } = this.props;
    const childrenWithConfig = React.cloneElement(children, { userConfig });

    return (
      <ChromeComponent
        children={childrenWithConfig}
        location={location}
        routeMappings={routeMappings}
        sidebarOpen={sidebarOpen}
        toggleSidebarOpen={toggleSidebarOpen}
      />
    );
  }
}
