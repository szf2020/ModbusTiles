from django.core.management.base import BaseCommand
import uvicorn

class Command(BaseCommand):
    help = "Run Uvicorn with background Modbus poller"

    def handle(self, *args, **options):
        uvicorn.run(
            "modbus_tiles.asgi_with_poller:app",
            host="0.0.0.0",
            port=8000,
            reload=False,
            lifespan="off",
        )