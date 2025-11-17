from django.shortcuts import render
from ..models import Dashboard, DashboardWidget
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required

#http://localhost:8000/dashboard/TestDashboard/
#@login_required
def dashboard_view(request, alias):

    from django.contrib.auth import login
    from django.contrib.auth.models import User

    #TODO remove test code
    if not request.user.is_authenticated:
        test_user = User.objects.get(username="testuser")
        login(request, test_user)

    dashboard = get_object_or_404(
        Dashboard,
        alias=alias,
        owner=request.user
    )

    widgets = DashboardWidget.objects.filter(dashboard=dashboard)

    print("Widgets:", widgets)

    return render(request, "plc_tools/dashboard.html", {
        "dashboard": dashboard,
        "widgets": widgets,
    })