from django.urls import include, path
from apps.plc_tools import views

urlpatterns = [
    path('register/', views.register_view, name='register_view'),
]