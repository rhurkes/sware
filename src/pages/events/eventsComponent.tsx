import * as React from 'react';
import LineComponent from './lineComponent';
import swareConfig from '../../config/swareConfig';
import { WxEvent } from './eventsModels';
import { equals } from 'ramda';
import { IFetchAPIAction } from '../../middleware/fetchMiddlewareModel';

interface IEventsComponentProps {
  eventsUserConfig: any;
  fetching: boolean;
  filteredEvents: WxEvent[];
  filteredNewEvents: WxEvent[];
  lastIEMSequence: number;
  pollingTimer: number;
  location: any;
  requiresFilterEvents: boolean;
  fetchEvents: (x: number) => IFetchAPIAction;
  updateEventsTimeAgo: () => void;
  triggerFilterEvents: (x: WxEvent[]) => void;
  triggerIyaProcessing: (x: WxEvent[]) => void;
}

class EventsComponent extends React.Component<IEventsComponentProps, {}> {
  eventsTimer;

  componentDidMount() {
    const { fetching, fetchEvents, lastIEMSequence, updateEventsTimeAgo } = this.props;

    this.eventsTimer = setInterval(() => {
      updateEventsTimeAgo();
    }, swareConfig.events.UPDATE_TIMEAGO_INTERVAL_MS);

    if (fetching) {
      fetchEvents(lastIEMSequence);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equals(nextProps.filteredNewEvents, this.props.filteredNewEvents)) {
      this.props.triggerIyaProcessing(nextProps.filteredNewEvents);
    }
  }

  shouldComponentUpdate(prevProps, nextState) {
    if (prevProps.requiresFilterEvents) {
      this.props.triggerFilterEvents(this.props.filteredEvents);

      return false;
    }

    return true;
  }

  componentDidUpdate(prevProps) {
    const { fetching, fetchEvents, lastIEMSequence, pollingTimer } = this.props;

    if (fetching && !prevProps.fetching) {
      fetchEvents(lastIEMSequence);
    } else if (!fetching && prevProps.fetching) {
      clearTimeout(pollingTimer);
    }
  }

  componentWillUnount() {
    clearTimeout(this.props.pollingTimer);
    clearInterval(this.eventsTimer);
  }

  render() {
    const { location, filteredEvents, eventsUserConfig } = this.props;
    const children: any = this.props.children;
    const configPathname = '/events/config';
    const childrenWithConfig = children
      ? React.cloneElement(children, { eventsUserConfig })
      : null;
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
        {childrenWithConfig}
        {eventsList}
      </div>
    );
  }
}

export default EventsComponent;
