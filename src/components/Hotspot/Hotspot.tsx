import React, { useState } from 'react';
import './Hotspot.css';

interface HotspotProps {
  message: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  onClose?: () => void;
}

const Hotspot: React.FC<HotspotProps> = ({ 
  message, 
  position = 'bottom',
  onClose 
}) => {
  const [isTooltipVisible, setTooltipVisible] = useState(false);

  return (
    <div className="hotspot-container">
      <div 
        className="hotspot-pulse"
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
        onClick={() => {
          if (onClose) onClose();
        }}
      />
      {isTooltipVisible && (
        <div className={`hotspot-tooltip hotspot-tooltip-${position}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default Hotspot;