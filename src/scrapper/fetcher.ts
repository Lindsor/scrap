import { ScrapMethod, ScrapHeaders, ScrapCalls } from './options';
import fetch, { Response } from 'node-fetch';

export class Fetcher {

  fetch(
    id: string,
    url: string,
    method: ScrapMethod,
    body: any,
    headers: any,
    calls: ScrapCalls,
  ): Promise<Response> {
    // TODO: Handle non JSON responses
    body = JSON.stringify(body);

    const requestLogLine = `${method}: ${url}`;

    console.log(requestLogLine);

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
              console.log(`FAILED - ${requestLogLine}`);
              console.log(JSON.stringify(responseBody, undefined, 2));
            }
            console.log('#################################################################################################################');
            console.log('#################################################################################################################');
            console.log('#################################################################################################################');

            return response;
          });
      });
  }
}
