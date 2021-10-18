import * as express from 'express';
import * as luxon from 'luxon';

const url = require('url');
var faker = require('faker');

import { Booking } from '../entity/booking';
import bookingData from '../../data/bookings.json';
import * as cache from '../stores';
import log from '../log';
import { nanoid } from 'nanoid';

class ScheduleController {
  public router = express.Router();
  public jsonParser = express.json();
  public path = '/bookings';

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.path, this.getBookings);
    this.router.get(this.path + '/:id', this.getBooking);
    this.router.post(this.path, this.jsonParser, this.postBooking);
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
      log.debug(
        'insertStaticData, Inserted bookings successfully: ' +
          JSON.stringify(bookings)
      );
    } catch (ex) {
      log.error('got error on retreiving promises: ' + ex);
    }
  }

  async getBooking(request: express.Request, response: express.Response) {
    log.debug('getBooking starting...');
    const booking_id = request.params.id;
    let bookingJson = bookingData.bookings.find((b) => {
      // get static json by id (used when no cache entry is present)
      return b.id === booking_id;
    });

    log.debug('getBooking, calling cache for booking_id : ' + booking_id);

    try {
      let sc = new ScheduleController();
      let booking = await cache.getBookingInCache(booking_id);

      if (!booking && bookingJson) {
        log.info(
          `Did not find ${booking_id} in cache, so now inserting booking: ${bookingJson}`
        );
        booking = await sc.upsertCache(bookingJson);
      }

      log.debug('getBooking, Retreived booking: ' + JSON.stringify(booking));
      response.send(booking);
    } catch (ex) {
      log.error('got error on retreiving promises: ' + ex);
    }
  }

  async postBooking(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) {
    log.debug('postBooking starting...');

    try {
      let bookingJson = request.body;
      log.debug('postBooking, request body : ' + JSON.stringify(bookingJson));

      let sc = new ScheduleController();
      let newBooking = await sc.upsertCache(bookingJson);
      log.debug(
        'postBooking, Retreived new booking successfully: ' +
          JSON.stringify(newBooking)
      );
      response.send(newBooking);
    } catch (ex) {
      log.error('got error on retreiving promises: ' + ex);
    }
  }

  async upsertCache(bookingJson: any): Promise<Booking> {
    let bookingObj = JSON.parse(JSON.stringify(bookingJson));
    log.debug('upsertCache start.... booking: ' + JSON.stringify(bookingObj));

    if (!bookingObj.id) {
      bookingObj.id = nanoid(); // generate id
    }

    await cache.upsertBookingInCache(bookingObj);
    bookingObj = await cache.getBookingInCache(bookingObj.id);

    log.debug('upsertCache response: ' + JSON.stringify(bookingObj));
    return bookingObj;
  }
}

export default ScheduleController;
