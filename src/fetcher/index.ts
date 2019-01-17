import { Query } from './../options/options';
import { RequestMethod, Headers, Response } from '../options/options';
import fetch, { Response as FetchResponse, Headers as FetchHeaders } from 'node-fetch';
import { URL } from 'url';
import qs from 'query-string';

export class Fetcher {

  convertHeaders(fetchHeaders: FetchHeaders): Headers {
    return Object.entries(fetchHeaders.raw())
      .reduce((headers: Headers, [name, value]: [string, string[]]) => {
        headers[name] = value.join('; ');

        return headers;
      }, {});
  }

  convertQuery(urlString: string): Query {
    const url: URL = new URL(urlString);

    return qs.parse(url.search);
  }

  fetch(
    url: string,
    method: RequestMethod,
    requestHeaders: Headers,
    requestBody: any,
  ): Promise<Response> {
    return fetch(
      url,
      {
        method,
        body: requestBody,
        headers: requestHeaders,
      }
    )
      .then((response: FetchResponse) => response.json()
        .then((responseBody: any) => {

          const responseHeaders: Headers = this.convertHeaders(response.headers);
          const query: Query = this.convertQuery(url);
          const status: number = response.status;

          console.info(`${method} (${status}) - ${url}`);

          return {
            responseHeaders,
            requestHeaders,
            responseBody,
            requestBody,
            status,
            method,
            query,
            url,
          };
        }));
  }
}
