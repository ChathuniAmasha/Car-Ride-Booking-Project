from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from connection import send_to_event_hub
from data import generate_uber_ride_confirmation

app = FastAPI(title="Ride Booking App")

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


@app.get("/")
def booking_home(request: Request):
    return templates.TemplateResponse(request, "index.html")


@app.post("/book")
async def book_ride(request: Request):
    """Generate a ride and send to Event Hub, return confirmation JSON."""
    ride = generate_uber_ride_confirmation()
    result = send_to_event_hub(ride)

    if result:
        return JSONResponse({
            "success": True,
            "ride": ride,
            "message": "Ride confirmed and sent to Event Hub"
        })
    else:
        return JSONResponse({
            "success": False,
            "ride": ride,
            "message": "Ride confirmed but Event Hub delivery failed"
        }, status_code=500)


@app.get("/ride/preview")
async def preview_ride():
    """Return a sample ride payload for UI preview purposes."""
    ride = generate_uber_ride_confirmation()
    return JSONResponse(ride)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
