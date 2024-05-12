import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { addthread } from "../utils/ThreadUtil";
import cloudinary from "../config";
import * as fs from "fs";
import isValidUUID from "../utils/UUIDUtils";

const prisma = new PrismaClient();

export default new (class ReplyService {
  private readonly ReplyRepository = prisma.reply;
  private readonly UserRepository = prisma.user;
  private readonly ThreadRepository = prisma.thread;

  async addReply(req: Request, res: Response): Promise<Response> {
    try {
      const threadId = req.params.threadId;
      if (!isValidUUID(threadId)) {
        return res.status(400).json({ error: "invalid UUID" });
      }

      const userId = res.locals.loginSession.User.id;

      const userSelected = await this.UserRepository.findUnique({
        where: {
          id: userId,
        },
      });

      if (!userSelected)
        return res.status(404).json({ message: "user no found" });

      const threadSelected = await this.ThreadRepository.findUnique({
        where: {
          id: threadId,
        },
      });
      if (!threadSelected)
        return res.status(404).json({ message: "thread no found" });

      const body = req.body;
      const { error } = addthread.validate(body);
      if (error) return res.status(400).json({ message: error.message });

      const file = req.file as unknown as Express.Multer.File;
      let image_url: string = "";

      if (!file) {
        image_url = "";
      } else {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "circle",
        });
        image_url = result.secure_url;
        fs.unlinkSync(file.path);
      }

      const newReply = await this.ReplyRepository.create({
        data: {
          content: body.content,
          image: image_url,
          user: {
            connect: { id: userId },
          },
          thread: {
            connect: { id: threadId },
          },
        },
        select: {
          id: true,
          content: true,
          image: true,
          created_at: true,
          user: {
            select: {
              id: true,
              fullname: true,
              username: true,
              profile_picture: true,
            },
          },
          thread_id: true,
          user_id: true,
        },
      });

      await this.ThreadRepository.update({
        where: { id: threadId },
        data: {
          replies: { connect: { id: newReply.id } },
        },
      });

      return res.status(200).json({
        code: 200,
        message: "add reply success",
        data: newReply,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }

  async updateReply(req: Request, res: Response): Promise<Response> {
    try {
      // const { replyId, threadId } = req.params;
      const threadId = req.params.threadId;
      const replyId = req.params.replyId;

      if (!isValidUUID(replyId) && !isValidUUID(threadId)) {
        return res.status(400).json({ message: "invalid UUID" });
      }

      const userId = res.locals.loginSession.User.id;

      const userSelected = await this.UserRepository.findUnique({
        where: {
          id: userId,
        },
      });

      if (!userSelected)
        return res.status(404).json({ message: "user no found" });

      const threadSelected = await this.ThreadRepository.findUnique({
        where: {
          id: threadId,
        },
      });
      if (!threadSelected)
        return res.status(404).json({ message: "thread no found" });

      const replySelected = await this.ReplyRepository.findUnique({
        where: {
          id: replyId,
        },
      });
      if (!replySelected)
        return res.status(404).json({ message: "reply no found" });

      const body = req.body;
      const { error } = addthread.validate(body);
      if (error) return res.status(400).json({ message: error.message });

      const image = req.file;
      let image_url = "";

      const oldReplyData = await this.ReplyRepository.findUnique({
        where: { id: replyId },
        select: { image: true },
      });

      if (image) {
        const cloudinaryUpload = await cloudinary.uploader.upload(image.path, {
          folder: "circle",
        });
        image_url = cloudinaryUpload.secure_url;
        fs.unlinkSync(image.path);

        if (oldReplyData && oldReplyData.image) {
          const publicId = oldReplyData.image.split("/").pop()?.split(".")[0];
          await cloudinary.uploader.destroy(publicId as string);
        }
      } else {
        image_url = "";
      }

      const updateReply = await this.ReplyRepository.update({
        where: { id: replyId },
        data: {
          content: body.content,
          image: image_url,
          created_at: new Date(),
        },
      });

      return res.status(200).json({
        code: 200,
        message: "update replay success",
        data: updateReply,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }

  async deleteReply(req: Request, res: Response): Promise<Response> {
    try {
      const replyId = req.params.replyId;

      if (!isValidUUID(replyId)) {
        return res.status(400).json({ message: "invalid UUID" });
      }

      const userId = res.locals.loginSession.User.id;

      const userSelect = await this.UserRepository.findUnique({
        where: { id: userId },
      });
      if (!userSelect)
        return res.status(404).json({ message: "user not found" });

      const oldReplyData = await this.ReplyRepository.findUnique({
        where: { id: replyId },
        select: { image: true },
      });

      if (oldReplyData && oldReplyData.image) {
        const publicId = oldReplyData.image.split("/").pop()?.split(".")[0];
        await cloudinary.uploader.destroy(publicId as string);
      }

      const deleteReply = await this.ReplyRepository.delete({
        where: { id: replyId },
      });

      return res.status(200).json({
        code: 200,
        message: "delete replay Success",
        data: deleteReply,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }
})();
