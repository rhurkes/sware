import * as React from 'react';
import Toggle from '../../shared-components/toggle';
import MenuList from '../../shared-components/menuList';

interface IEventsConfigComponentProps {
  configHash: number;
  eventsUserConfig: any;
  updateEventsUserConfig: (path: string, value: string | number | boolean) => void;
}

const EventsConfigComponent = (props: IEventsConfigComponentProps): JSX.Element => {
  const { eventsUserConfig, updateEventsUserConfig } = props;

  return (<MenuList config={eventsUserConfig} updateConfig={updateEventsUserConfig} />);
};

export default EventsConfigComponent;
