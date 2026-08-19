import { EventEmitter } from "events";

if (!global._notifyEmitter) {
  global._notifyEmitter = new EventEmitter();
  global._notifyEmitter.setMaxListeners(0);
}

export const notifyEmitter = global._notifyEmitter;