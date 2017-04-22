// TODO move somewhere better
export const IconType = {
  Config: 'settings' as 'settings',
  Back: 'arrow_back' as 'arrow_back',
  Home: 'home' as 'home',
  Events: 'event_note' as 'event_note',
  Satellite: 'public' as 'public',
};

export interface IRouteMapping {
  route: string;
  title: string;
  navText?: string;
  navIcon?: string;
  showInNav?: boolean;
  contextIcon?: string;
  contextIconRoute?: string;
}

export const routeMappings: IRouteMapping[] = [
  { route: '/', title: 'Home', navText: 'Home', navIcon: IconType.Home, showInNav: true },
  { route: '/events', title: 'Events', navText: 'Events', navIcon: IconType.Events, showInNav: true, contextIcon: IconType.Config, contextIconRoute: '/events/config' },
  { route: '/events/config', title: 'Events Config', contextIcon: IconType.Back, contextIconRoute: '/events' },
  { route: '/goes16', title: 'GOES 16 Images', navIcon: IconType.Satellite, navText: 'GOES 16 Images', showInNav: true, contextIcon: IconType.Config, contextIconRoute: '/goes16/config' },
  { route: '/goes16/config', title: 'GOES 16 Config', contextIcon: IconType.Back, contextIconRoute: '/goes16' },
];

const getTitleFromPath = path => {
  const mappedPath = routeMappings.find(x => x.route === path);

  return mappedPath ? mappedPath.title : '';
};

const getContextIconFromPath = path => {
  const mappedPath = routeMappings.find(x => x.route === path);

  return {
    icon: mappedPath.contextIcon,
    route: mappedPath.contextIconRoute,
  };
};

export default {
  getTitleFromPath,
  getContextIconFromPath,
};
