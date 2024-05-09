import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import cloudinary from "../config";
import * as fs from "fs";
import { addthread } from "../utils/ThreadUtil";
import amqp from "amqplib";

const prisma = new PrismaClient();

function isValidUUID(uuid: string): boolean {
  const UUIDRegex =
    /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
  // const UUIDRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{3}-[a-f0-9]{3}-[a-f0-9]{12}$/i
  return UUIDRegex.test(uuid);
}

export default new (class ThreadsQueue {
  private readonly UserRepository = prisma.user;
  private readonly ThreadRepository = prisma.thread;

  async addThreadQueue(req: Request, res: Response): Promise<Response> {
    try {
      const body = req.body;
      const { error } = addthread.validate(body);
      if (error) return res.status(400).json({ message: error.message });

      const userId = res.locals.loginSession.User.id;

      const userSelect = await this.UserRepository.findUnique({
        where: { id: userId },
      });
      if (!userSelect)
        return res.status(404).json({ message: "User not found" });

      let image_url: string[] = [];

      // Check if multiple files are uploaded
      if (Array.isArray(req.files)) {
        // Loop through uploaded files and upload to Cloudinary
        for (const file of req.files as Express.Multer.File[]) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "circle",
          });
          image_url.push(result.secure_url);

          // Delete the temporary file
          fs.unlinkSync(file.path);
        }
      } else {
        // Single file uploaded
        const file = req.files as unknown as Express.Multer.File;
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "circle",
        });
        image_url.push(result.secure_url);

        // Delete the temporary file
        fs.unlinkSync(file.path);
      }

      const payload = {
        content: body.content,
        image: image_url,
        user: res.locals.loginSession.User.id,
      };

      const connection = await amqp.connect("amqp://localhost");
      const channel = await connection.createChannel();

      await channel.assertQueue("threads");
      channel.sendToQueue("threads", Buffer.from(JSON.stringify(payload)));

      let rabbitData;

      const messageProssesed = new Promise<void>((resolve, reject) => {
        channel.consume("threads", async (message) => {
          if (message) {
            try {
              const payload = JSON.parse(message.content.toString());
              const rabbit = await this.ThreadRepository.create({
                data: {
                  content: payload.content,
                  image: payload.image,
                  created_at: new Date(),
                  user: { connect: { id: userId } },
                },
              });

              rabbitData = rabbit;
              channel.ack(message);
              resolve();
            } catch (error) {
              console.error("Error:", error);
              reject(error);
            }
          }
        });
      });

      await messageProssesed;
      await channel.close();
      await connection.close();

      return res.status(201).json({
        code: 201,
        status: "Success",
        message: "Add Threads from rabbit MQ Success",
        data: rabbitData,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }

  async updateThreadQueue(req: Request, res: Response): Promise<Response> {
    try {
      const threadId = req.params.threadId;
      if (!isValidUUID(threadId)) {
        return res.status(400).json({ message: "Invalid UUID" });
      }

      const userId = res.locals.loginSession.User.id;
      const userSelect = await this.UserRepository.findUnique({
        where: { id: userId },
      });
      if (!userSelect)
        return res.status(404).json({ message: "User not found" });

      let image_url: string[] = [];
      if (Array.isArray(req.files)) {
        for (const file of req.files as Express.Multer.File[]) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "circle",
          });
          image_url.push(result.secure_url);

          fs.unlinkSync(file.path);
        }
      } else {
        const file = req.files as unknown as Express.Multer.File;
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "circle",
        });
        image_url.push(result.secure_url);

        fs.unlinkSync(file.path);
      }

      const body = req.body;
      const { error } = addthread.validate(body);
      if (error) return res.status(400).json({ message: error.message });

      const payload = {
        content: body.content,
        image: image_url,
        user: res.locals.loginSession.User.id,
      };

      const connection = await amqp.connect("amqp://localhost");
      const channel = await connection.createChannel();

      await channel.assertQueue("threads");
      channel.sendToQueue("threads", Buffer.from(JSON.stringify(payload)));

      let rabbitData;

      const messageProssesed = new Promise<void>((resolve, reject) => {
        channel.consume("threads", async (message) => {
          if (message) {
            try {
              const payload = JSON.parse(message.content.toString());
              const rabbit = await this.ThreadRepository.update({
                where: { id: threadId },
                data: {
                  content: payload.content,
                  image: {
                    set: payload.image,
                  },
                  // this created_atshould be replaced updated_at
                  created_at: new Date(),
                  user: { connect: { id: userId } },
                },
              });
              rabbitData = rabbit;
              channel.ack(message);
              resolve();
            } catch (error) {
              console.error("Error:", error);
              reject(error);
            }
          }
        });
      });

      await messageProssesed;
      await channel.close();
      await connection.close();

      return res.status(200).json({
        code: 200,
        status: "Success",
        message: "Update Threads from rabbit MQ Success",
        data: rabbitData,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }
})();
