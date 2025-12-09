import asyncio

from main.services.poll_devices import poll_devices
from channels.routing import get_default_application

application = get_default_application()

async def app(scope, receive, send):
    return await application(scope, receive, send)

async def startup():
    print("Starting Modbus Poller...")
    asyncio.create_task(poll_devices())

# Schedule startup once the loop begins
asyncio.get_event_loop().call_soon(asyncio.create_task, startup())