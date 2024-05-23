import { useState, FC } from 'react';

interface ModalProps {
  onSave: (botName: string) => void;
}

const Modal: FC<ModalProps> = ({ onSave }) => {
  const [botName, setBotName] = useState<string>('');

  const handleSave = () => {
    onSave(botName);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <span>Name Path</span>
        </div>
        <input className='modal-input' type="text" value={botName} onChange={e => setBotName(e.target.value)} placeholder="Enter bot name" />
        <button className='modal-button' onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};

export default Modal;
