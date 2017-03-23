import * as React from 'react';

interface IButtonProps {
  icon?: string;
  className: string;
  text: string;
  clickHandler: () => void;
}

const Button = (props: IButtonProps) => {
  const icon = props.icon
    ? <i className="material-icons">{props.icon}</i>
    : null;

  return (
    <button className={props.className} onClick={props.clickHandler}>
      {props.text}
      {icon}
    </button>
  );
};

export default Button;
