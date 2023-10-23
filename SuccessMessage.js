import React from "react";

function SuccessMessage({ message, onClose }) {
  return (
    <div className="success-message">
      <p>{message}</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
}

export default SuccessMessage;
