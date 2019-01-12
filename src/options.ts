import { URL } from 'url';

export declare type ScrapMethod = 'GET' | 'PUT' | 'POST' | 'DELETE' | 'OPTIONS' | 'PATCH';

export declare type ScrapHeaderFunction = (scrapFlow: ScrapFlow) => string;

export declare type ScrapHeaders = {
  [headerName: string]: string | ScrapHeaderFunction;
};

export declare type ScrapFlow = {
  url: string;
  savePath?: string;
  method: ScrapMethod;
  query?: {
    [key: string]: string;
  };
  body?: any;
  headers?: ScrapHeaders;
};

export declare type ScrapFlows = {
  [flowId: string]: ScrapFlow;
};

export declare type ScrapOptions = {
  domain?: string;
  headers: ScrapHeaders;
  flows: ScrapFlows;
};

export const assertValidFlowPath = (flowPath: string) => {

  const validFlowPaths = [
    'requestBody',
    'responseBody',
    'requestHeaders',
    'responseHeaders',
  ];

  if (
    !flowPath ||
    !validFlowPaths.includes(flowPath)
  ) {
    throw new Error(`A valid flowPath must be passed in, one of: '${validFlowPaths.join(', ')}'`);
  }
};

export const assertValidOptions = (options: ScrapOptions) => {

  if (!options) {
    throw new Error('Options must be declared');
  }

  const domainUrl = new URL(options.domain || '');
  if (domainUrl.pathname !== '/') {
    throw new Error(`Pleade do not at a pathName to the 'options.domain'. ${options.domain}`);
  }

  if (
    !options.flows ||
    !Object.keys(options.flows).length
  ) {
    throw new Error('options.flows must be declared');
  }

  const ids: string[] = [];

  Object.entries(options.flows)
    .forEach(([id, flow]: [string, ScrapFlow]) => {

      if (flow.url.includes('?')) {
        throw new Error(`Url cannot have query parameters in the url. Please set through the "query" property.\n${flow.url}`);
      }

      if (ids.includes(id)) {
        throw new Error(`There cannot be duplicate id properties. Please rename ${id}`);
      }
    });
};
