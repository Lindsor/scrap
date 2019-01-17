import {
  PossibleRequestMethods,
  BodyRequestMethods,
  SimpleCallOption,
  RequestMethod,
  CallOption,
  QueryValue,
  Headers,
  Option,
  Calls,
  Query,
} from './options';
import { URL } from 'url';

export const assertValidOptions = (options: Option) => {

  assertValidSimpleCallOption(options);
  // assertUniqueCallIds(options.calls);
}

export const assertValidSimpleCallOption = <T extends SimpleCallOption>(options: T) => {

  assertValidDomain(options.domain);
  assertValidHeaders(options.headers);
  assertValidCalls(options.calls);
  assertValidQuery(options.query);
};

export const assertValidCallOption = (options: CallOption) => {

  assertValidSimpleCallOption(options);
  assertValidPathName(options.pathName);
  assertValidRequestMethod(options.method);
  assertValidBody(options.body, options.method);
};

const assertValidQuery = (query: Query) => {


  if (!query) {
    return;
  }

  Object.values(query)
    .forEach(assertValidQueryValue);
};

const assertValidQueryValue = (queryValue: QueryValue) => {

  Object.values(queryValue)
    .forEach(queryValue => {

      if (typeof queryValue === 'object') {
        throw new Error('Query values must be primitive types OR arrays');
      }
    });
};

const assertValidBody = (body: any, method: RequestMethod) => {


  const requestMethod: RequestMethod = method.toUpperCase() as RequestMethod;
  const isBodyMethod: boolean = BodyRequestMethods
    .includes(requestMethod);

  if (
    !isBodyMethod &&
    !!body
  ) {
    throw new Error(`Method: {${requestMethod}} does not support sending a body`);
  }

  if (
    isBodyMethod &&
    !body
  ) {
    throw new Error(`Method: {${requestMethod}} requires a valid body`);
  }
};

const assertValidRequestMethod = (method: RequestMethod) => {


  const isValidMethod: boolean = PossibleRequestMethods
    .includes((method || '').toUpperCase() as RequestMethod);

  if (!isValidMethod) {
    throw new Error(`Must supply a valid 'method' in the list: ${PossibleRequestMethods.join(', ')}`);
  }
};

const assertValidPathName = (pathName: string) => {


  if (typeof pathName !== 'string') {
    throw new Error(`Must provide a valid string for 'pathName': {${pathName}}`);
  }

  const url: URL = new URL('https://www.test.com');
  url.pathname = pathName;

};

export const assertValidCalls = (calls: Calls) => {


  // Calls are optional
  if (!calls) {
    return;
  }

  // Every call must be a valid option
  Object.values(calls)
    .forEach(assertValidCallOption);
}

export const assertValidHeaders = (headers: Headers) => {

  // Headers are optional
  if (!headers) {
    return;
  }

  Object.entries(headers)
    .forEach(([name, value]: [string, string]) => {

      if (typeof value === 'string') {
        return;
      }

      // Header values must be strings
      throw new Error(`Header value must be string for header: {${name}}`);
    });

}

export const assertValidDomain = (domain: string) => {


  // Domain is optional
  if (!domain) {
    return;
  }

  // Check if the domain is a full url.
  const url: URL = new URL(domain);

  const pathName: string = url.pathname;
  if (pathName !== '/') {
    throw new Error(`The 'pathName' must be specified through 'pathName' property not domain: ${domain}`);
  }

  const query: string = url.search;
  if (query) {
    throw new Error(`The 'query' must be specified through 'query' property not domain: ${domain}`);
  }

  const hash: string = url.hash;
  if (hash) {
    throw new Error(`The 'hash' must be specified through 'hash' property not domain: ${domain}`);
  }
};
