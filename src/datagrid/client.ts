import { InfinispanClient, ClientEvent, InfinispanNode } from 'infinispan';
import { DATAGRID_HOST, DATAGRID_HOTROD_PORT } from '../config';
import infinispan from 'infinispan';
import log from '../log';

// Cache configuration
// {
//   "distributed-cache": {
//     "mode": "SYNC",
//     "encoding": {
//       "key": {
//         "media-type": "text/plain"
//       },
//       "value": {
//         "media-type": "text/plain"
//       }
//     }
//   }
// }

export type DataGridEventHandle = (
  client: InfinispanClient,
  event: ClientEvent,
  key: string
) => void;

async function getClient(
  nodes: InfinispanNode[],
  cacheName: string
): Promise<InfinispanClient> {
  log.info(
    `trying to connect to infinispan with host ${DATAGRID_HOST} and port ${DATAGRID_HOTROD_PORT}`
  );
  const client = await infinispan.client(nodes, {
    cacheName: cacheName,
    version: '2.9',
    authentication: {
      enabled: false,
      saslProperties: {},
      saslMechanism: 'DIGEST-MD5',
      userName: 'admin',
      password: 'password',
      serverName: 'infinispan',
      realm: 'default',
      token: '',
    },
    dataFormat: {
      keyType: 'text/plain',
      valueType: 'text/plain',
    },
  });
  log.info(
    `connected to infinispan host ${DATAGRID_HOST} for "${cacheName}" cache`
  );

  const stats = await client.stats();
  log.info(`stats for "${cacheName}":\n`, JSON.stringify(stats, null, 2));

  return client;
}

export default async function getDataGridClientForCacheNamed(
  cacheName: string,
  eventHandler?: DataGridEventHandle
): Promise<InfinispanClient> {
  log.info(`creating infinispan client for cache named "${cacheName}"`);

  const nodes = [
    {
      host: DATAGRID_HOST,
      port: DATAGRID_HOTROD_PORT,
    },
  ];

  const client = await getClient(nodes, cacheName);

  if (eventHandler) {
    const listenerId = await client.addListener('create', (key) =>
      eventHandler(client, 'create', key)
    );

    await client.addListener(
      'modify',
      (key) => eventHandler(client, 'modify', key),
      { listenerId }
    );
  }

  return client;
}
