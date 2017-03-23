const delimiter = '|';

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

function getFromPath(target: any, key: string, path: string) {
  const reference = getReference(target, path);
  return reference[key];
}

function setFromPath(target: any, key: string, path: string, value: string | number | boolean) {
  const newTarget = Object.assign({}, target);
  const reference = getReference(newTarget, path);
  reference[key] = value;
  return newTarget;
}

export default {
  getFromPath,
  setFromPath,
};
