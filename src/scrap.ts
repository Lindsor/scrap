import { ScrapOptions, assertValidOptions } from './options';
import { fetchApi } from './fetch-api';
import { saveAll } from './save';
import { calls } from './data';

const options: ScrapOptions = require('./options-config').options;

// Ensure options are valid.
assertValidOptions(options);

console.clear();

Object.entries(options.flows)
  .reduce(fetchApi(options, calls), Promise.resolve(undefined) as any)
  .then(() => saveAll(calls))
  .then(() => console.log('DONE'));
