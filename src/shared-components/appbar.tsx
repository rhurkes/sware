import * as React from 'react';
import { Link } from 'react-router';
import Icon from './icon';
import Clock from './clock';
import Geolocation from './geolocation';
import routes from '../pages/routes';
import { IconType } from '../pages/routes';

interface IAppbarProps {
  location: any;
  menuClickHandler: () => void;
}

export const Appbar = (props: IAppbarProps) => {
  const { location, menuClickHandler } = props;
  const title = routes.getTitleFromPath(location.pathname);
  const contextIcon = routes.getContextIconFromPath(location.pathname);

  return (
    <header>
      <div className="appbar-left">
        <Icon clickHandler={menuClickHandler} icon="menu" />
        <h1 className="text-truncate">{title}</h1>
      </div>
      <div className="appbar-right">
        <Clock />
        <Link to={contextIcon.route}>
          <Icon icon={contextIcon.icon} />
        </Link>
      </div>
    </header>
  );
};

export default Appbar;
