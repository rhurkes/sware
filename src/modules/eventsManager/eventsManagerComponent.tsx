import * as React from 'react';
import { equals } from 'ramda';

class EventsProcessorComponent extends React.Component<any, {}> {
  public componentDidMount() {
    const { fetching, fetchEvents, lastIEMSequence } = this.props;

    if (fetching) {
      fetchEvents(lastIEMSequence);
    }
  }

  public componentWillReceiveProps(nextProps) {
    if (!equals(nextProps.filteredNewEvents, this.props.filteredNewEvents)) {
      this.props.triggerIyaProcessing(nextProps.filteredNewEvents);
    }
  }

  public componentDidUpdate(prevProps) {
    const { fetching, fetchEvents, lastIEMSequence, pollingTimer } = this.props;

    if (fetching && !prevProps.fetching) {
      fetchEvents(lastIEMSequence);
    } else if (!fetching && prevProps.fetching) {
      clearTimeout(pollingTimer);
    }
  }

  public render() {
    return null;
  }
}

export default EventsProcessorComponent;
