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
  headers?: Headers;
  domain?: string;
  calls?: Calls;
  query?: Query;
}

export interface CallOption extends SimpleCallOption {
  savePathIdentifiers?: string[];
  method: RequestMethod;
  pathName: string;
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
  pathName: string;
  status: number;
  query: Query;
  url: string;
}

export interface CallMapPath {
  callId: string;
  path: string[];
}

export interface CallMapOption extends Response {
  savePathIdentifiers?: string[];
}

export interface MetaCallMap {
  [callId: string]: {
    savePath: string;
    pathName: string;
    savePathIdentifiers?: {
      [identifierPath: string]: any;
    };
  };
}

export interface CallMap {
  [callId: string]: CallMapOption;
}

export interface Option extends SimpleCallOption {}
