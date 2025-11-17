from django.core.management.base import BaseCommand, CommandError
from ...models import Device, Tag, Dashboard, DashboardWidget
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    def handle(self, *args, **options):
        device, created = Device.objects.get_or_create(
            alias="TestPLC"
        )

        tag, created = Tag.objects.get_or_create(
            device=device,
            alias="Test Coil",
            register_count=1,
            defaults={
                "channel": Tag.ChannelChoices.COIL,
                "data_type": Tag.DataTypeChoices.BOOL,
                "address": 0,
            },
        )

        user, created = User.objects.get_or_create(
            username="testuser",
            defaults={
                "email": "test@example.com",
                "is_staff": True,
            }
        )
        if created:
            user.set_password("test1234")
            user.save()

        dashboard, created = Dashboard.objects.get_or_create(
            owner=user,
            alias="TestDashboard",
        )

        widget, created = DashboardWidget.objects.get_or_create(
            dashboard=dashboard,
            defaults={
                "widget_type": DashboardWidget.WidgetTypeChoices.LED,
                "tag": tag,
                "config": {
                    "x": 1000,
                    "y": 1000,
                    "color_on": "green",
                    "color_off": "red",
                    "label": "Test Coil"
                }
            }
        )
        