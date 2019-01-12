import { replaceParams } from './replace-params';
import { ScrapOptions } from '../options';
import { ScrapCalls } from '../data';

export const parseUrl = (url: string, query: any, options: ScrapOptions, calls: ScrapCalls) => {

  let requestUrl = `${options.domain || ''}${url}`;

  requestUrl = replaceParams(requestUrl, calls);

  if (!query) {
    return requestUrl;
  }

  return `${requestUrl}?${query}`;
};
