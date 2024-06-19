import { useState, useEffect } from 'react';

import './NewTab.css';

export const NewTab = () => {
  const getTime = () => {
    const date = new Date();
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${hour}:${minute}`;
  };

  const [time, setTime] = useState(getTime());
  const link = 'https://github.com/guocaoyi/create-chrome-ext';

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(getTime());
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <section>
      <span></span>
      <h1>{time}</h1>
      <a href={link} target="_blank">
        generated by create-chrome-ext
      </a>
    </section>
  );
};

export default NewTab;
