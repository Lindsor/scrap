import { ScrapFlow, ScrapHeaders } from './options';

export type ScrapCallDada = {
  flow: ScrapFlow;
  url?: string;
  query?: string;
  savePath?: string;
  requestBody?: any;
  responseBody?: any;
  requestHeaders?: ScrapHeaders;
  responseHeaders?: ScrapHeaders;
};

export type ScrapCalls = {
  [callId: string]: ScrapCallDada;
};

export const calls: ScrapCalls = {};
