import { DATAGRID_BOOKING_DATA_STORE, NODE_ENV } from '../config';
import getDataGridClientForCacheNamed from '../datagrid/client';
import { Booking } from '../entity/booking';
import log from '../log';
import { nanoid } from 'nanoid';

const getClient = getDataGridClientForCacheNamed(DATAGRID_BOOKING_DATA_STORE);

export async function getAllBookingsInCache(): Promise<
  Array<Booking> | undefined
> {
  log.debug(`getAllBookingsInCache start...`);
  let bookings: Booking[] = new Array<Booking>();
  try {
    const client = await getClient;
    let iterator = await client.iterator(1);

    // let entry = {done: true};
    let entry = await iterator.next();

    while (!entry.done) {
      let booking = JSON.parse(entry.value);
      console.log('iterator booking=' + booking);
      bookings.push(booking);

      entry = await iterator.next();
    }

    await iterator.close();
    return bookings;
  } catch (ex) {
    log.error("couldn't get the client:" + ex);
    return undefined;
  }
}

/**
 * Returns an instance of a Airport from the cache, or undefined if the airport
 * was not found in the cache
 * @param iata
 */
export async function getBookingInCache(
  booking_id: string
): Promise<Booking | undefined> {
  log.debug(`getBookingInCache for booking id: ${booking_id}`);

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
  if (!booking.id) {
    booking.id = nanoid();
  }
  const data = JSON.stringify(booking);
  log.debug(`with data : ` + data);

  try {
    const client = await getClient;
    await client.put(booking.id, data);
  } catch (ex) {
    log.error("couldn't get the client:" + ex);
  }
}
