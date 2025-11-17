from django.urls import include, path
from .tags import api_tag_value

urlpatterns = [
    path("tag/<uuid:external_id>/value/", api_tag_value, name="api_tag_value"),
]