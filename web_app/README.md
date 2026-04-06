# ride. — Uber Ride Booking Web App

A full-stack ride booking web app built with FastAPI + Jinja2 that streams ride confirmations to Azure Event Hub.

## Project Structure

```
ride_app/
├── api.py                  # FastAPI app — routes & server
├── data.py                 # Ride data generator (all mapping tables + faker)
├── connection.py           # Azure Event Hub producer
├── requirements.txt
├── .env                    # ← create this (see below)
├── templates/
│   └── index.html          # Full-page web UI
└── static/
    ├── css/
    │   └── app.css         # All styles
    └── js/
        └── app.js          # Frontend interactivity
```

## Setup

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Create `.env`
```
CONNECTION_STRING=Endpoint=sb://<namespace>.servicebus.windows.net/;SharedAccessKeyName=...;SharedAccessKey=...
EVENT_HUBNAME=your-event-hub-name
```

### 3. Run
```bash
python api.py
# or
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

Open http://localhost:8000

## API Endpoints

| Method | Path           | Description                                      |
|--------|----------------|--------------------------------------------------|
| GET    | `/`            | Render the booking UI                            |
| POST   | `/book`        | Generate a ride, send to Event Hub, return JSON  |
| GET    | `/ride/preview`| Return a sample ride payload (no Event Hub send) |

## How It Works

1. User picks a ride type and clicks **Confirm booking**
2. `POST /book` calls `generate_uber_ride_confirmation()` from `data.py`
3. The ride dict is serialised to JSON and sent to Azure Event Hub via `send_to_event_hub()`
4. The confirmation is returned as JSON and displayed in the modal

## Data Schema

Each ride record includes:
- UUIDs for ride, passenger, driver, vehicle, and locations
- Foreign keys to all mapping tables (vehicle type, make, payment method, city, ride status, cancellation reason)
- Full passenger & driver info (faker-generated)
- Pickup / dropoff coordinates and addresses
- Fare breakdown: base, distance, time, surge multiplier, tip, total
- Timestamps: booking, pickup, dropoff
