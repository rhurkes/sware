import * as R from 'ramda';

const delimiter = '|';

function deepMerge(a, b) {
  return R.isArrayLike(b) && !R.is(Object, b[0])
    ? b
    : (R.is(Object, a) && R.is(Object, b))
      ? R.mergeWith(deepMerge, a, b)
      : b;
}

function getReference(target: any, path: string) {
  let reference = target;

  if (path) {
    const lookupParts = path.split(delimiter).reverse();

    while (lookupParts.length) {
      reference = reference[lookupParts.pop()];
    }
  }

  return reference;
}

function getFromPath(target: any, path: string) {
  const splitPath = path.split('/');
  const key = splitPath[splitPath.length - 1];
  const reference = getReference(target, path);

  return reference[key];
}

function setFromPath(target: any, path: string, value: string | number | boolean) {
  const splitPath = path.split('/');
  const key = splitPath[splitPath.length - 1];
  const newTarget = Object.assign({}, target);
  const reference = getReference(newTarget, path);
  reference[key] = value;

  return newTarget;
}

export default {
  getFromPath,
  setFromPath,
  deepMerge,
};
