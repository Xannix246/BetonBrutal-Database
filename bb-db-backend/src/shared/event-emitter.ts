import type { EventEmitter2 } from '@nestjs/event-emitter';

let emitter: EventEmitter2;

export function setEventEmitter(value: EventEmitter2) {
  emitter = value;
}

export function getEventEmitter() {
  if (!emitter) {
    throw new Error('EventEmitter not initialized');
  }

  return emitter;
}
