from django.apps import AppConfig
import sys, os

class PlcToolsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.plc_tools'

    def ready(self):
        pass