from django.shortcuts import render, redirect
from .services.plc_manager import plc_manager

def register_view(request):
    address = 0

    if request.method == "POST":
        new_value = int(request.POST.get("value"))
        
        new_value = min(new_value, 65535)
        new_value = max(new_value, 0)
        
        plc_manager.write_register(address, new_value)
        return redirect("register_view")
        
    value = plc_manager.get_registers()[0]

    context = {"address": address, "value": value}
    return render(request, "plc_tools/register_view.html", context)