'use strict';

import { get } from 'env-var';

const config = {
  CLUSTER_NAME: get('CLUSTER_NAME').default('redairline-infinispan').asString(),
  NODE_ENV: get('NODE_ENV').default('dev').asEnum(['dev', 'prod']),
  LOG_LEVEL: get('LOG_LEVEL').asString(),

  DATAGRID_BOOKING_DATA_STORE: get('DATAGRID_BOOKING_DATA_STORE')
    .default('bookings')
    .asString(),
/*
  DATAGRID_GAME_DATA_KEY: get('DATAGRID_GAME_DATA_KEY')
    .default('current-game')
    .asString(),
  DATAGRID_PLAYER_DATA_STORE: get('DATAGRID_PLAYER_DATA_STORE')
    .default('players')
    .asString(),
  DATAGRID_MATCH_DATA_STORE: get('DATAGRID_MATCH_DATA_STORE')
    .default('match-instances')
    .asString(),
*/
    DATAGRID_HOST: get('DATAGRID_HOST').default('localhost').asString(),
  DATAGRID_HOTROD_PORT: get('DATAGRID_HOTROD_PORT')
    .default(11222)
    .asPortNumber()

};

export = config;