import { ScrapOptions, ScrapFlow } from './options';

// const users = [
//   'situser002',
//   'marceloluz',
//   'situser005',
// ];

// export const options: ScrapOptions = {
//   domain: 'https://www.qa4.bmogc.net',
//   headers: {
//     // 'X-CMC_PRO_API_KEY': 'f2e034d1-1259-4f71-8f32-623eeefeeb5d',
//     'iv-groups': 'BHOB Admin Tool - CSR L2',
//     'iv-user': 'BHOBTest03@officeqa.adrootqa.bmogc.net',
//     'Host': 'www.qa4.bmogc.net',
//     'Referer': 'https://www.qa4.bmogc.net/banking/bhobssa/www/login',
//     'Authorization': 'Basic QkhPQlRlc3QwM0BvZmZpY2VxYS5hZHJvb3RxYS5ibW9nYy5uZXQ6bmV3RmFsbDIwMTc=',
//     'Cookie': 'XSRF-TOKEN=xsrf',
//     'X-Xsrf-Token': 'xsrf',
//     'Content-Type': 'application/json'
//   },
//   flows: {
//     uiConfig: {
//       url: `/banking/bhobssa/www/api/us-banking/admin/ui-config`,
//       method: 'GET',
//       body: undefined,
//       headers: {},
//       query: undefined,
//     },
//   },
// };

// users
//   .forEach((userName: string) => {

//     const customerId = `${userName}.responseBody.data[0].customer.cisNumber`;

//     [
//       {
//         id: userName,
//         url: `/banking/bhobssa/www/api/us-banking/admin/customers`,
//         method: 'POST',
//         body: {
//           searchQuery: userName,
//         },
//         headers: {},
//         query: undefined,
//       },
//       {
//         id: `${userName}Eligibility`,
//         url: `/banking/bhobssa/www/api/us-banking/enrollment/agent/assisted-channel-eligibility`,
//         method: 'POST',
//         body: {},
//         headers: {},
//         query: {
//           customerId: `{${customerId}}`,
//         },
//       },
//       {
//         id: `${userName}AccessControlls`,
//         url: `/banking/bhobssa/www/api/us-banking/admin/agents-access-controls`,
//         method: 'GET',
//         body: undefined,
//         headers: {},
//         query: {
//           customerId: `{${customerId}}`,
//         },
//       },
//       {
//         id: `${userName}ContactPreferences`,
//         url: `/banking/bhobssa/www/api/us-banking/notification/agent/contact-preferences/{${customerId}}`,
//         method: 'GET',
//         body: undefined,
//         headers: {},
//         query: {
//           includePush: true,
//           bookOfRecord: true,
//         },
//       },
//       {
//         id: `${userName}AlertSubscriptionsGet`,
//         url: `/banking/bhobssa/www/api/us-banking/notification/agent/alert-subscriptions/{${customerId}}`,
//         method: 'GET',
//         body: undefined,
//         headers: {},
//         query: undefined,
//       },
//       {
//         id: `${userName}AlertSubscriptionsPut`,
//         url: `/banking/bhobssa/www/api/us-banking/notification/agent/alert-subscriptions/{${customerId}}`,
//         method: 'PUT',
//         body: [
//           {
//             "props": `{${userName}AlertSubscriptionsGet.responseBody.data[0].props}`,
//             "subscriptionId": `{${userName}AlertSubscriptionsGet.responseBody.data[0].subscriptionId}`,
//             "alertTypeId": `{${userName}AlertSubscriptionsGet.responseBody.data[0].alertTypeId}`,
//             "communicationProfileId": `{${userName}AlertSubscriptionsGet.responseBody.data[0].communicationProfileId}`,
//             "deliveryTarget": `{${userName}AlertSubscriptionsGet.responseBody.data[0].deliveryTarget}`,
//             "changeToken": "828fe939-779c-4643-8bd8-5c7202aceb71",
//             "subscriptionSearchKey": `{${userName}AlertSubscriptionsGet.responseBody.data[0].subscriptionSearchKey}`,
//           }
//         ],
//         headers: {},
//         query: undefined,
//       },
//       {
//         id: `${userName}AccountsGet`,
//         url: `/banking/bhobssa/www/api/us-banking/admin/customer/{${customerId}}/accounts`,
//         method: 'GET',
//         body: undefined,
//         headers: {},
//         query: undefined,
//       },
//       {
//         id: `${userName}AccountDetailsGet`,
//         url: `/banking/bhobssa/www/api/us-banking/admin/customer/{${customerId}}/account/{${userName}AccountsGet.responseBody.data[0].accounts[0].accountId}`,
//         method: 'GET',
//         body: undefined,
//         headers: {},
//         query: undefined,
//       },
//       {
//         id: `${userName}PreferencesGet`,
//         url: `/banking/bhobssa/www/api/us-banking/preference/agent/preferences/{${customerId}}`,
//         method: 'GET',
//         body: undefined,
//         headers: {},
//         query: undefined,
//       },
//       {
//         id: `${userName}TransactionTypesGet`,
//         url: `/banking/bhobssa/www/api/us-banking/transaction/agent/transactions/types`,
//         method: 'GET',
//         body: undefined,
//         headers: {},
//         query: undefined,
//       },
//       {
//         id: `${userName}TransactionTypesGet`,
//         url: `/banking/bhobssa/www/api/us-banking/transaction/agent/{${customerId}}/accounts/{${userName}AccountsGet.responseBody.data[0].accounts[0].accountId}/transactions`,
//         method: 'GET',
//         body: undefined,
//         headers: {},
//         query: {
//           startDate: '2017-07-10',
//           endDate: '2019-01-10',
//         },
//       },
//       {
//         id: `${userName}EntitlementsGet`,
//         url: `/banking/bhobssa/www/api/us-banking/admin/customer/{${customerId}}/accounts/{${userName}AccountsGet.responseBody.data[0].accounts[0].accountId}/entitlement`,
//         method: 'GET',
//         body: undefined,
//         headers: {},
//         query: undefined,
//       },
//       {
//         id: `${userName}AuditGet`,
//         url: `/banking/bhobssa/www/api/us-banking/admin/profile-audit`,
//         method: 'GET',
//         body: undefined,
//         headers: {},
//         query: {
//           startDate: '2019-01-03T18:00:00.000Z',
//           endDate: '2019-01-03T19:00:00.000Z',
//           customerId: `{${customerId}}`,
//         },
//       },
//       {
//         id: `${userName}TransferHistoryGet`,
//         url: `/banking/bhobssa/www/api/us-banking/transfer/agent/history`,
//         method: 'GET',
//         body: undefined,
//         headers: {},
//         query: {
//           start: '2017-07-10',
//           end: '2020-07-10',
//           customerId: `{${customerId}}`,
//         },
//       },
//     ]
//       .forEach(flow => {
//         options.flows[flow.id] = { ...flow } as any;
//       });

//   });

export const options: ScrapOptions = {
  domain: 'https://sandbox-api.coinmarketcap.com',
  headers: {
    'X-CMC_PRO_API_KEY': 'f2e034d1-1259-4f71-8f32-623eeefeeb5d',
  },
  flows: {
    listings: {
      url: `/v1/cryptocurrency/listings/latest`,
      method: 'GET',
      body: undefined,
      headers: undefined,
      query: {
        start: '1',
        limit: '2',
        convert: 'USD',
      },
    },
    info: {
      url: `/v1/cryptocurrency/info`,
      method: 'GET',
      body: undefined,
      headers: undefined,
      query: {
        id: '{listings.responseBody.data[0].id}',
      },
    },
    infoPostTest: {
      url: `/v1/cryptocurrency/info`,
      method: 'POST',
      body: {
        id: '{listings.responseBody.data[0].id}',
        test: 'test',
        deeper: {
          muchDeeper: '{listings.responseBody.data[0].id}',
          muchMuchDeeper: [
            '{listings.responseBody.data[0].id}::number',
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
      url: `/v1/cryptocurrency/info/{listings.responseBody.data[0].id}`,
      savePath: `/v1/cryptocurrency/info/{listings.responseBody.data[0].name}`,
      method: 'GET',
      body: undefined,
      headers: {
        headerTest: 'test1',
        replaceTest: 'Crypto-Name: {listings.responseBody.data[0].name}',
      },
      query: undefined,
    }
  },
};
