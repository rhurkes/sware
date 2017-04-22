import { connect } from 'react-redux';
import GOES16Component from './goes16Component';
import { getGOES16UserConfig, fetchImageData, getImageData } from './goes16Duck';

const mapStateToProps = (state: any) => {
  const userConfig = getGOES16UserConfig(state);
  const imageData = getImageData(state);
  let imageURLs = imageData.imageURLs.slice();
  imageURLs.reverse();
  imageURLs = imageURLs.slice(0, userConfig.get('frames'));
  imageURLs.reverse();

  return ({
    userConfig,
    imageURLs,
    fetching: userConfig.get('fetching'),
  });
};

export default connect(
  mapStateToProps,
  { fetchImageData },
)(GOES16Component);
