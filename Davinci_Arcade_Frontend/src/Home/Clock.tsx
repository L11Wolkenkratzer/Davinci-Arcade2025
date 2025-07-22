import React, { useState, useEffect, memo } from 'react';

const Clock: React.FC = memo(() => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    let lastTimeString = '';
    
    const updateTime = () => {
      const now = new Date();
      const newTimeString = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      
      // Only update state if time actually changed (prevent unnecessary re-renders)
      if (newTimeString !== lastTimeString) {
        lastTimeString = newTimeString;
        setTime(newTimeString);
      }
    };
    
    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  return <p className="clock">{time}</p>;
});

Clock.displayName = 'Clock';

export default Clock; 