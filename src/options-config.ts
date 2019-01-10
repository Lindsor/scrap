import { ScrapOptions } from "./options";

export const options: ScrapOptions = {
  domain: 'https://www.qa4.bmogc.net/banking/bhobssa/www',
  headers: {
    'X-CMC_PRO_API_KEY': 'f2e034d1-1259-4f71-8f32-623eeefeeb5d',
    'iv-groups': 'BHOB Admin Tool - CSR L2',
    'iv-user': 'BHOBTest03@officeqa.adrootqa.bmogc.net',
    'Host': 'www.qa4.bmogc.net',
    'Referer': 'https://www.qa4.bmogc.net/banking/bhobssa/www/login',
    'Authorization': 'Basic QkhPQlRlc3QwM0BvZmZpY2VxYS5hZHJvb3RxYS5ibW9nYy5uZXQ6bmV3RmFsbDIwMTc=',
    'Cookie': 'XSRF-TOKEN=xsrf',
    'X-Xsrf-Token': 'xsrf',
    'Content-Type': 'application/json'
  },
  flows: [
    {
      id: 'uiConfig',
      url: '/api/us-banking/admin/ui-config',
      method: 'GET',
      body: undefined,
      headers: {},
    },
    {
      id: 'situser002',
      url: '/api/us-banking/admin/customers',
      method: 'POST',
      body: {
        searchQuery: 'situser002',
      },
      headers: {},
    },
    {
      id: 'eligibility',
      url: '/api/us-banking/enrollment/agent/assisted-channel-eligibility?customerId={situser002.data[0].customer.cisNumber}',
      method: 'POST',
      body: {},
      headers: {},
    },
    {
      id: 'accessControlls',
      url: '/api/us-banking/admin/agents-access-controls?customerId={situser002.data[0].customer.cisNumber}',
      method: 'GET',
      body: undefined,
      headers: {},
    },
    {
      id: 'contactPreferences',
      url: '/api/us-banking/notification/agent/contact-preferences/{situser002.data[0].customer.cisNumber}?includePush=true&bookOfRecord=true',
      method: 'GET',
      body: undefined,
      headers: {},
    },
    {
      id: 'alertSubscriptionsGet',
      url: '/api/us-banking/notification/agent/alert-subscriptions/{situser002.data[0].customer.cisNumber}',
      method: 'GET',
      body: undefined,
      headers: {},
    },
    {
      id: 'alertSubscriptionsPut',
      url: '/api/us-banking/notification/agent/alert-subscriptions/{situser002.data[0].customer.cisNumber}',
      method: 'PUT',
      body: [
        {
          "props": '{alertSubscriptionsGet.data[0].props}',
          "subscriptionId": "{alertSubscriptionsGet.data[0].subscriptionId}",
          "alertTypeId": "{alertSubscriptionsGet.data[0].alertTypeId}",
          "communicationProfileId": "{alertSubscriptionsGet.data[0].communicationProfileId}",
          "deliveryTarget": "{alertSubscriptionsGet.data[0].deliveryTarget}",
          "changeToken": "828fe939-779c-4643-8bd8-5c7202aceb71",
          "subscriptionSearchKey": "{alertSubscriptionsGet.data[0].subscriptionSearchKey}"
        }
      ],
      headers: {},
    },
  ],
};