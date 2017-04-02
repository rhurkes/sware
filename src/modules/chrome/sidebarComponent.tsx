import * as React from 'react';
import { Link } from 'react-router';
import Icon from '../../shared-components/icon';
import { IRouteMapping } from '../../pages/routes';

interface ISidebarComponentProps {
  routeMappings: IRouteMapping[];
  isOpen: boolean;
  routeChangeAction: (open: boolean) => void;
}

const SidebarComponent = (props: ISidebarComponentProps) => {
  const { isOpen, routeMappings, routeChangeAction } = props;
  const classes = isOpen ? 'open' : '';

  const navItemComponents = routeMappings.map((routeMapping, index) => {
    if (routeMapping.showInNav) {
      const iconElement = routeMapping.navIcon
        ? <Icon icon={routeMapping.navIcon} />
        : null;

      return (
        <li key={index}>
          <Link onClick={() => routeChangeAction(false)} to={routeMapping.route}>
            {iconElement}
            {routeMapping.navText}
          </Link>
        </li>
      );
    }
  });

  return (
    <div id="sidebar" className={classes}>
      <div id="sidebar-logo">
        <div>!@#$% (sware)</div>
      </div>
      <nav>
        <ol>{navItemComponents}</ol>
      </nav>
    </div>
  );
};

export default SidebarComponent;
