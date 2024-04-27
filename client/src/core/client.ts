import { Client } from "colyseus.js";

const loc = window.location
const wsURL = new URL('', window.location.href);
if (loc.protocol === "https:") {
  wsURL.protocol = "wss:";
} else {
  wsURL.protocol = "ws:";
}
wsURL.port = '2567'

export var client = new Client(wsURL.href);
