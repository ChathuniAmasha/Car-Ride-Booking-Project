import json
import logging
import os
from dotenv import load_dotenv

load_dotenv()

from azure.eventhub import EventHubProducerClient, EventData

from data import generate_uber_ride_confirmation

logger = logging.getLogger(__name__)

CONNECTION_STRING = os.getenv("CONNECTION_STRING")
EVENT_HUBNAME     = os.getenv("EVENT_HUBNAME")


def send_to_event_hub(ride_data: dict) -> bool:
    """
    Serialize ride_data to JSON and send it as a single event to Azure Event Hub.

    Args:
        ride_data: Dict produced by generate_uber_ride_confirmation().

    Returns:
        True on success, False on any error.
    """
    if not CONNECTION_STRING or not EVENT_HUBNAME:
        logger.error("EVENT HUB: CONNECTION_STRING or EVENT_HUBNAME env var missing.")
        return False

    try:
        producer = EventHubProducerClient.from_connection_string(
            CONNECTION_STRING,
            eventhub_name=EVENT_HUBNAME,
        )

        ride_json   = json.dumps(ride_data)
        event_batch = producer.create_batch()
        event_batch.add(EventData(ride_json))
        producer.send_batch(event_batch)
        producer.close()

        logger.info("EVENT HUB: ride %s sent successfully.", ride_data.get("ride_id"))
        return True

    except Exception as exc:
        logger.exception("EVENT HUB: failed to send ride %s — %s", ride_data.get("ride_id"), exc)
        return False


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("=" * 60)
    print("SINGLE RIDE TEST")
    print("=" * 60)
    ride = generate_uber_ride_confirmation()
    print(json.dumps(ride, indent=2))

    print("\n" + "=" * 60)
    print("SENDING TO EVENT HUB …")
    ok = send_to_event_hub(ride)
    print("Result:", "OK" if ok else "FAILED")
