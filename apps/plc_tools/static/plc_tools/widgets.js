export function updateWidget(widget, type, value) {
    console.log("Updating widget");
    switch (type) {
        case "led":
            const indicator = widget.querySelector(".indicator");
            indicator.style.backgroundColor = value ? "green" : "red";
            break;
        case "val":
            break;
        case "chart":
            break;
        case "button":
            break;
        case "label":
            break;
    }
}