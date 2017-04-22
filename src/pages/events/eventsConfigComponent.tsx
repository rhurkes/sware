import * as React from 'react';
import MenuList from '../../shared-components/menuList';

interface IEventsConfigComponentProps {
  configHash: number;
  userConfig: any;
  updateUserConfig: (path: string, value: string | number | boolean) => void;
}

const EventsConfigComponent = (props: any): JSX.Element => (
  <MenuList config={props.userConfig} updateConfig={props.updateUserConfig} />
);

export default EventsConfigComponent;
