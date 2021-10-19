# redhat-airline-booking-api
running locally
```
npm install
npm run start
http://127.0.0.1:9004/bookings


Calling API Examples:

Get All Bookings
curl http://localhost:9004/bookings -i

Get One Booking
curl http://localhost:9004/bookings/6043 -i

Insert/Update
curl -X POST -H 'Content-Type: application/json' -d '{
        "flight_id": "5007",
        "departure_airport_iata": "ATL",
        "arrival_airport_iata": "DAL",
        "estimated_time_departure": "2021-11-16T16:00:00Z",
        "estimated_time_arrival": "2021-11-16T17:00:00Z",
        "passenger_name": "Lisa Danzer",
        ["id": "6047"]
    }' http://localhost:9004/bookings -i

Delete
curl -X DELETE http://localhost:9004/bookings/2PxE1haE9_IZMgnIC8eTk -i

```
