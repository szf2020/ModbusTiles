import json
from datetime import timedelta
from django.http import JsonResponse
from ..models import TagHistoryEntry, Tag, DashboardWidget, TagWriteRequest, ActivatedAlarm
from django.views.decorators.http import require_GET, require_POST
from django.shortcuts import get_object_or_404
from django.utils import timezone


@require_GET
def api_tag_value(request, external_id):
    """ Returns value, time, and alarm data about the tag stored in the database """

    tag = get_object_or_404(Tag, external_id=external_id)

    return JsonResponse(tag.get_client_data())


@require_GET
def api_tag_values(request): #TODO move some logic to models?
    """ Returns data for multiple tags """

    tag_ids = request.GET.get("tags", "").split(",")
    
    if not tag_ids:
        return JsonResponse({"error": "No tags specified"}, status=400)

    tags = Tag.objects.filter(external_id__in=tag_ids) #TODO get_unchanged bool?

    if not tags.exists():
        return JsonResponse({"error"}, "Requested tags not found", status=404)
    
    results = Tag.get_client_data_multiple(tags)

    return JsonResponse(results)


@require_GET
def api_tag_history(request, external_id):
    tag = get_object_or_404(Tag, external_id=external_id)
    
    seconds = int(request.GET.get('seconds', 60))
    entries = tag.get_history(timedelta(seconds=seconds))

    return JsonResponse({
        "history": list(entries)
    })

@require_POST
#@login_required
def api_write_tag(request, external_id):
    """ Adds a write request into the database for a specific tag and value """

    tag = get_object_or_404(Tag, external_id=external_id)

    data = json.loads(request.body)
    value = data.get("value")

    if value is None:
        return JsonResponse({"error": "No value supplied"}, status=400)
    else:
        tag.request_change(value)
        return JsonResponse({"status": "queued"})