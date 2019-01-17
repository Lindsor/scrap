import { get } from 'lodash';
import { CallMap, CallMapPath, CallMapOption } from '../options/options';

export class Replacer {

  public static readonly FULL_REPLACE_REGEX: RegExp = /^{.+}$/;
  public static readonly PARAM_REGEX: RegExp = /{(.+)}/g;

  replace(object: any, callMap: CallMap): any {

    if (Array.isArray(object)) {
      return this.replaceAsArray(object, callMap);
    }

    const type: string = typeof object;

    if (type === 'string') {
      return this.replaceAsString(object, callMap);
    }

    if (type === 'object') {
      return this.replaceAsObject(object, callMap);
    }

    return object;
  }

  getCallMapValue(path: string, callMap: CallMap): any {
    return get(callMap, path, `{${path}}`);
  }

  getCallMapPath(path: string): CallMapPath {
    const parts: string[] = path.split('.');
    const callId: string = path[0];
    const callMapPath: string[] = parts.slice(1);

    return {
      callId,
      path: callMapPath,
    };
  }

  getConverter(type: string): Function {
    return JSON.parse;
  }

  private replaceAsObject(object: any, callMap: CallMap) {
    return Object.entries(object)
      .reduce((newObject: any, [propName, value]: [string, any]) => {

        object[propName] = this.replace(value, callMap);

        return newObject;
      }, object);
  }

  private replaceAsArray<T>(array: T[], callMap: CallMap): T[] {
    return array
      .map((value: T) => this.replace(value, callMap));
  }

  private replaceAsString(string: string, callMap: CallMap): any {

    if (Replacer.FULL_REPLACE_REGEX.test(string)) {
      return this.replaceAndConvert(string, callMap);
    }

    return string
      .replace(Replacer.PARAM_REGEX, (allMatch: string, param: string) => {
        const callMapValue: any = this.getCallMapValue(param, callMap);

        return callMapValue;
      });
  }

  private replaceAndConvert(string: string, callMap: CallMap): any {

    let converter: Function;

    const replaced: string = string
      .replace(Replacer.PARAM_REGEX, (allMatch: string, param: string) => {
        const callMapValue: any = this.getCallMapValue(param, callMap);

        converter = this.getConverter(typeof callMapValue);

        return JSON.stringify(callMapValue);
      });

    if (converter) {
      return converter(replaced);
    }

    return replaced;
  }
}
