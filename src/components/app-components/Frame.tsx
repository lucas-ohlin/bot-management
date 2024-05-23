import React from 'react';

interface FrameProps {
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
}

const Frame: React.FC<FrameProps> = ({ minimizeWindow, maximizeWindow, closeWindow }) => {
  return (
    <div className="green-frame">
      <div className="title-left">
        <p>bot-management v0.1.2</p>
      </div>
      <div className="title-right">
        <button onClick={minimizeWindow} title="Minimize" id="title-btn-1"><i className="fa-solid fa-compress"></i></button>
        <button onClick={maximizeWindow} title="Maximize" id="title-btn-2"><i className="fa-solid fa-expand"></i></button>
        <button onClick={closeWindow} title="Close" id="title-btn-3"><i className="fa-solid fa-xmark fa-lg"></i></button>
      </div>
    </div>
  );
};

export default Frame;
