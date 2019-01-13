import { ScrapOptions, ScrapFlow, ScrapMethod, ScrapCalls } from './options';
import { Fetcher } from './fetcher';
import { Response } from 'node-fetch';
import { Replacer } from './replacer';
import { Saver } from './saver';
import qs from 'query-string';
import { URL } from 'url';

export class Scrap {

  private replacer: Replacer = new Replacer();
  private fetcher: Fetcher = new Fetcher();
  private saver: Saver = new Saver();

  constructor(
    private options: ScrapOptions,
    private calls: ScrapCalls = {},
  ) {}

  public scrapAndSave(): Promise<ScrapCalls> {
    return this.scrap()
      .then(() => this.save());
  }

  public scrap(): Promise<ScrapCalls> {
    return Object.entries(this.options.flows)
      .reduce(
        (
          prevCalls: Promise<Response>,
          [id, flow]: [string, ScrapFlow],
        ) => this.scrapReduce(id, flow, prevCalls),
        Promise.resolve(undefined as any),
      )
      .then(() => this.calls);
  }

  public save(): Promise<ScrapCalls> {
    return this.saver.saveAll(this.calls)
      .then(() => this.calls);
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
    id: string,
    flow: ScrapFlow,
    previousCall: Promise<Response>,
  ): Promise<Response> {
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

        return this.fetcher.fetch(
          id,
          url,
          method,
          body,
          headers,
          this.calls,
        );
      });
  }
}
