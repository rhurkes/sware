import textHelper from '../utility/textHelper';
import objectHelper from '../utility/objectHelper';
import { default as defaultUserConfig } from '../config/userConfig';

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
  - Config item meta properties set in userConfig:
      __order: number. Objects in JS don't preserve order, so this numeric value can be used to
               specify order in a menu.
      __text: string. Overrides the default that takes the key value and converts it from camel to regular case.
      __subtext: string. Value used as the smaller text that accompanies the primary text.
      __subtextfunc: function. Determines dynamic subtext for the menu item
      value: string/boolean/number. The value of the config item.
      children: object. Contains valid config items.
  - Auto-generated config item decorations:
      __path: string. Pipe delimited value specifying how to traverse the object for get/set operations.
      __open: boolean. If config item has children, this specifies if the children are visible or not.
  */

/**
 * Returns a config for menus, decorated with paths for easy action firing,
 * text properties in case one is not specified, and parent properties for easy traversal.
 */
function decorateConfig(config, parentPath = '') {
  Object.keys(config).forEach(key => {
    const configItem = config[key];
    const valueType = typeof configItem;

    if (valueType !== 'object') { return; }
    const path = parentPath ? `${parentPath}|${key}` : key;
    configItem.__path = path;
    configItem.__text = configItem.__text || textHelper.fromCamelToRegularCase(key);

    if (configItem.children) {
      configItem.__open = false;
    }

    // Only recurse for items that don't have a value. Items with a value should be the end of the branch.
    if (typeof configItem.__value === 'undefined') {
      decorateConfig(configItem, path);
    }
  });

  config.get = path => objectHelper.getFromPath(config, path);
  config.set = (path, value) => objectHelper.setFromPath(config, path, value);

  return config;
}

function saveUserConfig(moduleName: string, userConfig) {
  const serializedUserConfig = JSON.stringify(userConfig);
  localStorage.setItem(`${moduleName}_config`, serializedUserConfig);
}

function validateLocalConfig() {
  const userConfigVersionKey = 'userConfigVersion';

  if (localStorage.getItem(userConfigVersionKey) !== defaultUserConfig.version.toString()) {
    localStorage.clear();
    localStorage.setItem(userConfigVersionKey, defaultUserConfig.version.toString());
  }
}

// TODO write unit tests for this!
// 1. can't find localstorage item
// 2. error while parsing
// 3. configs the same
// 4. userConfig has different value
// 5. default has something userConfig doesn't have
// 6. userConfig has something default doesn't have
function getUserConfig(moduleName: string) {
  const defaultModuleConfig = decorateConfig(defaultUserConfig[moduleName]);
  const serializedConfig = localStorage.getItem(`${moduleName}_config`);

  if (!serializedConfig) { return defaultModuleConfig; }

  try {
    const savedConfig = decorateConfig(JSON.parse(serializedConfig));
    const mergedConfig = objectHelper.deepMerge(defaultModuleConfig, savedConfig);
    return mergedConfig;
  } catch (ex) {
    console.error('Unable to merge configs, falling back to defaults', ex);
  }

  return defaultModuleConfig;
}

export default {
  getUserConfig,
  saveUserConfig,
  validateLocalConfig,
};
