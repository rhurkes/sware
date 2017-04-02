import * as React from 'react';

interface IToggleProps {
  id: string;
  checked?: boolean;
  changeHandler: () => void;
}

// TODO generate id if none passed

const Toggle: React.StatelessComponent<any> = (props: IToggleProps) => {
  const { id, checked, changeHandler } = props;

  return (
    <div className="toggle">
      <input type="checkbox" id={id} checked={checked} onChange={changeHandler} />
      <label htmlFor={id} />
    </div>
  );
}

export default Toggle;
