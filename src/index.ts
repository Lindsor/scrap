import { ScrapOptions, assertValidOptions } from './options';
import { saveAll } from './save';
import { Scrap } from './scrap';

const options: ScrapOptions = require('./options-config').options;

// Ensure options are valid.
assertValidOptions(options);

console.clear();

const scrapper: Scrap = new Scrap(options);

scrapper.scrap()
  .then(saveAll)
  .then(() => console.log('DONE'));
