import { convertString } from './convert-to-string';
import { assertValidFlowPath } from '../options';
import { isString, get } from 'lodash';
import { ScrapCalls } from '../data';

const PARAM_REGEX = /"?{(.+?)}"?/g

export const replaceParams = (
  string: string,
  calls: ScrapCalls,
): any => {

  const stringParts = string.split('::');
  const stringToReplace = stringParts[0];
  const converter = (stringParts[1] || 'string').toLowerCase();

  const convertedString = stringToReplace.replace(PARAM_REGEX, (match: string, param: string) => {
    const paramParts = param.split('.');
    const callId = paramParts[0];
    const flowPath = paramParts[1];
    const bodyPath = paramParts.slice(2).join('.');

    assertValidFlowPath(flowPath);

    const pathString = `${callId}.${flowPath}.${bodyPath}`;
    const pathValue = get(calls, pathString);

    if (isString(pathValue)) {
      return `${pathValue}`;
    }

    return JSON.stringify(pathValue, undefined, 2);
  });

  return convertString(convertedString, converter as any);
};
