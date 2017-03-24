import * as React from 'react';
import Toggle from '../../shared-components/toggle';
import MenuList from '../../shared-components/menuList';

interface IEventsConfigComponentProps {
  configHash: number;
  userConfig: any;
  updateUserConfig: (path: string, value: string | number | boolean) => void;
}

const EventsConfigComponent = (props: any): JSX.Element => {
  const { userConfig, updateUserConfig } = props;

  return (<MenuList config={userConfig} updateConfig={updateUserConfig} />);
};

export default EventsConfigComponent;
