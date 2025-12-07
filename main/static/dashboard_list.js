import { postServer } from "./util.js";

function createDashboard() {
    const names = [];
    document.querySelectorAll(".dashboard-title").forEach((elem) => {
        names.push(elem.textContent);
    })

    let i = 0;
    let name = null;
    while(true) {
        name = "Untitled" + i;
        i++;
        if(!names.includes(name))
            break;
    }
    
    const payload = {
        alias: name,
        description: "",
    };
    postServer("/api/dashboards/", payload, () => {
        window.location.href = "/dashboard/" + name;
    });
}

document.getElementById("create-dashboard").onclick = createDashboard;