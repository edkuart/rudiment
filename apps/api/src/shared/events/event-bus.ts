import { EventEmitter } from "events";
import { logger } from "../utils/logger.js";

type EventPayloads = {
  "billing.subscription.activated": { userId: string; planId: string; subscriptionId: string };
  "billing.subscription.cancelled": { userId: string; subscriptionId: string };
  "billing.subscription.past_due": { userId: string; subscriptionId: string };
  "video.asset.ready": { lessonId: string; muxAssetId: string; muxPlaybackId: string };
  "video.asset.errored": { lessonId: string; muxAssetId: string };
  "progress.lesson.completed": { userId: string; lessonId: string; courseId: string };
};

type EventName = keyof EventPayloads;

class TypedEventBus extends EventEmitter {
  override emit<K extends EventName>(event: K, payload: EventPayloads[K]): boolean {
    logger.debug({ event, payload }, "Event emitted");
    return super.emit(event, payload);
  }

  override on<K extends EventName>(
    event: K,
    listener: (payload: EventPayloads[K]) => void | Promise<void>,
  ): this {
    return super.on(event, (payload: EventPayloads[K]) => {
      void Promise.resolve(listener(payload)).catch((err: unknown) => {
        logger.error({ err, event }, "Event handler error");
      });
    });
  }
}

export const eventBus = new TypedEventBus();
