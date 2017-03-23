import * as React from 'react';

interface IIconProps {
  icon: string;
  clickHandler?: () => void;
}

const Icon = (props: IIconProps) => {
  const { icon, clickHandler } = props;
  const classes = (clickHandler ? 'clickable ' : '').concat('material-icons');

  return icon
    ? <i className={classes} onClick={clickHandler}>{icon}</i>
    : null;
};

export default Icon;
