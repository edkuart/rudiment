import type { Request, Response, NextFunction } from "express";
import type { VideoService } from "./video.service.js";

export class VideoController {
  constructor(private readonly service: VideoService) {}

  createUpload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lessonId } = req.body as { lessonId: string };
      const result = await this.service.createDirectUpload(lessonId);
      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  };

  getPlaybackToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lessonId } = req.params as { lessonId: string };
      const result = await this.service.getPlaybackToken(lessonId);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  };

  handleMuxWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const signature = req.headers["mux-signature"] as string;
      if (!signature) {
        res.status(400).json({ error: "Missing mux-signature header" });
        return;
      }
      await this.service.handleMuxWebhook(req.body as string, signature);
      res.json({ received: true });
    } catch (err) {
      next(err);
    }
  };
}
