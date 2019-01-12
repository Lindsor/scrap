import fetch, { Response } from 'node-fetch';
import { get, isObjectLike, mapValues, isString, isArray } from 'lodash';
import { ScrapOptions, ScrapFlow, ScrapHeaders } from './options';
import { URL } from 'url';
import path from 'path';
import fs from 'fs-extra';

const PARAM_REGEX = /{(.+?)}/g;

const options: ScrapOptions = require('./options-config').options;

const assertValidFlowPath = (flowPath: string) => {

  const validFlowPaths = [
    'responseBody',
    'requestBody',
  ];

  if (
    !flowPath ||
    !validFlowPaths.includes(flowPath)
  ) {
    throw new Error(`A valid flowPath must be passed in, one of: '${validFlowPaths.join(', ')}'`);
  }
};

const assertValidOptions = (options: ScrapOptions) => {

  if (!options) {
    throw new Error('Options must be declared');
  }

  const domainUrl = new URL(options.domain || '');
  if (domainUrl.pathname !== '/') {
    throw new Error(`Pleade do not at a pathName to the 'options.domain'. ${options.domain}`);
  }

  if (
    !options.flows ||
    !Object.keys(options.flows).length
  ) {
    throw new Error('options.flows must be declared');
  }

  const ids: string[] = [];

  Object.entries(options.flows)
    .forEach(([id, flow]: [string, ScrapFlow]) => {

      if (flow.url.includes('?')) {
        throw new Error(`Url cannot have query parameters in the url. Please set through the "query" property.\n${flow.url}`);
      }

      if (ids.includes(id)) {
        throw new Error(`There cannot be duplicate id properties. Please rename ${id}`);
      }
    });
};

const replaceParams = (regex: RegExp, string: string): any => {

  const stringParts = string.split('::');
  const stringToReplace = stringParts[0];
  const converter = (stringParts[1] || 'string').toLowerCase();

  const convertedString = stringToReplace.replace(regex, (match: string, param: string) => {
    const paramParts = param.split('.');
    const callId = paramParts[0];
    const flowPath = paramParts[1];
    const bodyPath = paramParts.slice(2).join('.');

    assertValidFlowPath(flowPath);

    const pathString = `${callId}.${flowPath}.${bodyPath}`;
    const pathValue = get(calls, pathString);

    if (isString(pathValue)) {
      return `"${pathValue}"`;
    }

    return JSON.stringify(pathValue, undefined, 2);
  });

  return convertString(convertedString, converter as any);
};

const convertString = (
  value: string,
  converter: 'string' | 'boolean' | 'number' | 'object'
) => {

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

const parseQuery = (query: any, options: ScrapOptions) => {

  if (!query) {
    return '';
  }

  let queryString: string = Object.entries(query)
    .map(([key, value]) => {

      return `${key}=${value}`;
    })
    .join('&');

  const queryParamRegex = /"?{(.+?)}"?/g;

  queryString = replaceParams(queryParamRegex, queryString);

  return `${queryString}`;
};

const parseUrl = (url: string, query: any, options: ScrapOptions) => {

  let requestUrl = `${options.domain || ''}${url}`;

  requestUrl = replaceParams(PARAM_REGEX, requestUrl);

  if (!query) {
    return requestUrl;
  }

  return `${requestUrl}?${query}`;
};
const deepReplace = (obj: any, paramRegex: RegExp): any => {

  if (isString(obj)) {
    return replaceParams(paramRegex, obj);
  }

  if (!isObjectLike(obj)) {
    return obj;
  }

  if (isArray(obj)) {
    return obj.map(arrValue => deepReplace(arrValue, paramRegex));
  }

  return mapValues(obj, value => deepReplace(value, paramRegex));
};
const parseBody = (body: any, options: ScrapOptions): any => {

  if (!body) return body;

  // TODO: Move the param regex and replace logic to seperate function and join with the `parseUrl` function
  const paramRegex = /"?{(.+?)}"?/g;

  console.log(JSON.stringify(body, undefined, 2));
  console.log(JSON.stringify(deepReplace(body, paramRegex), undefined, 2));

  // process.exit(0);

  return deepReplace(body, paramRegex);
};
const parseHeaders = (headers: ScrapHeaders | undefined, options: ScrapOptions) => ({ ...options.headers, ...headers });

// Ensure options are valid.
assertValidOptions(options);

console.clear();

export type ScrapCallDada = {
  flow: ScrapFlow;
  url?: string;
  query?: string;
  requestBody?: any;
  responseBody?: any;
  requestHeaders?: ScrapHeaders;
  responseHeaders?: ScrapHeaders;
};

const calls: {
  [callId: string]: ScrapCallDada;
} = {};

const fetchApi = (
  previousCall: PromiseLike<PromiseLike<Response> | undefined>,
  [id, flow]: [string, ScrapFlow],
) => {

  calls[id] = {
    flow,
  };

  return previousCall
    .then(() => {

      const method = flow.method;
      const query = parseQuery(flow.query, options);
      const url = parseUrl(flow.url, query, options);
      const body: string = parseBody(flow.body, options);
      const headers: any = parseHeaders(flow.headers, options);

      console.log(`${method}: ${url}`);
      // TODO: Handle `[]` parameters by going through all sub urls.

      calls[id].url = url;
      calls[id].query = query;
      calls[id].requestBody = body;
      calls[id].requestHeaders = headers;

      return fetch(url, {
        method,
        body,
        headers,
      })
        .then((response: Response) => {

          calls[id].responseHeaders = Object.entries(response.headers.raw())
            .reduce((headers: ScrapHeaders, [headerName, [headerValue]]: [string, string[]]) => {
              
              headers[headerName] = headerValue;

              return headers;
            }, {});

          return response.json()
            .then((responseBody: any) => {

              calls[id].responseBody = responseBody;
              // console.log(JSON.stringify(responseBody, undefined, 2));
              // TODO: Delete this
              if (!!responseBody.error) {
                console.log('FAILED');
                console.log(JSON.stringify(responseBody, undefined, 2));
              }
              console.log('#################################################################################################################');
              console.log('#################################################################################################################');
              console.log('#################################################################################################################');

              return response;
            });
        });
    });
};

Object.entries(options.flows)
  .reduce(fetchApi, Promise.resolve(undefined) as any)
  .then(() => Promise.all([
    ...Object.values(calls)
      .map((callData: ScrapCallDada) => {
        const mockPath = path.resolve(__dirname, 'mocks');
        const url: URL = new URL(callData.url as string);
        const method = callData.flow.method;
        const dataRootPath: string = `${mockPath}${url.pathname}/_${method.toUpperCase()}`;

        const writes: Promise<void>[] = [];

        if (callData.query) {
          const queryPath = path.resolve(dataRootPath, 'query.json');
          const queryString = JSON.stringify(callData.query, undefined, 2);
          writes.push(fs.outputFile(queryPath, queryString));
        }

        if (callData.responseBody) {
          const responseBodyPath = path.resolve(dataRootPath, 'response.json');
          const responseBody = JSON.stringify(callData.responseBody, undefined, 2);
          writes.push(fs.outputFile(responseBodyPath, responseBody));
        }

        if (callData.requestBody) {
          const requestBodyPath = path.resolve(dataRootPath, 'request.json');
          const requestBody = JSON.stringify(callData.requestBody, undefined, 2);
          writes.push(fs.outputFile(requestBodyPath, requestBody));
        }

        if (callData.responseHeaders) {
          const responseHeadersPath = path.resolve(dataRootPath, 'response-headers.json');
          const responseHeaders = JSON.stringify(callData.responseHeaders, undefined, 2);
          fs.outputFile(responseHeadersPath, responseHeaders);
        }

        if (callData.requestHeaders) {
          const requestHeadersPath = path.resolve(dataRootPath, 'request-headers.json');
          const requestHeaders = JSON.stringify(callData.requestHeaders, undefined, 2);
          fs.outputFile(requestHeadersPath, requestHeaders);
        }

        return Promise.all(writes);
      })
  ]))
  .then(() => console.log('DONE'));