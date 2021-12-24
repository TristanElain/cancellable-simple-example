import React, { useState } from "react";

/**** TYPES DECLARATIONS ****/
type CancellableFn<T extends any[], R = never> = [R] extends [never]
  ? (...args: T) => CancelFn
  : (...args: T) => [CancelFn, R];

type CancelFn = () => void;

/**** FUNCTIONS ****/
const showInput = (value: string) => {
  alert(value);
};

const showInputCancellable: CancellableFn<[string]> = (value: string) => {
  console.log("cancellable called", value);
  const timeout = setTimeout(() => {
    alert(`cancellable: ${value}`);
  }, 500);
  return () => {
    console.log("cancellable cancelled", value);
    clearTimeout(timeout);
  };
};

/**** COMPONENT ****/
export default function App() {
  const [cancelLastShow, setCancelLastShow] = useState<CancelFn>();
  const handleChange = (value: string) => {
    showInput(value);
  };

  const handleChangeCancellable = (value: string) => {
    if (cancelLastShow) cancelLastShow();
    const cancelOperation = showInputCancellable(value);
    setCancelLastShow(() => cancelOperation);
  };

  return (
    <>
      <label htmlFor="syncChanges">Sync</label>
      <input
        id="syncChanges"
        type="text"
        onChange={(event) => handleChange(event.target.value)}
      />
      <br />
      <label htmlFor="asyncChanges">Cancellable</label>
      <input
        id="asyncChanges"
        type="text"
        onChange={(event) => handleChangeCancellable(event.target.value)}
      />
    </>
  );
}
