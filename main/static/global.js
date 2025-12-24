/** @import { ServerCacheObject } from "./types.js" */

/** 
 * Collection of object metadata from the server
 * @type {ServerCacheObject} 
 */
export const serverCache = {
    tags: [],
    devices: [],
    tagOptions: [],
    alarmOptions: [],
}

/**
 * Requests an update for {@link serverCache}
 * 
 * Called on page load or when an alarm or tag is created
 */
export async function refreshData() { //TODO options?
    try {
        // Fetch Tags and Devices in parallel
        const [tagsResp, devicesResp, tagOptions, alarmOptions] = await Promise.all([
            fetch('/api/tags/'),
            fetch('/api/devices/'),
            fetch('/api/tag-options/'),
            fetch('/api/alarm-options/')
        ]);

        serverCache.tags = await tagsResp.json();
        serverCache.devices = await devicesResp.json();
        serverCache.tagOptions = await tagOptions.json();
        serverCache.alarmOptions = await alarmOptions.json();
        console.log("Data loaded:", serverCache);
        return true;
    } 
    catch (err) {
        console.error("Failed to load editor data", err);
        alert("Could not load Tags/Devices"); //TODO show no connection banner, keep trying?
        return false;
        // would need to refactor logic for banner a bit
    }
}

/**
 * Get the value of a cookie by name
 * @param {string} name 
 * @returns {string}
 */
export function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

/**
 * Send POST request with CSRFToken and payload at the given endpoint
 * @param {string} input 
 * @param {Object} payload 
 * @param {(data: Object) => any} successCallback Performed if a success response is recieved
 * @returns 
 */
export async function postServer(input, payload, successCallback) {
    const isFormData = payload instanceof FormData;

    // Headers
    const headers = {
        'X-CSRFToken': getCookie('csrftoken')
    };

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    // Body
    const body = isFormData ? payload : JSON.stringify(payload);

    try {
        const response = await fetch(input, {
            method: 'POST',
            headers: headers,
            body: body
        });

        if (response.ok) {
            const data = await response.json();
            if (successCallback) 
                successCallback(data);
            return true;
        } 
        else {
            // Try to parse error message, fallback to status text
            let errMsg = response.statusText;
            try {
                const err = await response.json();
                errMsg = JSON.stringify(err);
            } catch (e) { /* ignore JSON parse error on 500s */ }
            
            alert("Error: " + errMsg);
        }
    } 
    catch (e) {
        console.error("Network or Logic Error:", e);
        //alert("A network error occurred.");
    }
    return false;
}