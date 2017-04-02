import * as React from 'react';
import Toggle from '../../shared-components/toggle';
import MenuList from '../../shared-components/menuList';

interface IGOES16ConfigComponentProps {
  configHash: number;
  userConfig: any;
  updateUserConfig: (path: string, value: string | number | boolean) => void;
}

const GOES16ConfigComponent = (props: any): JSX.Element => {
  const { userConfig, updateUserConfig } = props;

  return (<MenuList config={userConfig} updateConfig={updateUserConfig} />);
};

export default GOES16ConfigComponent;
