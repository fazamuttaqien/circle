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
      const threadId = req.params.threadID;
      if (!isValidUUID(threadId)) {
        return res.status(400).json({ error: "Invalid UUID" });
      }

      const userId = res.locals.loginSession.User.id;

      const userSelected = await this.UserRepository.findUnique({
        where: {
          ID: userId,
        },
      });

      if (!userSelected)
        return res.status(404).json({ message: "User no found" });

      const threadSelected = await this.ThreadRepository.findUnique({
        where: {
          ID: threadId,
        },
      });
      if (!threadSelected)
        return res.status(404).json({ message: "Thread no found" });

      const body = req.body;
      const { error } = addthread.validate(body);
      if (error) return res.status(400).json({ message: error.message });

      const file = req.file as unknown as Express.Multer.File;
      let imageURL: string = "";

      if (!file) {
        imageURL = "";
      } else {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "circle",
        });
        imageURL = result.secure_url;
        fs.unlinkSync(file.path);
      }

      const newReply = await this.ReplyRepository.create({
        data: {
          content: body.content,
          image: imageURL,
          user: {
            connect: { ID: userId },
          },
          thread: {
            connect: { ID: threadId },
          },
        },
        select: {
          ID: true,
          content: true,
          image: true,
          createdAt: true,
          user: {
            select: {
              ID: true,
              fullname: true,
              username: true,
              profilePicture: true,
            },
          },
          threadID: true,
          userID: true,
        },
      });

      await this.ThreadRepository.update({
        where: { ID: threadId },
        data: {
          replies: { connect: { ID: newReply.ID } },
        },
      });

      return res.status(200).json({
        code: 200,
        message: "Add reply success",
        data: newReply,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }

  async updateReply(req: Request, res: Response): Promise<Response> {
    try {
      // const { replyID, threadID } = req.params;
      const threadId = req.params.threadID;
      const replyId = req.params.replyID;

      if (!isValidUUID(replyId) && !isValidUUID(threadId)) {
        return res.status(400).json({ message: "Invalid UUID" });
      }

      const userId = res.locals.loginSession.User.id;

      const userSelected = await this.UserRepository.findUnique({
        where: {
          ID: userId,
        },
      });

      if (!userSelected)
        return res.status(404).json({ message: "User not found" });

      const threadSelected = await this.ThreadRepository.findUnique({
        where: {
          ID: threadId,
        },
      });
      if (!threadSelected)
        return res.status(404).json({ message: "Thread not found" });

      const replySelected = await this.ReplyRepository.findUnique({
        where: {
          ID: replyId,
        },
      });
      if (!replySelected)
        return res.status(404).json({ message: "Reply not found" });

      const body = req.body;
      const { error } = addthread.validate(body);
      if (error) return res.status(400).json({ message: error.message });

      const image = req.file;
      let imageURL = "";

      const oldReplyData = await this.ReplyRepository.findUnique({
        where: { ID: replyId },
        select: { image: true },
      });

      if (image) {
        const cloudinaryUpload = await cloudinary.uploader.upload(image.path, {
          folder: "circle",
        });
        imageURL = cloudinaryUpload.secure_url;
        fs.unlinkSync(image.path);

        if (oldReplyData && oldReplyData.image) {
          const publicId = oldReplyData.image.split("/").pop()?.split(".")[0];
          await cloudinary.uploader.destroy(publicId as string);
        }
      } else {
        imageURL = oldReplyData?.image || "";
      }

      const updateReply = await this.ReplyRepository.update({
        where: { ID: replyId },
        data: {
          content: body.content,
          image: imageURL,
          createdAt: new Date(),
          isEdited: true,
        },
      });

      return res.status(200).json({
        code: 200,
        message: "Update reply success",
        data: updateReply,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }

  async deleteReply(req: Request, res: Response): Promise<Response> {
    try {
      const replyId = req.params.replyID;

      if (!isValidUUID(replyId)) {
        return res.status(400).json({ message: "Invalid UUID" });
      }

      const userId = res.locals.loginSession.User.id;

      const userSelect = await this.UserRepository.findUnique({
        where: { ID: userId },
      });
      if (!userSelect)
        return res.status(404).json({ message: "User not found" });

      const oldReplyData = await this.ReplyRepository.findUnique({
        where: { ID: replyId },
        select: { image: true },
      });

      if (oldReplyData && oldReplyData.image) {
        const publicId = oldReplyData.image.split("/").pop()?.split(".")[0];
        await cloudinary.uploader.destroy(publicId as string);
      }

      const deleteReply = await this.ReplyRepository.delete({
        where: { ID: replyId },
      });

      return res.status(200).json({
        code: 200,
        message: "Delete reply success",
        data: deleteReply,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }
})();
