import { Option, CallMap, Calls, CallOption, RequestMethod, Headers, Response } from './options/options';
import { Options } from './options/index';
import { Replacer } from './replacer';
import { Fetcher } from './fetcher';
import { Saver } from './saver';

export class Scrapper {

  private config: Options;
  private fetcher: Fetcher = new Fetcher();
  private replacer: Replacer = new Replacer();
  private saver: Saver = new Saver();
  private callMap: CallMap = {};

  constructor(options: Option) {
    this.config = new Options(options);
  }

  scrapAndSaveApi(): Promise<CallMap> {
    return this.scrapApi()
      .then(callMap => this.saver.save(callMap));
  }

  resetCallMap(): CallMap {
    const oldCallMap: CallMap = this.callMap;
    this.callMap = {};

    return oldCallMap;
  }

  scrapApi(): Promise<CallMap> {
    this.resetCallMap();
    return this.scrapCalls(this.config.getTopLevelCalls(), this.callMap);
  }

  scrapCalls(calls: Calls, callMap: CallMap): Promise<CallMap> {

    if (!calls) {
      return Promise.resolve(callMap);
    }

    this.replacer.replace(calls, callMap);
    this.config.revalidate();

    return Promise.all(
      Object.entries(calls)
        .map(
          ([callId, callOption]: [string, CallOption]) => this.scrapCall(callId, callOption, callMap)
        )
    )
    .then(() => callMap);
  }

  scrapCall(callId: string, callOption: CallOption, callMap: CallMap) {
    const url: string = this.config.buildUrl(callOption);
    const method: RequestMethod = this.config.buildRequestMethod(callOption);
    const requestBody: string = this.config.buildBody(callOption);
    const headers: Headers = this.config.buildHeaders(callOption);

    return this.fetcher.fetch(
      url,
      method,
      headers,
      requestBody,
    )
      .then((response: Response) => this.saveCallEntry(callId, response, callMap))
      .then(() => this.scrapCalls(callOption.calls, callMap));
  }

  saveCallEntry(callId: string, response: Response, callMap: CallMap): Response {

    callMap[callId] = response;

    return response;
  }
}
