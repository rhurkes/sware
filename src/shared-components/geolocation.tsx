import * as React from 'react';

interface IGeolocationProps {
  geolocation: Coordinates;
}

// http://stackoverflow.com/questions/4187146/display-two-decimal-places-no-rounding
const formatDegrees = (value: number) => {
  return `${value.toFixed(4)}°`;
};

const Geolocation = (props: IGeolocationProps) => {
  const { accuracy, latitude, longitude } = props.geolocation;
  const safeAccuracy = accuracy ? `${accuracy}m` : 'N/A';
  const safeLatitude = latitude ? formatDegrees(latitude) : 'N/A';
  const safeLongitude = longitude ? formatDegrees(longitude) : 'N/A';

  return (
    <ol>
      <li>Accuracy: {safeAccuracy}</li>
      <li>Latitude: {safeLatitude}</li>
      <li>Longitude: {safeLongitude}</li>
    </ol>
  );
};

export default Geolocation;
