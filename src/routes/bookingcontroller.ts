import * as express from 'express';
import * as luxon from 'luxon';

const url = require('url');
var faker = require('faker');

import { Booking } from '../entity/booking';
import bookingData from '../../data/bookings.json';
import * as cache from '../stores';
import log from '../log';

class ScheduleController {
  public router = express.Router();
  public path = '/bookings';

  constructor() {
    this.intializeRoutes();
    this.getFromCache = this.getFromCache.bind(this);
  }

  public intializeRoutes() {
    this.router.get(this.path, this.getBookings);
    this.router.get(this.path + '/id', this.getBooking);
  }

  async getBookings(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) {
    try {
      const promises = bookingData.bookings.map((bookingJson) => {
        log.debug('getBookings calling cache for booking_id : ' + bookingJson.id);
        let sc = new ScheduleController();
        return sc.getFromCache(bookingJson, bookingJson.id);
      });
      let bookings = await Promise.all(promises);
      log.debug('Retreived bookings successfully: ' + JSON.stringify(bookings));
      response.send(bookings);
    } catch (ex) {
      log.error('got error on retreiving promises: ' + ex);
      next(ex);
    }
  }

  async getBooking (request: express.Request, response: express.Response) {
    // const code = request.params.code.toLowerCase();
    // const booking = bookingData.airports.find((a) => {
    //   return a.iata.toLowerCase() === code || a.icao.toLowerCase() === code;
    // });
    // response.send(airport);

    const booking_id = request.params.id.toLowerCase();
    let bookingJson = bookingData.bookings.find((b) => {
      return b.id === booking_id;
    });

    log.debug('getBookings calling cache for booking_id : ' + booking_id);

    try {
      let sc = new ScheduleController();
      let booking = await sc.getFromCache(bookingJson, booking_id);
      log.debug('Retreived booking successfully: ' + JSON.stringify(booking));
      response.send(booking);
    } catch (ex) {
      log.error('got error on retreiving promises: ' + ex);
    }
  };

  async getFromCache(bookingJson: any, booking_id: string): Promise<Booking> {
    // {"iata":"ATL","icao":"KATL","name":"Hartsfield Jackson Atlanta International Airport","city":"Atlanta","state":"Georgia","country":"US","tz":"America/New_York","elevation":1026,"latitude":33.6366996765,"longitude":-84.4281005859}
    let bookingObj;
    if (!bookingJson) {
      booking_id = bookingJson.id;
      log.debug('getFromCache start.... for ' + booking_id);
      bookingObj = JSON.parse(JSON.stringify(bookingJson));
    }

    if (booking_id) {
      let booking = await cache.getBookingInCache(booking_id);
      log.info('Booking cache for ' + booking_id + ' : ' + JSON.stringify(booking_id));

      if (!booking) {
        log.info(
          `Did not find ${booking_id} in cache, so now inserting booking: ${bookingJson}`
        );

        if (!bookingObj) {
          await cache.upsertBookingInCache(bookingObj);
        }

        // try {
        //   await cache.upsertAirportInCache(airportObj);
        //   log.info('Successfully stored in cache for ${iata}');
        // } catch {
        //   log.error('Could not update the cache for ${iata}');
        // }
      }
    }

    return bookingObj;
  }

}

export default ScheduleController;
