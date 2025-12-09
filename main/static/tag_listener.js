export class TagListener {
    constructor() {
        this.tagMap = {}; // tag_id -> [widgets]
        this.socket = null;
        this.retryInterval = 2000;
    }

    registerWidget(widget) {
        if (!widget.tag) return;
        if (!this.tagMap[widget.tag]) this.tagMap[widget.tag] = [];
        this.tagMap[widget.tag].push(widget);
    }

    connect() {
        const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
        const path = `${protocol}${window.location.host}/ws/dashboard/`;

        this.socket = new WebSocket(path);

        this.socket.onopen = () => {
            console.log("Connected to PLC Stream");
            document.getElementById("connection-banner")?.classList.add("hidden");
            this.sendSubscription();
        };

        this.socket.onmessage = (e) => {
            const payload = JSON.parse(e.data);
            // main.consumers.tag_update
            if (payload.type === "tag_update") {
                this.handleUpdates(payload.data);
            }
        };

        this.socket.onclose = () => {
            console.log("Stream disconnected. Retrying...");
            document.getElementById("connection-banner")?.classList.remove("hidden");
            setTimeout(() => this.connect(), this.retryInterval);
        };
    }

    sendSubscription() {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN)
            return;

        // Get all unique keys from the tagMap
        const tagIds = Object.keys(this.tagMap);

        this.socket.send(JSON.stringify({
            type: "subscribe",
            tags: tagIds
        }));
    }

    handleUpdates(updates) {
        // Use all the new data we got
        Object.keys(updates).forEach(tagId => {
            const tagWidgets = this.tagMap[tagId];
            if(!tagWidgets)
                return;

            const update = updates[tagId];

            tagWidgets.forEach(widget => {
                widget.onData(update);
            });
        });
    }

    clear() {
        this.tagMap = {};
        if(this.socket)
            this.socket.close();
    }
}