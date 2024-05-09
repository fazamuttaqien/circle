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
      const { page = 1, page_size = 10 } = req.query;
      const parsed_page = parseInt(page as string, 10);
      const parsed_page_size = parseInt(page_size as string, 10);

      const skip = (parsed_page - 1) * parsed_page_size;

      const cache_key = `threads_page_${page}`;
      if (!cache_key) return res.status(404).json({ message: "key not found" });

      const cache_data = await redis.get(cache_key);
      if (cache_data) {
        const threads_redis = JSON.parse(cache_data);

        const threads_pg = await this.ThreadRepository.findMany({
          skip,
          take: parsed_page_size,
          include: {
            user: true,
            likes: true,
            replies: true,
          },
          orderBy: {
            created_at: "desc",
          },
        });

        const total_thread = await this.ThreadRepository.count();
        const total_pages = Math.ceil(total_thread / parsed_page_size);

        const check_threads: () => boolean = () => {
          threads_pg.forEach((thread, index) => {
            if (thread.content !== threads_redis.data[index].content)
              return false;
            if (thread.likes.length !== threads_redis.data[index].likes.length)
              return false;
            if (
              thread.replies.length !== threads_redis.data[index].replies.length
            )
              return false;
            thread.image.forEach((image, i) => {
              if (image !== threads_redis.data[index].image[i]) {
                return false;
              }
            });
          });
          return true;
        };

        // check whether the data in the database has new data or not
        if (
          threads_redis.data.length === threads_pg.length &&
          threads_redis.pagination.total_thread == total_thread &&
          threads_redis.pagination.total_pages == total_pages &&
          check_threads()
        ) {
          // if there is no change then display the existing data in Redis
          return res.status(200).json({
            code: 200,
            message: "find all cache threads success",
            data: threads_redis,
          });
        } else {
          // if there are changes, the existing data in Redis will be deleted and new data will be retrieved
          await redis.del(cache_key);
        }
      }

      // retrieving data from the database
      const threads_pg = await this.ThreadRepository.findMany({
        skip,
        take: parsed_page_size,
        include: {
          user: true,
          likes: true,
          replies: true,
        },
        orderBy: {
          created_at: "desc",
        },
      });

      const total_thread = await this.ThreadRepository.count();
      const total_pages = Math.ceil(total_thread / parsed_page_size);

      // if (page > total_pages)
      //   return res.status(404).json({ message: "page not found" });

      const data_threads = {
        data: threads_pg,
        pagination: {
          total_thread,
          total_pages,
          current_page: page,
          parsed_page_size,
        },
      };

      await redis.setEx(
        cache_key,
        DEFAULT_EXPIRATION,
        JSON.stringify({
          data: data_threads.data,
          pagination: data_threads.pagination,
        })
      );

      return res.status(200).json({
        code: 200,
        message: "find all threads success",
        data: data_threads,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }

  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const { page = 1, page_size = 10 } = req.query;
      const parsed_page = parseInt(page as string, 10);
      const parsed_page_size = parseInt(page_size as string, 10);

      const skip = (parsed_page - 1) * parsed_page_size;

      const threads_pg = await this.ThreadRepository.findMany({
        skip,
        take: parsed_page_size,
        include: {
          user: true,
          likes: true,
          replies: true,
        },
        orderBy: {
          created_at: "desc",
        },
      });

      const total_thread = await this.ThreadRepository.count();
      const total_pages = Math.ceil(total_thread / parsed_page_size);

      // if (parsedPage > total_pages)
      //   return res.status(404).json({ message: "page not found" });

      const data_threads = {
        data: threads_pg,
        pagination: {
          total_thread,
          total_pages,
          current_page: page,
          parsed_page_size,
        },
      };

      return res.status(200).json({
        code: 200,
        message: "find all threads success",
        data: data_threads,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }

  async findByID(req: Request, res: Response): Promise<Response> {
    try {
      const thread_id = req.params.threadId;

      if (!isValidUUID(thread_id)) {
        return res.status(400).json({ message: "invalid uuid" });
      }

      const cache_key = `threads_id`;
      if (!cache_key) {
        return res.status(404).json({ message: "cache key not found" });
      }

      let threads_data: ThreadRedis[] = [];

      const cache = await redis.get(cache_key);
      if (cache) {
        threads_data = JSON.parse(cache);
        const threads_pg = await this.ThreadRepository.findUniqueOrThrow({
          where: { id: thread_id },
          select: {
            id: true,
            content: true,
            image: true,
            user_id: true,
            isLiked: true,
            created_at: true,
            user: {
              select: {
                id: true,
                username: true,
                fullname: true,
                email: true,
                profile_picture: true,
                created_at: true,
                bio: true,
              },
            },
            replies: {
              select: {
                id: true,
                content: true,
                image: true,
                user: {
                  select: {
                    id: true,
                    username: true,
                    fullname: true,
                    profile_picture: true,
                  },
                },
                user_id: true,
                thread_id: true,
                created_at: true,
              },
            },
            likes: {
              select: {
                id: true,
                user_id: true,
                thread_id: true,
              },
            },
          },
        });

        // check if the thread already exists in the redis
        const existingUserIndex = Array.from(threads_data).findIndex(
          (threads) => threads.id === thread_id
        );
        if (existingUserIndex !== -1 && threads_pg !== null) {
          // if thread already exists, update it
          threads_data[existingUserIndex] = threads_pg;
        } else {
          // if thread doesn't exist, add it
          Array.from(threads_data).push(threads_pg);
        }
        await redis.setEx(
          cache_key,
          DEFAULT_EXPIRATION,
          JSON.stringify(threads_data)
        );
        if (threads_data[existingUserIndex]) {
          return res.status(200).json({
            code: 200,
            message: "find by id cache threads success",
            data: threads_data[existingUserIndex],
          });
        }
      }

      const thread = await this.ThreadRepository.findUniqueOrThrow({
        where: { id: thread_id },
        select: {
          id: true,
          content: true,
          image: true,
          user_id: true,
          isLiked: true,
          created_at: true,
          user: {
            select: {
              id: true,
              username: true,
              fullname: true,
              email: true,
              profile_picture: true,
              created_at: true,
              bio: true,
            },
          },
          replies: {
            select: {
              id: true,
              content: true,
              image: true,
              user: {
                select: {
                  id: true,
                  username: true,
                  fullname: true,
                  profile_picture: true,
                },
              },
              user_id: true,
              thread_id: true,
              created_at: true,
            },
          },
          likes: {
            select: {
              id: true,
              user_id: true,
              thread_id: true,
            },
          },
        },
      });
      if (!thread) {
        return res.status(404).json({ message: "thread not found" });
      }

      threads_data.push(thread);
      await redis.setEx(
        cache_key,
        DEFAULT_EXPIRATION,
        JSON.stringify(threads_data)
      );

      return res.status(200).json({
        code: 200,
        message: "find by id threads success",
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
        where: { id: userId },
      });
      if (!userSelect)
        return res.status(404).json({ message: "User not found" });

      let image_url: string[] = [];

      // check if multiple files are uploaded
      if (Array.isArray(req.files)) {
        for (const file of req.files as Express.Multer.File[]) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "circle",
          });
          image_url.push(result.secure_url);
          fs.unlinkSync(file.path);
        }
      } else {
        // single file uploaded
        const file = req.files as unknown as Express.Multer.File;
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "circle",
        });
        image_url.push(result.secure_url);
        fs.unlinkSync(file.path);
      }

      const thread = await this.ThreadRepository.create({
        data: {
          content: body.content,
          image: image_url,
          created_at: new Date(),
          user: { connect: { id: userId } },
        },
      });

      return res.status(201).json({
        code: 201,
        status: "Success",
        message: "Add Threads Success",
        data: thread,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }

  async updateThread(req: Request, res: Response): Promise<Response> {
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

      const body = req.body;
      const { error } = addthread.validate(body);
      if (error) return res.status(400).json({ message: error.message });

      let image_url: string[] = [];

      // check if multiple files are uploaded
      if (Array.isArray(req.files)) {
        // loop through uploaded files and upload to Cloudinary
        for (const file of req.files as Express.Multer.File[]) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "circle",
          });
          image_url.push(result.url);
        }
      } else {
        // single file uploaded
        const file = req.file as Express.Multer.File;
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "circle",
        });
        image_url.push(result.secure_url);
      }

      const threadUpdate = await this.ThreadRepository.update({
        where: { id: threadId },
        data: {
          content: body.content,
          image: {
            set: image_url,
          },
          created_at: new Date(),
          user: { connect: { id: userId } },
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
        status: "Success",
        message: "Update Threads Success",
        data: threadUpdate,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }

  async deleteThread(req: Request, res: Response): Promise<Response> {
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

      const oldThreadData = await this.ThreadRepository.findUnique({
        where: { id: threadId },
        select: { image: true },
      });

      oldThreadData?.image.forEach(async (item) => {
        if (oldThreadData && item) {
          // the split() method is used to split a string into an array using the specified separator.
          // the pop() method is used to remove and return the last element of the array.
          // the split() method is used again here to split the string produced by pop() based on the dot (.).
          const publicId = item.split("/").pop()?.split(".")[0];
          cloudinary.uploader.destroy(publicId as string);
        }
      });

      const deletethread = await this.ThreadRepository.delete({
        where: { id: threadId },
      });

      return res.status(200).json({
        code: 200,
        status: "Success",
        message: "Delete Threads Success",
        data: deletethread,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }
})();
