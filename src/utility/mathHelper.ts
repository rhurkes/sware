const average = (values: number[]) => {
  return values.map((c, i, arr) => c / arr.length).reduce((p, c) => c + p);
};

export default {
  average,
};
