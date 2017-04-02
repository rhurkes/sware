import * as React from 'react';
import { IRouteMapping } from '../../pages/routes';
import ChromeComponent from '../chrome/chromeComponent';
import EventsProcessorContainer from '../eventsManager/eventsManagerContainer';
import audio from '../../utility/audio';
import swareConfig from '../../config/swareConfig';
import configHelper from '../../config/configHelper';
import geolocation from '../../utility/geolocation';

const timers = {
  geolocation: null,
};

export interface IAppProps {
  children: any;
  location: any;
  routeMappings: IRouteMapping[];
  sidebarOpen: boolean;
  audioQueue: any;
  router: any;
  popAudioQueue: () => void;
  toggleSidebarOpen: (open: boolean) => void;
  updateGeolocation: (geolocation: Coordinates) => void;
}

export default class App extends React.Component<IAppProps, undefined> {
  constructor(props) {
    super(props);

    this.appInitTasks();

    // Event Bindings
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  public componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown);
    this.getGeolocation();

    if (swareConfig.speech.PLAY_INTRO) {
      audio.speak([ swareConfig.utterances.INTRO ]);
    }
  }

  public componentWillUnmount() {
    Object.keys(timers).forEach(key => clearTimeout(timers[key]));
  }

  public render() {
    /* This component is for ubiquitous DOM logic and scheduling of async events only -
      rendered elements should appear in the Chrome component */
    const { children, location, routeMappings, sidebarOpen, toggleSidebarOpen } = this.props;

    return (
      <div>
        <EventsProcessorContainer />
        <ChromeComponent
          children={children}
          location={location}
          routeMappings={routeMappings}
          sidebarOpen={sidebarOpen}
          toggleSidebarOpen={toggleSidebarOpen}
        />
      </div>
    );
  }

  private getGeolocation() {
    geolocation.getCurrentLocation()
      .then((data: Coordinates) => {
        this.props.updateGeolocation(data);
        timers.geolocation = setTimeout(() => this.getGeolocation(),
          swareConfig.geolocation.UPDATE_INTERVAL_MS);
      })
      .catch(err => {
        console.error(err);
      });
  }

  private handleKeydown(e) {
    // const { pathname } = this.props.location;
    /*console.log(`keydown: ${e.which}`);
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
      default: break;
    }*/
  }

  private appInitTasks() {
    configHelper.validateLocalConfig();
  }
}
