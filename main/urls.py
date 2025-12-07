from django.urls import include, path
from .views import dashboards

urlpatterns = [
    path("dashboard/<slug:alias>/", dashboards.dashboard_view, name="dashboard"),
    path("dashboards/", dashboards.dashboard_list, name="dashboards"),
]