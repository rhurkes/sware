import * as R from 'ramda';
import textHelper from '../utility/textHelper';
import { default as defaultUserConfig } from '../config/userConfig';

const localStorageUserConfigKey = 'userConfig';

// TODO rewrite all this to be up to date when configs are figured out!
/* NOTES ON CONFIGURATION:
  - Configs are objects that track the string, number, and boolean values that drive the
    functionality of sware. Objects are not valid values, as they denote a hierarchical
    structure.
  - Changes to configuration by users should be persisted to localStorage immediately.
    Initialization should load configuration from localStorage.
  - Exposed Configs are Configs that have a more rigid format and provide guidance on how to lay
    out the menu that controls the configuration state.
  - There used to be the concept of Configs and Menu Configs, but these were expensive to generate
    so we preferred building once then storing as state. It then became obvious that keeping them
    separate and building once was complicating things for no reason. Hence Exposed Configs that
    are pre-built. This also has the benefit of not requiring Configs and Menu Configs to match
    each other and require careful merging. We still need to generate paths automatically, which
    is where this helper is useful.
  - Exposed Config properties:
      __order: Objects in JS don't preserve order, so this numeric value can be used to
               specify order in a menu. Unordered menu items are sorted alpha by default.
      __text: This string value overrides the default that takes the key value and
              converts it from camel to regular case.
      __subtext: This string value can be used to include smaller text that accompanies the
                 primary text.
      __icon: This string value can indicate that the menu item should be rendered with the
              specified icon.
      __parent: Specifies that the menu item has children.
      TODO UPDATE THIS DOCUMENTATION AS IT IS OUT OF DATE YOU SLACKER
      __value: Matches the value of the key in the original Config
      __path: Pipe delimited string indicating how to traverse the object for state changes.
              If not present, that means you're at the root level.
  */

/**
 * Returns an exposed config for menus - decorated with paths for easy action firing,
 * text properties in case one is not specified, and parent properties for easy traversal.
 */
function decorateConfig(config, parentPath = '') {
  const decoratedConfig = Object.assign({}, config);

  // TODO this thing is really, really broken
  Object.keys(decoratedConfig).forEach((key) => {
    const configItem = decoratedConfig[key];
    const valueType = typeof configItem;
    
    if (valueType === 'object') {
      configItem.__open = false;
      configItem.__path = parentPath ? `${parentPath}|${key}` : key;
      configItem.__text = configItem.__text || textHelper.fromCamelToRegularCase(key);
      decorateConfig(configItem, configItem.__path);
    }
  });

  return decoratedConfig;
}

function saveUserConfig(userConfig) {
  const serializedUserConfig = JSON.stringify(userConfig);
  localStorage.setItem(localStorageUserConfigKey, serializedUserConfig);
}

// TODO implement this
function resetToDefaultConfig() {
  localStorage.clear();
  return defaultUserConfig;
}

// TODO write unit tests for this!
// 1. can't find localstorage item
// 2. error while parsing
// 3. configs the same
// 4. userConfig has different value
// 5. default has something userConfig doesn't have
// 6. userConfig has something default doesn't have
function getSavedUserConfig() {
  const serializedConfig = localStorage.getItem(localStorageUserConfigKey);

  if (!serializedConfig) {
    return defaultUserConfig;
  }

  // TODO TESTING
  console.log('og', defaultUserConfig);
  console.log('decorated', decorateConfig(defaultUserConfig));

  try {
    const savedConfig = JSON.parse(serializedConfig);
    const mergeFunc = (l, r) => typeof r !== 'undefined' ? r : l;
    const mergedConfig = R.mergeWith(mergeFunc, defaultUserConfig, savedConfig);
    return mergedConfig;
  } catch(ex) {
    console.error('Unable to merge saved and default user configs', ex);
  }

  return defaultUserConfig;
}

export default {
  decorateConfig,
  getSavedUserConfig,
  saveUserConfig,
  resetToDefaultConfig,
};
