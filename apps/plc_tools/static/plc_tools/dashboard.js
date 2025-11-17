import { updateWidget } from './widgets.js'

document.querySelectorAll(".widget").forEach(widget => {

    const tagId = widget.dataset.tag;
    const widgetType = widget.dataset.type;

    console.log("Found widget with id ", tagId, " type ", widgetType);

    setInterval(() => { //TODO handle failed to fetch error?
        fetch(`/api/tag/${tagId}/value/`)
            .then(response => response.json())
            .then(data => {
                updateWidget(widget, widgetType, data.value);
            });
    }, 500);

});