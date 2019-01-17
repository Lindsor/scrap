import { Option, Calls, CallOption, Query, Headers, RequestMethod } from './options';
import * as OptionAssert from './assert';
import qs from 'query-string';
import { URL } from 'url';

export class Options {

  private options: Option;

  constructor(options: Option) {
    OptionAssert.assertValidOptions(options);

    this.options = options;
  }

  revalidate() {
    OptionAssert.assertValidOptions(this.options);
  }

  getTopLevelCalls(): Calls {
    return this.options.calls;
  }

  buildDomain(callOption: CallOption): string {
    return callOption.domain || this.options.domain;
  }

  buildQueryString(callOption: CallOption): string {
    const query: Query = {
      ...this.options.query,
      ...callOption.query,
    };

    return qs.stringify(query);
  }

  buildUrl(callOption: CallOption): string {
    const domain: string = this.buildDomain(callOption);
    const url: URL = new URL(domain);
    const pathName: string = callOption.pathName;
    const query: string = this.buildQueryString(callOption);

    url.pathname = pathName;
    url.search = query;

    return url.href;
  }

  buildRequestMethod(callOption: CallOption): RequestMethod {
    return callOption.method.toUpperCase() as RequestMethod;
  }

  buildHeaders(callOption: CallOption): Headers {
    const headers: Headers = {
      ...this.options.headers,
      ...callOption.headers,
    };

    return headers;
  }

  buildBody(callOption: CallOption): any {
    return callOption.body;
  }
}
