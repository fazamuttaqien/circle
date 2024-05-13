import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import cloudinary from "../config";
import * as fs from "fs";
import { addthread } from "../utils/ThreadUtil";
import { DEFAULT_EXPIRATION, redis } from "../cache/client";
import isValidUUID from "../utils/UUIDUtils";
import { ThreadRedis } from "../interface";

const prisma = new PrismaClient();

export default new (class ThreadService {
  private readonly UserRepository = prisma.user;
  private readonly ThreadRepository = prisma.thread;

  async findAllRedis(req: Request, res: Response): Promise<Response> {
    try {
      const { page = 1, pageSize = 10 } = req.query;
      const parsedPage = parseInt(page as string, 10);
      const parsedPageSize = parseInt(pageSize as string, 10);

      const skip = (parsedPage - 1) * parsedPageSize;

      const cacheKey = `threadsPage${page}`;
      if (!cacheKey) return res.status(404).json({ message: "Key not found" });

      const cacheData = await redis.get(cacheKey);
      if (cacheData) {
        const threadsRedis = JSON.parse(cacheData);

        const threadsPg = await this.ThreadRepository.findMany({
          skip,
          take: parsedPageSize,
          include: {
            user: true,
            likes: true,
            replies: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        const totalThread = await this.ThreadRepository.count();
        const totalPages = Math.ceil(totalThread / parsedPageSize);

        const checkThreads: () => boolean = () => {
          threadsPg.forEach((thread, index) => {
            if (thread.content !== threadsRedis.data[index].content)
              return false;
            if (thread.likes.length !== threadsRedis.data[index].likes.length)
              return false;
            if (
              thread.replies.length !== threadsRedis.data[index].replies.length
            )
              return false;
            thread.image.forEach((image, i) => {
              if (image !== threadsRedis.data[index].image[i]) {
                return false;
              }
            });
          });
          return true;
        };

        // check whether the data in the database has new data or not
        if (
          threadsRedis.data.length === threadsPg.length &&
          threadsRedis.pagination.total_thread == totalThread &&
          threadsRedis.pagination.total_pages == totalPages &&
          checkThreads()
        ) {
          // if there is no change then display the existing data in Redis
          return res.status(200).json({
            code: 200,
            message: "Find all cache threads success",
            data: threadsRedis,
          });
        } else {
          // if there are changes, the existing data in Redis will be deleted and new data will be retrieved
          await redis.del(cacheKey);
        }
      }

      // retrieving data from the database
      const threadsPg = await this.ThreadRepository.findMany({
        skip,
        take: parsedPageSize,
        include: {
          user: true,
          likes: true,
          replies: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const totalThread = await this.ThreadRepository.count();
      const totalPages = Math.ceil(totalThread / parsedPageSize);

      // if (page > total_pages)
      //   return res.status(404).json({ message: "page not found" });

      const dataThreads = {
        data: threadsPg,
        pagination: {
          totalThread,
          totalPages,
          currentPage: page,
          parsedPageSize,
        },
      };

      await redis.setEx(
        cacheKey,
        DEFAULT_EXPIRATION,
        JSON.stringify({
          data: dataThreads.data,
          pagination: dataThreads.pagination,
        })
      );

      return res.status(200).json({
        code: 200,
        message: "Find all threads success",
        data: dataThreads,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }

  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const { page = 1, pageSize = 10 } = req.query;
      const parsedPage = parseInt(page as string, 10);
      const parsedPageSize = parseInt(pageSize as string, 10);

      const skip = (parsedPage - 1) * parsedPageSize;

      const threadsPg = await this.ThreadRepository.findMany({
        skip,
        take: parsedPageSize,
        include: {
          user: true,
          likes: true,
          replies: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const totalThread = await this.ThreadRepository.count();
      const totalPages = Math.ceil(totalThread / parsedPageSize);

      const dataThreads = {
        data: threadsPg,
        pagination: {
          totalThread,
          totalPages,
          currentPage: page,
          parsedPageSize,
        },
      };

      return res.status(200).json({
        code: 200,
        message: "Find all threads success",
        data: dataThreads,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }

  async findByID(req: Request, res: Response): Promise<Response> {
    try {
      const threadId = req.params.threadID;

      if (!isValidUUID(threadId)) {
        return res.status(400).json({ message: "Invalid UUID" });
      }

      const cacheKey = `threadsId`;
      if (!cacheKey) {
        return res.status(404).json({ message: "Cache key not found" });
      }

      let threadsData: ThreadRedis[] = [];

      const cache = await redis.get(cacheKey);
      if (cache) {
        threadsData = JSON.parse(cache);
        const threadsPg = await this.ThreadRepository.findUniqueOrThrow({
          where: { ID: threadId },
          select: {
            ID: true,
            content: true,
            image: true,
            userID: true,
            isLiked: true,
            createdAt: true,
            user: {
              select: {
                ID: true,
                username: true,
                fullname: true,
                email: true,
                profilePicture: true,
                createdAt: true,
                bio: true,
              },
            },
            replies: {
              select: {
                ID: true,
                content: true,
                image: true,
                isEdited: true,
                user: {
                  select: {
                    ID: true,
                    username: true,
                    fullname: true,
                    profilePicture: true,
                  },
                },
                userID: true,
                threadID: true,
                createdAt: true,
              },
            },
            likes: {
              select: {
                ID: true,
                userID: true,
                threadID: true,
              },
            },
          },
        });

        // check if the thread already exists in the redis
        const existingUserIndex = Array.from(threadsData).findIndex(
          (threads) => threads.ID === threadId
        );
        if (existingUserIndex !== -1 && threadsPg !== null) {
          threadsData[existingUserIndex] = threadsPg;
        } else {
          Array.from(threadsData).push(threadsPg);
        }
        await redis.setEx(
          cacheKey,
          DEFAULT_EXPIRATION,
          JSON.stringify(threadsData)
        );
        if (threadsData[existingUserIndex]) {
          return res.status(200).json({
            code: 200,
            message: "Find by id cache threads success",
            data: threadsData[existingUserIndex],
          });
        }
      }

      const thread = await this.ThreadRepository.findUniqueOrThrow({
        where: { ID: threadId },
        select: {
          ID: true,
          content: true,
          image: true,
          userID: true,
          isLiked: true,
          createdAt: true,
          user: {
            select: {
              ID: true,
              username: true,
              fullname: true,
              email: true,
              profilePicture: true,
              createdAt: true,
              bio: true,
            },
          },
          replies: {
            select: {
              ID: true,
              content: true,
              image: true,
              isEdited: true,
              user: {
                select: {
                  ID: true,
                  username: true,
                  fullname: true,
                  profilePicture: true,
                },
              },
              userID: true,
              threadID: true,
              createdAt: true,
            },
          },
          likes: {
            select: {
              ID: true,
              userID: true,
              threadID: true,
            },
          },
        },
      });
      if (!thread) {
        return res.status(404).json({ message: "Thread not found" });
      }

      threadsData.push(thread);
      await redis.setEx(
        cacheKey,
        DEFAULT_EXPIRATION,
        JSON.stringify(threadsData)
      );

      return res.status(200).json({
        code: 200,
        message: "Find by id threads success",
        data: thread,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }

  async addThread(req: Request, res: Response): Promise<Response> {
    try {
      const body = req.body;
      const { error } = addthread.validate(body);
      if (error) return res.status(400).json({ message: error.message });

      const userId = res.locals.loginSession.User.id;

      const userSelect = await this.UserRepository.findUnique({
        where: { ID: userId },
      });
      if (!userSelect)
        return res.status(404).json({ message: "User not found" });

      let imageURL: string[] = [];

      // check if multiple files are uploaded
      if (Array.isArray(req.files)) {
        for (const file of req.files as Express.Multer.File[]) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "circle",
          });
          imageURL.push(result.secure_url);
          fs.unlinkSync(file.path);
        }
      } else {
        // single file uploaded
        const file = req.files as unknown as Express.Multer.File;
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "circle",
        });
        imageURL.push(result.secure_url);
        fs.unlinkSync(file.path);
      }

      const thread = await this.ThreadRepository.create({
        data: {
          content: body.content,
          image: imageURL,
          createdAt: new Date(),
          user: { connect: { ID: userId } },
        },
      });

      return res.status(201).json({
        code: 201,
        message: "Add threads success",
        data: thread,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }

  async updateThread(req: Request, res: Response): Promise<Response> {
    try {
      const threadId = req.params.threadID;

      if (!isValidUUID(threadId)) {
        return res.status(400).json({ message: "Invalid UUID" });
      }

      const userId = res.locals.loginSession.User.id;

      const userSelect = await this.UserRepository.findUnique({
        where: { ID: userId },
      });
      if (!userSelect)
        return res.status(404).json({ message: "User not found" });

      const body = req.body;
      const { error } = addthread.validate(body);
      if (error) return res.status(400).json({ message: error.message });

      let imageURL: string[] = [];

      // check if multiple files are uploaded
      if (Array.isArray(req.files)) {
        for (const file of req.files as Express.Multer.File[]) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "circle",
          });
          imageURL.push(result.url);
        }
      } else {
        // single file uploaded
        const file = req.file as Express.Multer.File;
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "circle",
        });
        imageURL.push(result.secure_url);
      }

      const threadUpdate = await this.ThreadRepository.update({
        where: { ID: threadId },
        data: {
          content: body.content,
          image: {
            set: imageURL,
          },
          isEdited: true,
          createdAt: new Date(),
          user: { connect: { ID: userId } },
        },
      });

      // delete the temporary files
      if (Array.isArray(req.files)) {
        for (const file of req.files as Express.Multer.File[]) {
          fs.unlinkSync(file.path);
        }
      } else {
        fs.unlinkSync((req.file as Express.Multer.File).path);
      }

      return res.status(201).json({
        code: 201,
        message: "Update threads success",
        data: threadUpdate,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }

  async deleteThread(req: Request, res: Response): Promise<Response> {
    try {
      const threadId = req.params.threadID;

      if (!isValidUUID(threadId)) {
        return res.status(400).json({ message: "Invalid UUID" });
      }

      const userId = res.locals.loginSession.User.id;

      const userSelect = await this.UserRepository.findUnique({
        where: { ID: userId },
      });
      if (!userSelect)
        return res.status(404).json({ message: "User not found" });

      const oldThreadData = await this.ThreadRepository.findUnique({
        where: { ID: threadId },
        select: { image: true },
      });

      oldThreadData?.image.forEach(async (item) => {
        if (oldThreadData && item) {
          const publicId = item.split("/").pop()?.split(".")[0];
          cloudinary.uploader.destroy(publicId as string);
        }
      });

      const deleteThread = await this.ThreadRepository.delete({
        where: { ID: threadId },
      });

      return res.status(200).json({
        code: 200,
        message: "Delete threads success",
        data: deleteThread,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }
})();
