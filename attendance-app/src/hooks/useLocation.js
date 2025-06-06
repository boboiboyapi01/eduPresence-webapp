import { useState, useEffect } from 'react';

export const useLocation = () => {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
        },
        (err) => {
          console.error('Error getting location:', err);
        }
      );
    }
  }, []);

  return { position };
};