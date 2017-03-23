import * as React from 'react';
import Button from './button';

interface ICardProps {
  className?: string;
  tabFunction?: () => void;
  title: string;
  children?: React.ReactNode;
}

const Card = (props: ICardProps) => {
  const classes = (props.className || '').concat(' card');
  const titleElement = props.tabFunction
    ? <Button className="tab" text={props.title} clickHandler={props.tabFunction} />
    : <h2>{props.title}</h2>;

  return (
    <div className={classes}>
      {titleElement}
      {props.children}
    </div>
  );
};

export default Card;
