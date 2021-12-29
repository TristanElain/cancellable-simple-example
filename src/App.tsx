import React, { useState } from "react";

/**** TYPES DECLARATIONS ****/
type CancellableFn<T extends any[], R = never> = [R] extends [never]
  ? (...args: T) => CancelFn
  : (...args: T) => [CancelFn, R];

type CancelFn = () => void;

/**** Utilities ****/
function wrapCancellable<Args extends any[], R = never>(
  cancellable: CancellableFn<Args, R>
): (...args: Args) => [R] extends [never] ? void : R;
function wrapCancellable<Args extends any[], R>(
  cancellable: CancellableFn<Args, R>
) {
  let lastCancel: CancelFn;
  return (...args: Args) => {
    let returnValue: R | undefined;
    if (lastCancel) lastCancel();
    const ret = cancellable(...args);
    if (ret instanceof Array) {
      [lastCancel, returnValue] = ret;
    } else {
      lastCancel = ret;
    }

    return returnValue;
  };
}

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

const showInputWrapped = wrapCancellable(showInputCancellable);

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
  
  const handleChangeWrapped = (value: string) => {
    showInputWrapped(value);
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
      <br />
      <label htmlFor="asyncChangesWrapped">Wrapped</label>
      <input
        id="asyncChangesWrapped"
        type="text"
        onChange={(event) => handleChangeWrapped(event.target.value)}
      />
    </>
  );
}
