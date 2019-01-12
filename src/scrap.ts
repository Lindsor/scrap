import { ScrapOptions, ScrapFlow, ScrapHeaders } from './options';
import fetch, { Response, Headers } from 'node-fetch';
import { ScrapCalls } from './data';
import { parseHeaders } from './parse/headers';
import { parseQuery } from './parse/query';
import { parseBody } from './parse/body';
import { parseUrl } from './parse/url';

export class Scrap {

  constructor(
    private options: ScrapOptions,
    private calls: ScrapCalls = {},
  ) {}

  public scrap(): Promise<ScrapCalls> {
    return (Object.entries(this.options.flows) as any)
      .reduce(this.scrapReduce.bind(this), Promise.resolve(undefined) as any)
      .then(() => this.calls);
  }

  public fetch(
    id: string,
    url: string,
    method: string,
    body: string,
    headers: Headers,
  ) {
    return fetch(url, {
      method,
      body,
      headers,
    })
      .then((response: Response) => {

        this.calls[id].responseHeaders = Object.entries(response.headers.raw())
          .reduce((headers: ScrapHeaders, [headerName, [headerValue]]: [string, string[]]) => {

            headers[headerName] = headerValue;

            return headers;
          }, {});

        return response.json()
          .then((responseBody: any) => {

            this.calls[id].responseBody = responseBody;
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
  }

  private scrapReduce(
    previousCall: PromiseLike<PromiseLike<Response> | undefined>,
    [id, flow]: [string, ScrapFlow],
  ) {
    this.calls[id] = {
      flow,
    };

    return previousCall
      .then(() => {

        const method = flow.method;
        const query = parseQuery(flow.query, this.options, this.calls);
        const url = parseUrl(flow.url, query, this.options, this.calls);
        const body: string = parseBody(flow.body, this.options, this.calls);
        const headers: any = parseHeaders(flow.headers, this.options);
        const savePath = parseUrl(flow.savePath || flow.url, undefined, this.options, this.calls);

        console.log(`${method}: ${url}`);
        // TODO: Handle `[]` parameters by going through all sub urls.

        this.calls[id].url = url;
        this.calls[id].query = query;
        this.calls[id].requestBody = body;
        this.calls[id].savePath = savePath;
        this.calls[id].requestHeaders = headers;

        return this.fetch(
          id,
          url,
          method,
          body,
          headers,
        );
      });
  }
}
