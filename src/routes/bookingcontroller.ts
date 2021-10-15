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
    this.router.get(this.path + '/:id', this.getBooking);
  }

  async getBookings(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) {
    try {
      let bookings = await cache.getAllBookingsInCache();
      log.debug('Retreived bookings successfully: ' + JSON.stringify(bookings));

      if (!bookings || bookings.length == 0) {
        let sc = new ScheduleController();
        await sc.insertStaticData();
        bookings = await cache.getAllBookingsInCache();
      }

      response.send(bookings);
    } catch (ex) {
      log.error('error getting all bookings: ' + ex);
      next(ex);
    }
  }

  async insertStaticData() {
    try {
      const promises = bookingData.bookings.map((bookingJson) => {
        let bookingObj = JSON.parse(JSON.stringify(bookingJson));
        cache.upsertBookingInCache(bookingObj);
      });
      let bookings = await Promise.all(promises);
      log.debug('Inserted bookings successfully: ' + JSON.stringify(bookings));
    } catch (ex) {
      log.error('got error on retreiving promises: ' + ex);
    }
  }

  async getBooking(request: express.Request, response: express.Response) {
    // const code = request.params.code.toLowerCase();
    // const booking = bookingData.airports.find((a) => {
    //   return a.iata.toLowerCase() === code || a.icao.toLowerCase() === code;
    // });
    // response.send(airport);
    log.debug('getBooking starting...');
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
  }

  async getFromCache(bookingJson: any, booking_id: string): Promise<Booking> {
    // {"iata":"ATL","icao":"KATL","name":"Hartsfield Jackson Atlanta International Airport","city":"Atlanta","state":"Georgia","country":"US","tz":"America/New_York","elevation":1026,"latitude":33.6366996765,"longitude":-84.4281005859}
    let bookingObj;
    if (bookingJson) {
      booking_id = bookingJson.id;
      log.debug('getFromCache start.... for ' + booking_id);
      bookingObj = JSON.parse(JSON.stringify(bookingJson));
    }

    if (booking_id) {
      let booking = await cache.getBookingInCache(booking_id);
      log.info(
        'getFromCache, cache for booking ' + booking_id + ' : ' + booking_id
      );

      if (!booking) {
        log.info(
          `Did not find ${booking_id} in cache, so now inserting booking: ${bookingJson}`
        );

        if (bookingObj) {
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
