import { ScrapOptions, assertValidOptions } from './options';
import { Scrap } from './scrap';

const options: ScrapOptions = require('./options-config').options;

// Ensure options are valid.
assertValidOptions(options);

console.clear();

const scrapper: Scrap = new Scrap(options);

scrapper.scrapAndSave()
  .then(() => console.log('DONE'));
