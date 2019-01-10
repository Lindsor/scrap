import fetch, { Response } from 'node-fetch';
import { get } from 'lodash';
import { ScrapOptions, ScrapFlow, ScrapHeaders } from "./options";

const PARAM_REGEX = /{(.+?)}/g;

const options: ScrapOptions = require('./options-config').options;

const assertValidOptions = (options: ScrapOptions) => !!options;

const parseUrl = (url: string, options: ScrapOptions) => {

  let requestUrl = `${options.domain || ''}${url}`;

  requestUrl = requestUrl.replace(PARAM_REGEX, (match: string, param: string) => {
    const paramParts = param.split('.');
    const callId = paramParts[0];
    const bodyPath = paramParts.slice(1).join('.');

    const pathString = `${callId}.responseBody.${bodyPath}`;

    return `${get(calls, pathString)}`;
  });

  return requestUrl;
};
const parseBody = (body: any, options: ScrapOptions): string => {

  if (!body) return body;

  // TODO: Move the param regex and replace logic to seperate function and join with the `parseUrl` function
  const paramRegex = /"?{(.+?)}"?/g;
  // Also move to using a traversal strategy instead of string replace
  let bodyString = JSON.stringify(body, undefined, 2);

  bodyString = bodyString.replace(paramRegex, (match: string, param: string) => {
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

  // console.log(bodyString);

  return bodyString;
};
const parseHeaders = (headers: ScrapHeaders, options: ScrapOptions) => ({ ...options.headers, ...headers });

// Ensure options are valid.
assertValidOptions(options);

console.clear();

const calls: {
  [callId: string]: {
    response?: Response,
    // requestBody?: any,
    responseBody?: any,
  };
} = {};

const fetchApi = (previousCall: PromiseLike<PromiseLike<Response> | undefined>, flow: ScrapFlow) => {

  const id = flow.id;

  calls[id] = {};

  return previousCall
    .then(() => {

      const method = flow.method;
      const url = parseUrl(flow.url, options);
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
              console.log(JSON.stringify(responseBody, undefined, 2));
              console.log('#################################################################################################################');
              console.log('#################################################################################################################');
              console.log('#################################################################################################################');

              return response;
            });
        });
    });
};

options.flows
  .reduce(fetchApi, Promise.resolve(undefined) as any)
  .then(() => {
    // console.log('DONE');
    // console.log(calls);
  });