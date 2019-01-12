export const convertString = (
  value: string,
  converter: 'string' | 'boolean' | 'number' | 'object'
) => {

  if (converter === 'string') {
    console.log('VALUE:', value)
    return value;
  }

  if (converter === 'boolean') {
    return Boolean(value).valueOf();
  }

  if (converter === 'number') {
    return Number(value).valueOf();
  }

  if (converter === 'object') {
    return JSON.parse(value);
  }

  return `${value}`;
};
