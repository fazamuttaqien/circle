import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import cloudinary from "../config";
import * as fs from "fs";
import { addthread } from "../utils/ThreadUtil";
import { DEFAULT_EXPIRATION, redisClient } from "../cache/redis";

const prisma = new PrismaClient();

function isValidUUID(uuid: string): boolean {
  const UUIDRegex =
    /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
  // const UUIDRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{3}-[a-f0-9]{3}-[a-f0-9]{12}$/i
  return UUIDRegex.test(uuid);
}

export default new (class ThreadService {
  private readonly UserRepository = prisma.user;
  private readonly ThreadRepository = prisma.thread;

  async findAllRedis(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.params.page) || 1;
      const pageSize = 10;
      const skip = (page - 1) * pageSize;

      const cacheKey = `threads_page_${page}`;
      if (!cacheKey) return res.status(404).json({ message: "KEY not Found" });

      const cacheData = await redisClient.get(cacheKey);

      if (cacheData) {
        const threads = JSON.parse(cacheData);

        const findthreads = await this.ThreadRepository.findMany({
          skip,
          take: pageSize,
          include: {
            user: true,
            Like: true,
            replies: true,
          },
          orderBy: {
            created_at: "desc",
          },
        });

        const totalThread = await this.ThreadRepository.count();
        const totalPages = Math.ceil(totalThread / pageSize);

        var checkcontent: boolean = false,
          checkimage: boolean = false;
        findthreads.forEach((findthreads, index) => {
          if (findthreads.content === threads.data[index].content)
            checkcontent = true;
          findthreads.image.forEach((item, i) => {
            if (item === threads.data[index].image[i]) checkimage = true;
          });
        });

        // check whether the data in the database has new data or not
        if (
          threads.data.length === findthreads.length &&
          threads.pagination.totalThread == totalThread &&
          threads.pagination.totalPages == totalPages &&
          checkimage &&
          checkcontent
        ) {
          // if there is no change then display the existing data in Redis
          return res.status(200).json({
            code: 200,
            status: "Success",
            message: "Find All Cache Threads Success",
            data: threads,
          });
        } else {
          // if there are changes, the existing data in Redis will be deleted and new data will be retrieved
          await redisClient.del(cacheKey);
        }
      }

      // retrieving data from the database
      const threads1 = await this.ThreadRepository.findMany({
        skip,
        take: pageSize,
        include: {
          user: true,
          Like: true,
          replies: true,
        },
        orderBy: {
          created_at: "desc",
        },
      });

      const totalThread = await this.ThreadRepository.count();
      const totalPages = Math.ceil(totalThread / pageSize);

      if (page > totalPages)
        return res.status(404).json({ message: "Page not found" });

      const threads2 = {
        data: threads1,
        pagination: {
          totalThread,
          totalPages,
          currentPage: page,
          pageSize,
        },
      };

      redisClient.setEx(
        cacheKey,
        DEFAULT_EXPIRATION,
        JSON.stringify({
          message: "Find All Cache Thread Success",
          data: threads2.data,
          pagination: threads2.pagination,
        })
      );

      return res.status(200).json({
        code: 200,
        status: "Success",
        message: "Find All Threads Success",
        data: threads2,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error });
    }
  }

  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      // this is to retrieve the page the thread was opened on, if it is the first time it has been opened it will automatically retrieve page 1
      const page = parseInt(req.params.page) || 1;
      // this is to retrieve how many threads are on the page
      // page 1 contains 10 threads, page 2 contains 10 threads, page 3 contains 10 threads
      const pageSize = 10;

      // this will check the pageSize
      //            (1-1) * 10 = 0
      const skip = (page - 1) * pageSize;

      const threads = await this.ThreadRepository.findMany({
        // 0
        skip,
        // 10
        take: pageSize,
        include: {
          user: true,
          Like: true,
          replies: true,
        },
        orderBy: {
          created_at: "desc",
          // if desc will display the latest data, namely data from the most recent time
          // if asc will display data from a long time
        },
      });

      // taking the number of all threads, for example there are 20 threads, then 20 will be counted
      const totalThread = await this.ThreadRepository.count();

      // this will divide the entire thread by the total thread, for example 20 / 10 = 2
      const totalPages = Math.ceil(totalThread / pageSize);

      // check whether the user input page parameters are more than those in the database
      // because there are only 2 pages available, when the user inputs 5 pages, there is an error
      // because it exceeds the available ceiling
      if (page > totalPages)
        return res.status(404).json({ message: "Page not found" });

      // will display threads and pagination
      const threadss = {
        data: threads,
        pagination: {
          totalThread,
          totalPages,
          currentPage: page,
          pageSize,
        },
      };

      return res.status(200).json({
        code: 200,
        status: "Success",
        message: "Find All Threads Success",
        data: threadss,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error });
    }
  }

  async findByID(req: Request, res: Response): Promise<Response> {
    try {
      const threadId = req.params.threadId;

      if (!isValidUUID(threadId)) {
        return res.status(400).json({ message: "Invalid UUID" });
      }

      const thread = await this.ThreadRepository.findUnique({
        where: { id: threadId },
        include: {
          user: true,
          Like: true,
          replies: {
            include: {
              User: true,
            },
          },
        },
      });

      if (!thread) return res.status(404).json({ message: "thread not found" });

      return res.status(200).json({
        code: 200,
        status: "Success",
        message: "Find By ID Threads Success",
        data: thread,
      });
    } catch (error) {
      console.log(error);
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
      // let thread: object = {};

      // check if multiple files are uploaded
      if (Array.isArray(req.files)) {
        // loop through uploaded files and upload to Cloudinary
        for (const file of req.files as Express.Multer.File[]) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "circle",
          });
          image_url.push(result.secure_url);

          // delete the temporary file
          fs.unlinkSync(file.path);
        }
      } else {
        // single file uploaded
        const file = req.files as unknown as Express.Multer.File;
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "circle",
        });
        image_url.push(result.secure_url);

        // delete the temporary file
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
      console.log(error);
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
      console.log(error);
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
      console.log(error);
      return res.status(500).json({ message: error });
    }
  }
})();
