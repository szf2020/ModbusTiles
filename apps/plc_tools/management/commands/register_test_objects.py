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
            description="PLC coil 0",
            register_count=1,
            defaults={
                "channel": Tag.ChannelChoices.COIL,
                "data_type": Tag.DataTypeChoices.BOOL,
                "address": 0,
            },
        )
        tag2, created = Tag.objects.get_or_create(
            device=device,
            alias="Test Coil 2",
            description="PLC coil 1",
            register_count=1,
            defaults={
                "channel": Tag.ChannelChoices.COIL,
                "data_type": Tag.DataTypeChoices.BOOL,
                "address": 1,
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

        widget = DashboardWidget.objects.create(
            dashboard=dashboard,
            tag=tag,
            widget_type=DashboardWidget.WidgetTypeChoices.LED,
            config = {
                "position_x": 100,
                "position_y": 100,
                "scale_x" : 3,
                "scale_y" : 3,
                "color_on": "green",
                "color_off": "red",
                "label": "Test Coil"
            }
        )
        widget = DashboardWidget.objects.create(
            dashboard=dashboard,
            tag=tag2,
            widget_type=DashboardWidget.WidgetTypeChoices.LED,
            config = {
                "position_x": 200,
                "position_y": 100,
                "scale_x" : 3,
                "scale_y" : 3,
                "color_on": "green",
                "color_off": "red",
                "label": "Test Coil 2"
            }
        )
        widget = DashboardWidget.objects.create(
            dashboard=dashboard,
            widget_type=DashboardWidget.WidgetTypeChoices.LABEL,
            config = {
                "position_x": 100,
                "position_y": 30,
                "scale_x" : 2,
                "scale_y" : 2,
                "text" : "Test Coils",
                "label": ""
            }
        )
        