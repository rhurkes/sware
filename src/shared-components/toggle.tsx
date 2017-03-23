import * as React from 'react';

interface ToggleProps {
  id: string;
  checked?: boolean;
  changeHandler: () => void;
}

// TODO generate id if none passed

const Toggle: React.StatelessComponent<any> = (props: ToggleProps) => {
  const { id, checked, changeHandler } = props;

  return (
    <div className="toggle">
      <input type="checkbox" id={id} checked={checked} onChange={changeHandler} />
      <label htmlFor={id}></label>    
    </div>
  );
}

export default Toggle;
