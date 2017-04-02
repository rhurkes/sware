import * as React from 'react';
import Appbar from '../../shared-components/appbar';
import SidebarComponent from './sidebarComponent';
import { IRouteMapping } from '../../pages/routes';

interface IChromeProps {
  children: any;
  location: any;
  routeMappings: IRouteMapping[];
  sidebarOpen: boolean;
  toggleSidebarOpen: (open?: boolean) => void;
}

const Chrome = (props: IChromeProps) => {
  const { location, routeMappings, children, sidebarOpen, toggleSidebarOpen } = props;
  const modalMaskClass = sidebarOpen ? 'open' : '';

  return (
    <div>
      <Appbar location={location} menuClickHandler={toggleSidebarOpen} />
      <SidebarComponent
        isOpen={sidebarOpen}
        routeMappings={routeMappings}
        routeChangeAction={toggleSidebarOpen}
      />
      <div id="modal-mask" className={modalMaskClass} onClick={() => toggleSidebarOpen(false)} />
      {...children}
    </div>
  );
}

export default Chrome;
