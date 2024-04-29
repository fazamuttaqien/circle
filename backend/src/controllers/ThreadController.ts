import { Request, Response } from "express";
import ThreadService from "../services/ThreadService";
import ThreadsQueue from "../queue/ThreadsQueue";

export default new (class AuthController {
  findAll(req: Request, res: Response) {
    ThreadService.findAll(req, res);
  }
  findByID(req: Request, res: Response) {
    ThreadService.findByID(req, res);
  }
  addThread(req: Request, res: Response) {
    ThreadService.addThread(req, res);
  }
  updateThread(req: Request, res: Response) {
    ThreadService.updateThread(req, res);
  }
  deleteThread(req: Request, res: Response) {
    ThreadService.deleteThread(req, res);
  }
  findAllRedis(req: Request, res: Response) {
    ThreadService.findAllRedis(req, res);
  }

  addThreadQueue(req: Request, res: Response) {
    ThreadsQueue.addThreadQueue(req, res);
  }

  updateThreadQueue(req: Request, res: Response) {
    ThreadsQueue.updateThreadQueue(req, res);
  }
})();
