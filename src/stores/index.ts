import { DATAGRID_BOOKING_DATA_STORE, NODE_ENV } from '../config';
import getDataGridClientForCacheNamed from '../datagrid/client';
import { Booking } from '../entity/booking';
import log from '../log';

const getClient = getDataGridClientForCacheNamed(DATAGRID_BOOKING_DATA_STORE);

/**
 * Returns an instance of a Airport from the cache, or undefined if the airport
 * was not found in the cache
 * @param iata
 */
export async function getBookingInCache(
  booking_id: string
): Promise<Booking | undefined> {
  log.debug(`getBookingInCache for bookking id: ${booking_id}`);

  let data = undefined;
  try {
    const client = await getClient;
    data = await client.get(booking_id);
    log.debug(`getAirportInCache, cache data for ${booking_id}: ` + data);
  } catch (ex) {
    log.error("couldn't get the client:" + ex);
    return undefined;
  }

  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      log.warn(
        `found airport data for "${booking_id}", but failed to parse to JSON: %j`,
        data
      );
      return undefined;
    }
  } else {
    return undefined;
  }
}

/**
 * Insert/Update the airport entry in the cache
 * @param booking
 */
export async function upsertBookingInCache(booking: Booking) {
  log.debug(`upsertBookingInCache for ${booking.id}`);
  const data = JSON.stringify(booking);
  log.debug(`with data : ` + data);

  try {
    const client = await getClient;
    return client.put(booking.id, data);
  } catch (ex) {
    log.error("couldn't get the client:" + ex);
  }
}
