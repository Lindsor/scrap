
import { ScrapCalls, ScrapCallDada } from './options';
import fs from 'fs-extra';
import path from 'path';

export class Saver {
  public saveAll(calls: ScrapCalls) {
    // TODO: Validate all savePath's are unique
    return Promise.all([
      ...Object.values(calls)
        .map((callData: ScrapCallDada) => {
          const mockPath = path.resolve(__dirname, '..', 'mocks');
          // const savePathUrl: URL = new URL((callData.savePath as string));
          const method = callData.flow.method;
          const dataRootPath: string = `${mockPath}${callData.savePath}/_${method.toUpperCase()}`;

          const writes: Promise<void>[] = [];

          if (callData.query) {
            const queryPath = path.resolve(dataRootPath, 'query.json');
            const queryString = JSON.stringify(callData.query, undefined, 2);
            writes.push(fs.outputFile(queryPath, queryString));
          }

          if (callData.responseBody) {
            const responseBodyPath = path.resolve(dataRootPath, 'response.json');
            const responseBody = JSON.stringify(callData.responseBody, undefined, 2);
            writes.push(fs.outputFile(responseBodyPath, responseBody));
          }

          if (callData.requestBody) {
            const requestBodyPath = path.resolve(dataRootPath, 'request.json');
            const requestBody = JSON.stringify(callData.requestBody, undefined, 2);
            writes.push(fs.outputFile(requestBodyPath, requestBody));
          }

          if (callData.responseHeaders) {
            const responseHeadersPath = path.resolve(dataRootPath, 'response-headers.json');
            const responseHeaders = JSON.stringify(callData.responseHeaders, undefined, 2);
            writes.push(fs.outputFile(responseHeadersPath, responseHeaders));
          }

          if (callData.requestHeaders) {
            const requestHeadersPath = path.resolve(dataRootPath, 'request-headers.json');
            const requestHeaders = JSON.stringify(callData.requestHeaders, undefined, 2);
            writes.push(fs.outputFile(requestHeadersPath, requestHeaders));
          }

          return Promise.all(writes);
        })
    ]);
  }
}
