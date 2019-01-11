import fetch, { Response } from 'node-fetch';
import { get } from 'lodash';
import { ScrapOptions, ScrapFlow, ScrapHeaders } from './options';
import { URL } from 'url';
import fs from 'fs-extra';

const PARAM_REGEX = /{(.+?)}/g;

const options: ScrapOptions = require('./options-config').options;

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

const replaceParams = (regex: RegExp, string: string): string => {

  return string.replace(regex, (match: string, param: string) => {
    const paramParts = param.split('.');
    const callId = paramParts[0];
    const bodyPath = paramParts.slice(1).join('.');

    const pathString = `${callId}.responseBody.${bodyPath}`;
    const pathValue = get(calls, pathString);

    if (typeof pathValue === 'string') {
      return `"${pathValue}"`;
    }

    return JSON.stringify(pathValue, undefined, 2);
  });
};

const parseUrl = (url: string, query: any, options: ScrapOptions) => {

  let requestUrl = `${options.domain || ''}${url}`;

  requestUrl = replaceParams(PARAM_REGEX, requestUrl);

  if (!query) {
    return requestUrl;
  }

  let queryString: string = Object.entries(query)
    .map(([key, value]) => {

      return `${key}=${value}`;
    })
    .join('&');
  
  const queryParamRegex = /"?{(.+?)}"?/g;
  
  queryString = replaceParams(queryParamRegex, queryString);

  return `${requestUrl}?${queryString}`;
};
const parseBody = (body: any, options: ScrapOptions): string => {

  if (!body) return body;

  // TODO: Move the param regex and replace logic to seperate function and join with the `parseUrl` function
  const paramRegex = /"?{(.+?)}"?/g;
  // Also move to using a traversal strategy instead of string replace
  let bodyString = JSON.stringify(body, undefined, 2);

  bodyString = replaceParams(paramRegex, bodyString);

  // console.log(bodyString);

  return bodyString;
};
const parseHeaders = (headers: ScrapHeaders | undefined, options: ScrapOptions) => ({ ...options.headers, ...headers });

// Ensure options are valid.
assertValidOptions(options);

console.clear();

const calls: {
  [callId: string]: {
    flow: ScrapFlow;
    response?: Response,
    // requestBody?: any,
    responseBody?: any,
  };
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
      const url = parseUrl(flow.url, flow.query, options);
      const body: string = parseBody(flow.body, options);
      const headers: any = parseHeaders(flow.headers, options);

      console.log(`${method}: ${url}`);
      // TODO: Handle `[]` parameters by going through all sub urls.

      // calls[id].requestBody = body;

      return fetch(url, {
        method,
        body,
        headers,
      })
        .then((response: Response) => {
          calls[id].response = response;

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
  .then(() => {
    console.log('DONE');
    // console.log(calls);

  });