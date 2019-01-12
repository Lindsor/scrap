import { ScrapOptions } from '../options';
import { replaceParams } from './replace-params';
import { ScrapCalls } from '../data';

export const parseQuery = (
  query: any,
  options: ScrapOptions,
  calls: ScrapCalls,
) => {

  if (!query) {
    return '';
  }

  let queryString: string = Object.entries(query)
    .map(([key, value]) => {

      return `${key}=${value}`;
    })
    .join('&');

  queryString = replaceParams(queryString, calls);

  return `${queryString}`;
};
