import { RequestMethod, Headers, Response } from '../options/options';
import fetch, { Response as FetchResponse, Headers as FetchHeaders } from 'node-fetch';

export class Fetcher {

  convertHeaders(fetchHeaders: FetchHeaders): Headers {
    return Object.entries(fetchHeaders.raw())
      .reduce((headers: Headers, [name, value]: [string, string[]]) => {
        headers[name] = value.join('; ');

        return headers;
      }, {});
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

          const status: number = response.status;

          console.info(`${method} (${status}) - ${url}`);

          return {
            responseHeaders: this.convertHeaders(response.headers),
            requestHeaders,
            responseBody,
            requestBody,
            status,
            method,
            url,
          };
        }));
  }
}
