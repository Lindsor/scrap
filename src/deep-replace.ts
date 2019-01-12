import { isString, isObjectLike, isArray, mapValues } from 'lodash';
import { replaceParams } from './parse/replace-params';
import { ScrapCalls } from './data';

export const deepReplace = (obj: any, calls: ScrapCalls): any => {

  if (isString(obj)) {
    return replaceParams(obj, calls);
  }

  if (!isObjectLike(obj)) {
    return obj;
  }

  if (isArray(obj)) {
    return obj.map(val => deepReplace(val, calls));
  }

  return mapValues(obj, val => deepReplace(val, calls));
};
