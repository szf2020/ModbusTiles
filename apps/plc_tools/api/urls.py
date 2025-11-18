from django.urls import include, path
from .tags import api_tag_value, api_write_tag

urlpatterns = [
    path("tag/<uuid:external_id>/value/", api_tag_value, name="api_tag_value"),
    path("tag/<uuid:external_id>/write/", api_write_tag, name="api_tag_write"),
]