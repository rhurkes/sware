import * as R from 'ramda';

interface IObjectReference {
  reference: object;
  key: string;
}

const delimiter = '|';

function deepMerge(a, b) {
  return R.isArrayLike(b) && !R.is(Object, b[0]) || typeof b === 'function'
    ? b
    : (R.is(Object, a) && R.is(Object, b))
      ? R.mergeWith(deepMerge, a, b)
      : b;
}

/**
 * Returns a result including an object reference and a key for accessing the desired property.
 * * Visible for testing
 * @param target
 * @param path
 */
export function getReference(target: any, path: string): IObjectReference {
  const result = { reference: target || undefined, key: undefined };
  if (!target || !path) { return result; }

  const lookupParts = path.split(delimiter).reverse();

  while (lookupParts.length) {
    if (lookupParts.length === 1) {
      result.key = lookupParts.pop();
    } else {
      result.reference = result.reference[lookupParts.pop()];
    }
  }

  return result;
}

function getValueFromPath(target: any, path: string) {
  const result = getReference(target, path);

  return result.reference ? result.reference[result.key] : undefined;
}

function setValueFromPath(target: any, path: string, value: string | number | boolean) {
  const newTarget = Object.assign({}, target);
  const result = getReference(newTarget, path);

  if (result.reference) {
    result.reference[result.key] = value;
  }

  return newTarget;
}

export default {
  getReference,
  getValueFromPath,
  setValueFromPath,
  deepMerge,
};
