import React from 'react';

const ToastNotification = ({ toast, onClose }) => {
  if (!toast.show) return null;

  return (
    <div
      className={`alert alert-${toast.type === 'error' ? 'danger' : toast.type} alert-dismissible fade show position-fixed`}
      style={{ top: '20px', right: '20px', zIndex: 9999, minWidth: '300px' }}
    >
      {toast.message}
      <button
        type="button"
        className="btn-close"
        onClick={onClose}
      ></button>
    </div>
  );
};

export default ToastNotification;