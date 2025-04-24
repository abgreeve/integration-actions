import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';
import { kvs, WhereConditions } from '@forge/kvs';

const getIssues = async () => {

  var bodyData = `{
    "fields": [
      "id, key"
    ],
    "fieldsByKeys": true,
    "jql": "project = 'MDL' and status in ('Waiting for integration review', 'Integration review in progress') ORDER BY created DESC",
    "maxResults": 273
  }`;

  const response = await api.asApp().requestJira(route`/rest/api/3/search/jql`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: bodyData
  });

  // console.log(`Response: ${response.status} ${response.statusText}`);
  // console.log(await response.json());
  if (response.status == '200') {
    return await response.json();
  }
  return {};
};

const sendMessage = async (issue) => {
  console.log(issue.id);
  let rebasemessage = await getKVS();
  var bodyData = `{
    "body": {
      "content": [
        {
          "content": [
            {
              "text": "${rebasemessage.payload}",
              "type": "text"
            }
          ],
          "type": "paragraph"
        }
      ],
      "type": "doc",
      "version": 1
    }
  }`;
  const response = await api.asApp().requestJira(route`/rest/api/3/issue/${issue.id}/comment`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: bodyData
  });

  console.log(`Response: ${response.status} ${response.statusText}`);
  // console.log(await response.json());
}

const getKVS = async () => {
  return kvs.get('integration-message');
};

const resolver = new Resolver();

resolver.define('getText', async (req) => {
  // Actually might use this to fetch the rebase message if it is set.
  const message = await getKVS();
  if (typeof message == 'undefined') {
    return '';
  }
  console.log(req);
  return message.payload;
});

resolver.define('updateIssues', async () => {
  console.log('Go and update issues');
  // Rest API call to get all issues awaiting for integration.
  let issuedata = await getIssues();
  issuedata.issues.forEach((issue) => {
    sendMessage(issue);
  });
});

resolver.define('updateRebaseMessage', async (message) => {
  console.log(message);
  kvs.set('integration-message', message);
});

export const handler = resolver.getDefinitions();
