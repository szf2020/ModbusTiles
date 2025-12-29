import { requestServer } from "./global.js";

/**
 * Register a new dashboard on the server, then redirect to it
 */
function createDashboard() {
    const payload = {
        alias: "",
        description: "",
    };
    requestServer("/api/dashboards/", 'POST', payload, (data) => {
        window.location.href = "/dashboard/" + data.alias;
    });
}

document.getElementById("create-dashboard").onclick = createDashboard;