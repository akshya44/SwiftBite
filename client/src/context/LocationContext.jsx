import { createContext, useState, useContext, useEffect } from 'react';

const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [address, setAddress] = useState('Fetching Location...');
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLocation = () => {
    setLoading(true);
    setError(null);
    setAddress('Locating...');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setAddress('Location unavailable');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });

        try {
          // Use OpenStreetMap Nominatim for free reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          
          if (!response.ok) throw new Error('Failed to fetch address');
          
          const data = await response.json();
          
          // Try to construct a nice short address (like Swiggy: "Home, Block, City")
          const addr = data.address;
          const shortAddress = addr.neighbourhood || addr.suburb || addr.road || addr.village || addr.city_district;
          const city = addr.city || addr.town || addr.state_district || addr.state;
          
          let displayAddress = data.display_name;
          if (shortAddress && city) {
             displayAddress = `${shortAddress}, ${city}`;
          } else if (shortAddress) {
             displayAddress = shortAddress;
          }
          
          setAddress(displayAddress || 'Unknown Location');
        } catch (err) {
          console.error('Reverse geocoding error:', err);
          setError('Failed to get address from coordinates');
          // provide a fallback based on coords
          setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError(err.message || 'Location access denied');
        setAddress('Location Access Denied');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Try fetching automatically on first load, or just show a default prompt
  // In a real app like Swiggy, we only prompt when user clicks "Locate Me" or similar.
  // For this, let's start with a generic prompt to keep UX smooth without annoying popups.
  useEffect(() => {
    const savedAddress = localStorage.getItem('swiftbite_location');
    if (savedAddress) {
       setAddress(savedAddress);
       setLoading(false);
    } else {
       setAddress('Set Location');
       setLoading(false);
    }
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (address !== 'Locating...' && address !== 'Fetching Location...' && address !== 'Set Location' && address !== 'Location Access Denied') {
      localStorage.setItem('swiftbite_location', address);
    }
  }, [address]);

  return (
    <LocationContext.Provider value={{ address, coordinates, loading, error, fetchLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
