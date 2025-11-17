import React from "react";

interface NotificationProps {
  emoji: string;
  x: number;
  y: number;
}

const Notification: React.FC<NotificationProps> = ({ emoji, x, y }) => {
  return (
    <div
      className="notification"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <div className="notification-content">
        <span className="notification-emoji">{emoji}</span>
        <span className="notification-text">うるせぇ！</span>
      </div>
    </div>
  );
};

export default Notification;
