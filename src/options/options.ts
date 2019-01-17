export type RequestMethod =
  'OPTIONS' |
  'CONNECT' |
  'DELETE' |
  'PATCH' |
  'TRACE' |
  'POST' |
  'HEAD' |
  'GET' |
  'PUT';

export const PossibleRequestMethods: RequestMethod[] = [
  'OPTIONS',
  'CONNECT',
  'DELETE',
  'PATCH',
  'TRACE',
  'POST',
  'HEAD',
  'GET',
  'PUT',
];

export const BodyRequestMethods: RequestMethod[] = [
  'PATCH',
  'POST',
  'PUT',
];

export interface Headers {
  [name: string]: string;
}

export type QueryValue = string | string[] | boolean;

export interface Query {
  [name: string]: QueryValue;
}

export interface SimpleCallOption {
  domain?: string;
  headers?: Headers;
  calls?: Calls;
  query?: Query;
}

export interface CallOption extends SimpleCallOption {
  pathName: string;
  method: RequestMethod;
  body?: any;
}

export interface Calls {
  [callId: string]: CallOption;
}

export interface Response {
  responseHeaders: Headers;
  requestHeaders: Headers;
  method: RequestMethod;
  responseBody: any;
  requestBody: any;
  status: number;
  query: Query;
  url: string;
}

export interface CallMapPath {
  callId: string;
  path: string[];
}

export interface CallMapOption extends Response {}

export interface MetaCallMap {
  [callId: string]: {
    savePath: string;
  };
}

export interface CallMap {
  [callId: string]: CallMapOption;
}

export interface Option extends SimpleCallOption {}
