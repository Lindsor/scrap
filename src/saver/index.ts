import { get } from 'lodash';
import { CallMap, CallMapOption, RequestMethod, Response, MetaCallMap } from '../options/options';
import { URL } from 'url';
import fs from 'fs-extra';
import path from 'path';

export class Saver {

  public static readonly PROPS_TO_SAVE: Array<keyof Response> = [
    'responseHeaders',
    'requestHeaders',
    'responseBody',
    'requestBody',
    'query',
  ];

  buildMocksPath(): string {
    return path.resolve(__dirname, '..', 'mocks');
  }

  buildSavePathIdentifierPath(callMapOption: CallMapOption): string {

    const savePathIdentifiers: string[] = callMapOption.savePathIdentifiers;

    if (
      !Array.isArray(savePathIdentifiers) ||
      !savePathIdentifiers.length
    ) {
      return '';
    }

    return savePathIdentifiers
      .map((path: string) => {

        //Add prefix based on first property.
        const prefix: string = path.charAt(0);

        return `_${prefix}_${get(callMapOption, path)}`;
      })
      .join('/');
  }

  buildSavePath(callMapOption: CallMapOption): string {
    const mocksPath: string = this.buildMocksPath();
    const url: URL = new URL(callMapOption.url);
    const pathName: string = url.pathname;
    const savePathIdentifier: string = this.buildSavePathIdentifierPath(callMapOption);
    // Remove leading slash
    const cleanPathName: string = pathName.replace(/^\//, '');
    const method: RequestMethod = callMapOption.method.toUpperCase() as RequestMethod;

    return path.resolve(mocksPath, cleanPathName, savePathIdentifier, `_${method}`);
  }

  buildMetaCallMapPath(): string {
    const mocksPath: string = this.buildMocksPath();

    return path.resolve(mocksPath, '_meta-call-map.json');
  }

  buildSavePathIdentifiers(callMapOption: CallMapOption) {

    const savePathIdentifiers: string[] = callMapOption.savePathIdentifiers;

    if (
      !Array.isArray(savePathIdentifiers) ||
      !savePathIdentifiers.length
    ) {
      return undefined;
    }

     return savePathIdentifiers
      .reduce((pathIdentifiers: any, currentIdentifier: string) => {

        pathIdentifiers[currentIdentifier] = get(callMapOption, currentIdentifier);

        return pathIdentifiers;
      }, {});
  }

  save(callMap: CallMap): Promise<CallMap> {

    const metaCallMap: MetaCallMap = {};

    return Promise.all(
      Object.entries(callMap)
        .map(([callId, callMapOption]: [string, CallMapOption]) => {

          const savePath: string = this.buildSavePath(callMapOption);
          const writes: Promise<void>[] = [];

          metaCallMap[callId] = {
            pathName: callMapOption.pathName,
            savePathIdentifiers: this.buildSavePathIdentifiers(callMapOption),
            savePath,
          };

          if (
            Array.isArray(callMapOption.savePathIdentifiers) &&
            callMapOption.savePathIdentifiers.length
          ) {

          }

          Saver.PROPS_TO_SAVE
            .filter((propName: keyof Response) => typeof callMapOption[propName] !== 'undefined')
            .forEach((propName: keyof Response) => {
              const filePath: string = path.resolve(savePath, `${propName}.json`);
              const data: any = callMapOption[propName];

              writes.push(this.saveFile(filePath, JSON.stringify(data, undefined, 2)));
            });

          const metaData: any = {
            savePathIdentifiers: callMapOption.savePathIdentifiers,
            timestamp: (new Date()).toISOString(),
            status: callMapOption.status,
            url: callMapOption.url,
          };
          const metaDataFilePath: string = path.resolve(savePath, `meta-data.json`);
          writes.push(this.saveFile(metaDataFilePath, JSON.stringify(metaData, undefined, 2)));

          return Promise.all(writes);
        })
    )
      .then(
        () => this.saveFile(this.buildMetaCallMapPath(), JSON.stringify(metaCallMap, undefined, 2))
      )
      .then(() => callMap);
  }

  private saveFile(filePath: string, data: any): Promise<void> {
    return fs.outputFile(filePath, data)
      .then(() => {
        console.info(`WRITE: ${filePath}`);
        return Promise.resolve();
      });
  }
}
