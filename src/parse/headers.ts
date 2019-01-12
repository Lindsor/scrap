import { ScrapHeaders, ScrapOptions } from '../options';

export const parseHeaders = (
  headers: ScrapHeaders | undefined,
  options: ScrapOptions,
) => ({ ...options.headers, ...headers });
