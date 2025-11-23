from django.urls import include, path
from .views import dashboard_view, events

urlpatterns = [
    path("dashboard/<slug:alias>/", dashboard_view.dashboard_view, name="dashboard"),
    path("events/tag-updates/", events.tag_updates, name="tag_updates_stream"),
]