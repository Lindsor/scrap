import fetch, { Response, Headers } from 'node-fetch';
import { get } from 'lodash';
import { ScrapOptions, ScrapFlow, ScrapHeaders } from "./options";

const options: ScrapOptions = {
  domain: 'https://sandbox-api.coinmarketcap.com',
  headers: {
    'X-CMC_PRO_API_KEY': 'f2e034d1-1259-4f71-8f32-623eeefeeb5d',
  },
  flows: [
    {
      id: 'listings',
      url: '/v1/cryptocurrency/listings/latest?start=1&limit=4&convert=USD',
      method: 'GET',
      body: undefined,
      headers: {},
    },
    {
      id: 'info',
      url: '/v1/cryptocurrency/info?id={listings.data[0].id}',
      method: 'GET',
      body: undefined,
      headers: {},
    },
    // {
    //   id: 'call2',
    //   url: '/call2/{call1.level1.level2}',
    //   method: 'POST',
    //   body: {},
    //   headers: {},
    // },
    // {
    //   id: 'call3',
    //   url: '/call3/{call1.level1.level2}/sub-call-3',
    //   method: 'PUT',
    //   body: {},
    //   headers: {},
    // },
  ],
};

const assertValidOptions = (options: ScrapOptions) => !!options;

const parseUrl = (url: string, options: ScrapOptions) => {

  const paramRegex = /{(.+?)}/g;
  let requestUrl = `${options.domain || ''}${url}`;

  requestUrl = requestUrl.replace(paramRegex, (match: string, param: string) => {
    const paramParts = param.split('.');
    const callId = paramParts[0];
    const bodyPath = paramParts.slice(1).join('.');

    const pathString = `${callId}.jsonResponse.${bodyPath}`;

    return `${get(calls, pathString)}`;
  });

  return requestUrl;
};
const parseBody = (body: any, options: ScrapOptions) => body;
const parseHeaders = (headers: ScrapHeaders, options: ScrapOptions) => ({ ...options.headers, ...headers });


// Ensure options are valid.
assertValidOptions(options);

console.clear();

const calls: {
  [callId: string]: {
    response?: Response,
    jsonResponse?: any,
  };
} = {};

options.flows
  .reduce((previousCall: PromiseLike<PromiseLike<Response> | undefined>, flow: ScrapFlow) => {
    
    const id = flow.id;

    calls[id] = {};

    return previousCall
      .then(() => {

        const method = flow.method;
        const url = parseUrl(flow.url, options);
        const body = parseBody(flow.body, options);
        const headers: any = parseHeaders(flow.headers, options);

        return fetch(url, {
          method,
          body,
          headers,
        })
          .then((response: Response) => {
            calls[id].response = response;

            return response.json()
              .then((jsonResponse: any) => {

                calls[id].jsonResponse = jsonResponse;
                console.log(JSON.stringify(jsonResponse, undefined, 2));
                console.log('#################################################################################################################');
                console.log('#################################################################################################################');
                console.log('#################################################################################################################');

                return response;
              });
          });
      });
  }, Promise.resolve(undefined) as any)
    .then(() => {
      console.log('DONE');
      console.log(calls);
    });