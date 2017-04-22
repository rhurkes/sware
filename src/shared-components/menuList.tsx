import * as React from 'react';
import Toggle from './toggle';

interface IMenuListItem {
  icon?: string;
  text: string;
  value: boolean;
}

interface IMenuListProps {
  text?: string;
  config: any;
  updateConfig: (path: string, value: string | number | boolean, key?: string) => void;
}

function getSettingControl(setting, updateConfig) {
  const { __value, children, __path, __options, __open } = setting;

  if (typeof children === 'object' && Object.keys(children).length) {
    return <span className="menu-expand">{__open ? '-' : '+'}</span>;
  }

  if (typeof __value === 'boolean') {
    return (
      <Toggle id={__path} checked={__value} changeHandler={() => updateConfig(__path.concat('|__value'), !__value)} />
    );
  } else if (__options) {
    const options = __options.map((value, index) => (<option key={index}>{value}</option>));

    return (
      <select
        value={__value}
        onChange={x => updateConfig(__path, __options[x.target.selectedIndex])}
      >
        {options}
      </select>
    );
  }

  return null;
}

function buildMenuItems(config, updateConfig, isChild?: boolean) {
  const listItems = Object.keys(config).map(key => {
    if (key.indexOf('__') === 0 || [ 'get', 'set' ].includes(key)) { return null; }

    const setting = config[key];
    const { __value, __subtext, __subtextfunc, __text, __path, __open } = setting;
    const control = getSettingControl(setting, updateConfig);
    let subtext = null;
    let children = null;
    let liClass = 'menulist-item';
    let liParentAction = null;

    if (setting.children) {
      liClass = liClass.concat(' parent');
      liParentAction = () => updateConfig(__path.concat('|__open'), !__open);
      if (__open) {
        children = buildMenuItems(setting.children, updateConfig, true);
      }
    }

    if (isChild) {
      liClass = liClass.concat(' child');
    }

    if (__subtext) {
      subtext = (<div className="subtext">{__subtext}</div>);
    } else if (__subtextfunc) {
      subtext = (<div className="subtext">{__subtextfunc(__value, config)}</div>);
    }

    return (
      <div key={key}>
        <li className={liClass} onClick={liParentAction}>
          <div>
            <div>{__text}</div>
            {subtext}
          </div>
          <div>{control}</div>
        </li>
        {children}
      </div>
    );
  });

  return (<ol className="menu-list">{listItems}</ol>);
}

const MenuList = (props: IMenuListProps) => {
  const { config, updateConfig } = props;
  const menuItems = buildMenuItems(config, updateConfig);
  return (<div>{menuItems}</div>);
};

export default MenuList;
