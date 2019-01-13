import { ScrapOptions, ScrapFlow, ScrapHeaders, ScrapMethod } from './options';
import fetch, { Response, Headers } from 'node-fetch';
import { Replacer } from './replacer';
import { ScrapCalls } from './data';
import qs from 'query-string';
import { URL } from 'url';

export class Scrap {

  private replacer = new Replacer();

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

  private buildRequestUrl(
    urlOrPath: string,
    query: any,
    domain: string,
    calls: ScrapCalls,
  ): string {

    let builtUrl: string = this.replacer.replace(urlOrPath, calls);
    const builtQuery: any = this.replacer.replace(query, calls);
    const queryString: string = qs.stringify(builtQuery);

    if (queryString) {
      builtUrl = `${builtUrl}?${queryString}`;
    }

    let url: URL;

    try {
      url = new URL(builtUrl);
    } catch (e) {
      // Delete leading slash to normalize url.
      const pathName: string = builtUrl.replace(/^\//, '');
      url = new URL(`${domain}/${pathName}`);
    }

    return url.href;
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

        const method: ScrapMethod = flow.method;
        const query: any = this.replacer.replace(flow.query, this.calls);
        const body: any = this.replacer.replace(flow.body, this.calls);
        const savePath: string = this.replacer.replace(flow.savePath || flow.url, this.calls);
        const headers: any = this.replacer.replace(
          {
            ...this.options.headers,
            ...flow.headers,
          },
          this.calls,
        );
        const url: string = this.buildRequestUrl(
          flow.url,
          flow.query,
          this.options.domain as string,
          this.calls,
        );

        console.log(`${method}: ${flow.url}`);
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
