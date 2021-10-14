import bookingData from '../../data/bookings.json';

export class Booking {
  id: string = '';
  flight_id: string = '';
  departure_airport_iata: string = '';
  arrival_airport_iata: string = '';
  estimated_time_departure: string = '';
  estimated_time_arrival: string = '';
  passenger_name: string = '';

  random() {
    const randomElement =
    bookingData.bookings[
        Math.floor(Math.random() * bookingData.bookings.length)
      ];
    let booking: Booking = new Booking();

    booking.id = randomElement.id;
    booking.flight_id = randomElement.flight_id;
    booking.departure_airport_iata = randomElement.departure_airport_iata;
    booking.arrival_airport_iata = randomElement.arrival_airport_iata;
    booking.estimated_time_departure = randomElement.estimated_time_departure;
    booking.estimated_time_arrival = randomElement.estimated_time_arrival;
    booking.passenger_name = randomElement.passenger_name;

    return booking;
  }

  toJSON() {
    id: this.id;
    flight_id: this.flight_id;
    departure_airport_iata: this.departure_airport_iata;
    arrival_airport_iata: this.arrival_airport_iata;
    estimated_time_departure: this.estimated_time_departure;
    estimated_time_arrival: this.estimated_time_arrival;
    passenger_name: this.passenger_name;
  }
}
