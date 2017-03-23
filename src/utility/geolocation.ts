const getCurrentLocation = (): Promise<Coordinates> => {
  const options = { enableHighAccuracy: true };

  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        resolve(position.coords);
      }, null, options);
    } else {
      reject('navigator.geolocation not available');
    }
  });
};

export default {
  getCurrentLocation,
}
