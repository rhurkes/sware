import * as React from 'react';
import LineComponent from './lineComponent';
import swareConfig from '../../config/swareConfig';
import { WxEvent } from './eventsModels';
import { equals } from 'ramda';
import { IFetchAPIAction } from '../../middleware/fetchMiddlewareModel';

interface IEventsComponentProps {
  userConfig: any;
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
    const { fetching, fetchEvents, lastIEMSequence, updateEventsTimeAgo, pollingTimer } = this.props;

    this.eventsTimer = setInterval(() => {
      updateEventsTimeAgo();
    }, swareConfig.events.UPDATE_TIMEAGO_INTERVAL_MS);

    // pollingTimer check is important to prevent this from firing every time you change routes
    if (fetching && !pollingTimer) {
      fetchEvents(lastIEMSequence);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equals(nextProps.filteredNewEvents, this.props.filteredNewEvents)) {
      this.props.triggerIyaProcessing(nextProps.filteredNewEvents);
    }
  }

  shouldComponentUpdate(prevProps, nextState) {
    /* We'll assume we always want to render on new props, except the scenario where the
      new props are events, and the events require filtering. This prevents events from
      being rendered, then filtered, and then potentially disappearing in the re-render. */
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
    clearInterval(this.eventsTimer);
  }

  render() {
    const { location, filteredEvents, userConfig } = this.props;
    const children: any = this.props.children;
    const configPathname = '/events/config';
    // TODO can I replace this?
    /*const childrenWithConfig = children
      ? React.cloneElement(children, { userConfig })
      : null;*/
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
