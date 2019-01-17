import { Scrapper } from './../scrapper';

const scrapper: Scrapper = new Scrapper({
  domain: 'https://sandbox-api.coinmarketcap.com',
  headers: {
    'X-CMC_PRO_API_KEY': 'f2e034d1-1259-4f71-8f32-623eeefeeb5d',
  },
  calls: {
    listings: {
      pathName: `/v1/cryptocurrency/listings/latest`,
      method: 'GET',
      body: undefined,
      headers: undefined,
      query: {
        start: '1',
        limit: '2',
        convert: 'USD',
      },
      calls: {
        info: {
          pathName: `/v1/cryptocurrency/info`,
          method: 'GET',
          body: undefined,
          headers: undefined,
          query: {
            id: '{listings.responseBody.data[0].id}',
          },
        },
        infoPostTest: {
          pathName: `/v1/cryptocurrency/info`,
          method: 'POST',
          body: {
            id: '{listings.responseBody.data[0].id}',
            test: 'test',
            deeper: {
              muchDeeper: '{listings.responseBody.data[0].id}',
              muchMuchDeeper: [
                '{listings.responseBody.data[0].id}',
                'test',
                '{listings.responseBody.data[0].id}',
              ]
            }
          },
          headers: undefined,
          query: {
            id: '{listings.responseBody.data[0].id}',
          },
        },
        infoTest: {
          pathName: `/v1/cryptocurrency/info/{listings.responseBody.data[0].id}`,
          // savePath: `/v1/cryptocurrency/info/{listings.responseBody.data[0].name}`,
          method: 'GET',
          body: undefined,
          headers: {
            headerTest: 'test1',
            replaceTest: 'Crypto-Name: {listings.responseBody.data[0].name}',
          },
          query: undefined,
        }
      }
    },
  },
});

console.log('');
scrapper.scrapApi()
  .then(res => {

    // const logEntry: any = res
    const logEntry: any = Object.keys(res);
    // const logEntry: any = Object.entries(res)
    //   .map(([,v]) => v.requestBody);

    console.log('');
    console.log('SUCCESS');
    console.log(JSON.stringify(logEntry, undefined, 2));
  })
  .catch(err => {
    console.log('');
    console.log('FAILED');
    console.log(err);
  });
