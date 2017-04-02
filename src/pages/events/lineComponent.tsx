import * as React from 'react';
import { IWxEvent } from './eventsModels';
import swareConfig from '../../config/swareConfig';

interface ILineComponentProps {
  event: IWxEvent;
}

const LineComponent = (props: ILineComponentProps) => {
  const { source, timeAgo, details, message } = props.event;
  const { code, text, link, wfo } = details;
  const dataMessage = swareConfig.app.DEVELOPMENT_MODE ? JSON.stringify(message) : null;
  const lineIcon = (<div className="line-icon ">{code}</div>);
  let classes = code;

  if (details.metaCode) {
    classes = classes.concat(` ${details.metaCode}`);
  }

  if (details.important) {
    classes = classes.concat(' important');
  }

  return (
    <li className={classes} data-message={dataMessage}>
      <div className="line-left">
        {lineIcon}
        <div className="line-body">
          <span className="line-text">{text}</span>
          <span className="line-source">[
            <span>{wfo}/</span>
            <a
              rel="noopener noreferrer"
              target="_blank"
              href={link}
            >
              {source}
            </a>]
          </span>
        </div>
      </div>
      <div className="line-right">
        <div className="line-timeago">{timeAgo}</div>
      </div>
    </li>
  );
};

export default LineComponent;
