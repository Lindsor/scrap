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



/**
 * Folder Structure:
 * 
 * Root: /mocks
 * Call1: /mocks/call1/GET.js
 * Call1.2: /mocks/call1/POST.js
 * Call2: /mocks/call2/{call1.level1.level2}/POST.js
 * Call3: /mocks/call3/{call1.level1.level2}/sub-call-3/PUT.js
 */