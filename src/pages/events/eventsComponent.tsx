import * as React from 'react';
import LineComponent from './lineComponent';
import swareConfig from '../../config/swareConfig';
import { IWxEvent } from './eventsModels';
import { IFetchAPIAction } from '../../middleware/fetchMiddlewareModel';

interface IEventsComponentProps {
  userConfig: any;
  fetching: boolean;
  filteredEvents: IWxEvent[];
  filteredNewEvents: IWxEvent[];
  lastIEMSequence: number;
  pollingTimer: number;
  location: any;
  requiresFilterEvents: boolean;
  fetchEvents: (x: number) => IFetchAPIAction;
  updateEventsTimeAgo: () => void;
  triggerFilterEvents: (x: IWxEvent[]) => void;
  triggerIyaProcessing: (x: IWxEvent[]) => void;
}

class EventsComponent extends React.Component<IEventsComponentProps, {}> {
  private eventsTimer;

  public componentDidMount() {
    this.eventsTimer = setInterval(() => {
      this.props.updateEventsTimeAgo();
    }, swareConfig.events.UPDATE_TIMEAGO_INTERVAL_MS);
  }

  public componentWillUnount() {
    clearInterval(this.eventsTimer);
  }

  public render() {
    const { location, filteredEvents } = this.props;
    const children: any = this.props.children;
    const configPathname = '/events/config';
    let eventsList;

    // Only render events if not on the config
    if (location.pathname !== configPathname) {
      const lines = filteredEvents.map((event, index) => (
        <LineComponent key={index} event={event} />
      ));

      eventsList = (<ol id="events">{lines}</ol>);
    }

    return (
      <div className="page">
        {children}
        {eventsList}
      </div>
    );
  }
}

export default EventsComponent;
