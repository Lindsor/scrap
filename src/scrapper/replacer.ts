import { isString, isObjectLike, mapValues, get } from 'lodash';
import { assertValidFlowPath, ScrapCalls } from './options';

declare type Converter = 'string' | 'boolean' | 'number' | 'object';

export class Replacer {

  public static PARAM_REGEX: RegExp = /"?{(.+?)}"?/g

  public replace<T>(body: T, calls: ScrapCalls): T {

    if (!body) return body;

    return this.deepReplace(body, calls);
  }

  private convertString(
    value: string,
    converter: Converter,
  ) {

    if (converter === 'string') {
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

  private replaceString(param: string, calls: ScrapCalls) {
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
  }

  private replaceParams(
    string: string,
    calls: ScrapCalls,
  ): any {

    const stringParts = string.split('::');
    const stringToReplace = stringParts[0];
    const converter = (stringParts[1] || 'string').toLowerCase();

    const convertedString = stringToReplace.replace(
      Replacer.PARAM_REGEX,
      (match: string, param: string) => this.replaceString(param, calls),
    );

    return this.convertString(convertedString, converter as Converter);
  }

  private deepReplace(obj: any, calls: ScrapCalls): any {

    if (isString(obj)) {
      return this.replaceParams(obj, calls);
    }

    if (!isObjectLike(obj)) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(val => this.deepReplace(val, calls));
    }

    return mapValues(obj, val => this.deepReplace(val, calls));
  };
}
