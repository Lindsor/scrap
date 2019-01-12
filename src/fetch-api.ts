import { ScrapFlow, ScrapOptions, ScrapHeaders } from './options';
import { parseHeaders } from './parse/headers';
import fetch, { Response } from 'node-fetch';
import { parseQuery } from './parse/query';
import { parseBody } from './parse/body';
import { parseUrl } from './parse/url';
import { ScrapCalls } from './data';

export const fetchApi = (options: ScrapOptions, calls: ScrapCalls) => (
  previousCall: PromiseLike<PromiseLike<Response> | undefined>,
  [id, flow]: [string, ScrapFlow],
) => {

  calls[id] = {
    flow,
  };

  return previousCall
    .then(() => {

      const method = flow.method;
      const query = parseQuery(flow.query, options, calls);
      const url = parseUrl(flow.url, query, options, calls);
      const body: string = parseBody(flow.body, options, calls);
      const headers: any = parseHeaders(flow.headers, options);
      const savePath = parseUrl(flow.savePath || flow.url, undefined, options, calls);

      console.log(`${method}: ${url}`);
      // TODO: Handle `[]` parameters by going through all sub urls.

      calls[id].url = url;
      calls[id].query = query;
      calls[id].requestBody = body;
      calls[id].savePath = savePath;
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
