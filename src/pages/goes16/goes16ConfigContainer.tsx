import { connect } from 'react-redux';
import EventsConfigComponent from './goes16ConfigComponent';
import { getGOES16UserConfig, updateUserConfig } from './goes16Duck';
import textHelper from '../../utility/textHelper';

const mapStateToProps = (state: any) => {
  // Needed to force update: https://github.com/reactjs/redux/issues/585
  // TODO set an updated value that happens in reducer instead of this expensive computation
  const userConfig = getGOES16UserConfig(state);
  return ({
    userConfig,
    configHash: textHelper.getHashCode(userConfig),
  });
};

export default connect(
  mapStateToProps,
  { updateUserConfig },
)(EventsConfigComponent);
