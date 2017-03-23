// TODO move somewhere better
export const IconType = {
  Config: 'settings' as 'settings',
  Back: 'arrow_back' as 'arrow_back',
  Home: 'home' as 'home',
  Events: 'event_note' as 'event_note',
};

export interface RouteMapping {
  route: string;
  title: string;
  navText?: string;
  navIcon?: string;
  showInNav?: boolean;
  contextIcon?: string;
  contextIconRoute?: string;
}

export const routeMappings: Array<RouteMapping> = [
  { route: '/', title: 'Home', navText: 'Home', navIcon: IconType.Home, showInNav: true },
  { route: '/events', title: 'Events', navText: 'Events', navIcon: IconType.Events, showInNav: true, contextIcon: IconType.Config, contextIconRoute: '/events/config' },
  { route: '/events/config', title: 'Events Config', contextIcon: IconType.Back, contextIconRoute: '/events' },
];

const getTitleFromPath = (path) => {
  const mappedPath = routeMappings.find(x => x.route === path);

  return mappedPath ? mappedPath.title : '';
};

const getContextIconFromPath = path => {
  const mappedPath = routeMappings.find(x => x.route === path);

  return {
    icon: mappedPath.contextIcon,
    route: mappedPath.contextIconRoute,
  }
};

export default {
  getTitleFromPath,
  getContextIconFromPath,
}