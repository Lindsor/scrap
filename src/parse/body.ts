import { deepReplace } from '../deep-replace';
import { ScrapOptions } from '../options';
import { ScrapCalls } from '../data';

export const parseBody = (body: any, options: ScrapOptions, calls: ScrapCalls): any => {

  if (!body) return body;

  console.log(JSON.stringify(body, undefined, 2));
  console.log(JSON.stringify(deepReplace(body, calls), undefined, 2));

  return deepReplace(body, calls);
};
