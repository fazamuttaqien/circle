import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { update } from "../utils/AuthUtil";
import { v4 as uuidv4 } from "uuid";
import * as bcyrpt from "bcrypt";
import cloudinary from "../config";
import * as fs from "fs";
import isValidUUID from "../utils/UUIDUtils";
import { DEFAULT_EXPIRATION, redis } from "../cache/client";
import { UserNameRedis, UserRedis } from "../interface";

const prisma = new PrismaClient();

export default new (class UserService {
  private readonly UserRepository = prisma.user;
  private readonly ThreadRepository = prisma.thread;
  private readonly LikeRepository = prisma.like;
  private readonly ReplyRepository = prisma.reply;
  private readonly UserFollowingRepository = prisma.follow;

  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.params.page) || 1;
      const pageSize = 10;
      const skip = (page - 1) * pageSize;

      const cache_key = `users_page_${page}`;
      if (!cache_key) return res.status(404).json({ message: "key not found" });

      const cache_data = await redis.get(cache_key);
      if (cache_data) {
        const users_redis = JSON.parse(cache_data);
        const users_pg = await this.UserRepository.findMany({
          skip,
          take: pageSize,
        });

        const totalUsers = await this.UserRepository.count();
        const totalPages = Math.ceil(totalUsers / pageSize);

        if (
          users_redis.data.length === users_pg.length &&
          users_redis.pagination.total_users === totalUsers &&
          users_redis.pagination.total_pages === totalPages
        ) {
          return res.status(200).json({
            code: 200,
            message: "find all cache user success",
            data: users_redis,
          });
        } else {
          await redis.del(cache_key);
        }
      }

      const users_pg = await this.UserRepository.findMany({
        skip,
        take: pageSize,
      });

      const total_users = await this.UserRepository.count();
      const total_pages = Math.ceil(total_users / pageSize);

      if (page > total_pages)
        return res.status(404).json({ message: "page not found" });

      const data_users = {
        data: users_pg,
        pagination: {
          total_users,
          total_pages,
          currentPage: page,
          pageSize,
        },
      };

      await redis.setEx(
        cache_key,
        DEFAULT_EXPIRATION,
        JSON.stringify({
          data: data_users.data,
          pagination: data_users.pagination,
        })
      );

      return res.status(200).json({
        code: 200,
        message: "find all users success",
        data: data_users,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }

  async findByID(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.params.userId;
      if (!isValidUUID(userId)) {
        return res.status(400).json({ message: "Invalid UUID" });
      }

      const cache_key = `user_id`;
      if (!cache_key) return res.status(404).json({ message: "key not found" });

      let users_data: UserRedis[] = [];

      const cache = await redis.get(cache_key);
      if (cache) {
        users_data = JSON.parse(cache);
        const users_pg = await this.UserRepository.findUniqueOrThrow({
          where: {
            id: userId,
          },
          select: {
            id: true,
            username: true,
            fullname: true,
            email: true,
            profile_picture: true,
            bio: true,
            threads: {
              select: {
                id: true,
                content: true,
                image: true,
                user_id: true,
                isLiked: true,
              },
            },
            likes: {
              select: {
                id: true,
                user_id: true,
                thread_id: true,
              },
            },
            replies: {
              select: {
                id: true,
                content: true,
                image: true,
                user_id: true,
                thread_id: true,
              },
            },
            following: {
              select: {
                id: true,
                followingId: true,
                isFollow: true,
              },
            },
            followers: {
              select: {
                id: true,
                followerId: true,
                isFollow: true,
              },
            },
          },
        });

        // check if the user already exists in the redis
        const existingUserIndex = Array.from(users_data).findIndex(
          (users) => users.id === userId
        );
        if (existingUserIndex !== -1 && users_pg !== null) {
          // if user already exists, update it
          users_data[existingUserIndex] = users_pg;
        } else {
          // if user doesn't exist, add it
          Array.from(users_data).push(users_pg);
        }
        await redis.setEx(
          cache_key,
          DEFAULT_EXPIRATION,
          JSON.stringify(users_data)
        );
        if (users_data[existingUserIndex]) {
          return res.status(200).json({
            code: 200,
            message: "find by id cache threads success",
            data: users_data[existingUserIndex],
          });
        }
      }

      const users = await this.UserRepository.findUniqueOrThrow({
        where: {
          id: userId,
        },
        select: {
          id: true,
          username: true,
          fullname: true,
          email: true,
          profile_picture: true,
          bio: true,
          threads: {
            select: {
              id: true,
              content: true,
              image: true,
              user_id: true,
              isLiked: true,
            },
          },
          likes: {
            select: {
              id: true,
              user_id: true,
              thread_id: true,
            },
          },
          replies: {
            select: {
              id: true,
              content: true,
              image: true,
              user_id: true,
              thread_id: true,
            },
          },
          following: {
            select: {
              id: true,
              followingId: true,
              isFollow: true,
            },
          },
          followers: {
            select: {
              id: true,
              followerId: true,
              isFollow: true,
            },
          },
        },
      });

      if (!users) return res.status(404).json({ message: "user not found" });

      users_data.push(users);
      await redis.setEx(
        cache_key,
        DEFAULT_EXPIRATION,
        JSON.stringify(users_data)
      );

      return res.status(200).json({
        code: 200,
        message: "find by id user success",
        data: users,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }

  async findByName(req: Request, res: Response): Promise<Response> {
    try {
      const name = req.params.name;

      const cache_key = `user_name`;
      if (!cache_key) return res.status(404).json({ message: "key not found" });

      let users_data: UserNameRedis[] = [];

      const cache = await redis.get(cache_key);
      if (cache) {
        users_data = JSON.parse(cache);
        const users_pg = await this.UserRepository.findMany({
          where: {
            fullname: name,
          },
          select: {
            id: true,
            username: true,
            fullname: true,
            email: true,
            profile_picture: true,
            bio: true,
            created_at: true,
            updated_at: true,
          },
        });

        // check if the user already exists in the redis
        const existingUserIndex = Array.from(users_data).findIndex(
          (users) => users.fullname === name
        );
        if (existingUserIndex !== -1 && users_pg !== null) {
          // if user already exists, update it
          users_data[existingUserIndex] = users_pg[0];
        } else {
          // if user doesn't exist, add it
          Array.from(users_data).push(users_pg[0]);
        }
        await redis.setEx(
          cache_key,
          DEFAULT_EXPIRATION,
          JSON.stringify(users_data)
        );
        if (users_data[existingUserIndex]) {
          return res.status(200).json({
            code: 200,
            message: "find by name cache threads success",
            data: users_data[existingUserIndex],
          });
        }
      }

      const user = await this.UserRepository.findMany({
        where: {
          fullname: name,
        },
        select: {
          id: true,
          username: true,
          fullname: true,
          email: true,
          profile_picture: true,
          bio: true,
          created_at: true,
          updated_at: true,
        },
      });
      if (!user) return res.status(404).json({ message: "user not found" });

      users_data.push(user[0]);
      await redis.setEx(
        cache_key,
        DEFAULT_EXPIRATION,
        JSON.stringify(users_data)
      );

      return res.status(200).json({
        code: 200,
        message: "find by name user success",
        data: user,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }

  async updateWithoutImage(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.params.userId;

      if (!isValidUUID(userId)) {
        return res.status(400).json({ message: "Invalid UUID" });
      }

      const session = res.locals.loginSession.User.id;

      if (userId !== session)
        return res
          .status(403)
          .json({ message: "Unauthorization : You're not user Login " });

      const user = await this.UserRepository.findUnique({
        where: { id: userId },
      });

      if (!user) return res.status(404).json({ message: "User not found" });

      const body = req.body;
      const { error } = update.validate(body);
      if (error) return res.status(400).json({ message: error.message });

      let hashPassword = user.password;
      let fullname = user.fullname;
      let bio = user.bio;
      let username = user.username;

      const id = uuidv4();
      // The substring() method is used to retrieve a portion of the id string.
      // in this case, it takes characters from index 0 to 7 (8 characters in all), which creates the first string chunk of the id.
      // The replace() method is used to replace all matches of a given pattern in a string with another string.
      const usernameUUIDpart = id.substring(0, 8).replace(/-/g, "");
      // const uconvert = `user_${usernameUUIDpart}_${body.fullname.replace(/\s/g, '_')}`

      if (body.password !== undefined && body.password !== "") {
        hashPassword = await bcyrpt.hash(body.password, 10);
      }

      if (body.fullname !== undefined && body.fullname !== "") {
        fullname = body.fullname;
        username = `user_${usernameUUIDpart}_${body.fullname.replace(
          /\s/g,
          "_"
        )}`;
      }

      if (body.bio !== undefined && body.bio !== "") {
        bio = body.bio;
      }

      const updateUser = await this.UserRepository.update({
        where: { id: userId },
        data: {
          fullname: fullname,
          username: username,
          password: hashPassword,
          bio: bio,
        },
      });

      return res.status(201).json({
        code: 201,
        status: "Success",
        message: "Upload Data Profile Success",
        data: updateUser,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error });
    }
  }

  async uploadProfilePicture(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.params.userId;

      if (!isValidUUID(userId)) {
        return res.status(400).json({ message: "Invalid UUID" });
      }

      const session = res.locals.loginSession.User.id;

      if (userId !== session)
        return res
          .status(403)
          .json({ message: "Unauthorization : You're not user Login " });

      const image = req.file;
      if (!image) return res.status(400).json({ message: "No Image Provided" });

      const oldUserData = await this.UserRepository.findUnique({
        where: { id: userId },
        select: { profile_picture: true },
      });

      const cloudinaryUpload = await cloudinary.uploader.upload(image.path, {
        folder: "circle",
      });

      const profile_pictureURL = cloudinaryUpload.secure_url;

      fs.unlinkSync(image.path);

      if (oldUserData && oldUserData.profile_picture) {
        const publicId = oldUserData.profile_picture
          .split("/")
          .pop()
          ?.split(".")[0];
        await cloudinary.uploader.destroy(publicId as string);
      }

      const updateUser = await this.UserRepository.update({
        where: { id: userId },
        data: {
          profile_picture: profile_pictureURL,
        },
      });

      return res.status(201).json({
        code: 201,
        status: "Success",
        message: "Upload Picture Profile Success",
        data: updateUser,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error });
    }
  }

  async getSuggestedUser(req: Request, res: Response): Promise<Response> {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      // const limit = /^\d+$/.test(limitString) ? parseInt(limitString) : 5;
      console.log("limit", req.query.limit as string);

      const userid = res.locals.loginSession.User.id;
      const followingUsers = await this.UserRepository.findFirstOrThrow({
        where: { id: userid },
        select: {
          id: true,
          fullname: true,
          following: {
            select: {
              followingId: true,
            },
          },
        },
      });

      const followings = followingUsers.following.map(
        (item) => item.followingId
      );

      const users = await this.UserRepository.findMany({
        select: {
          id: true,
          fullname: true,
        },
      });

      const data: any[] = [];
      for (let i = 0; i < users.length; i++) {
        if (users[i].id !== userid && !followings.includes(users[i].id)) {
          data.push(users[i]);
        }
      }
      const randomUsers = data.sort(() => 0.5 - Math.random()).slice(0, limit);

      return res.status(200).json({
        code: 200,
        status: "Success",
        message: "Get Suggested User Success",
        data: randomUsers,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.params.userId;

      if (!isValidUUID(userId)) {
        return res.status(400).json({ message: "Invalid UUID" });
      }

      const session = res.locals.loginSession.User.id;

      if (userId !== session)
        return res
          .status(403)
          .json({ message: "Unauthorization : You're not user Login" });

      const userDelete = await this.UserRepository.findUnique({
        where: { id: userId },
        include: {
          threads: true,
          likes: true,
          replies: true,
        },
      });

      // Menghapus user delete untuk sesama user yang salaing folow
      if (!userDelete)
        return res.status(400).json({ message: "User not found" });
      await this.UserFollowingRepository.deleteMany({
        where: {
          OR: [{ followerId: userId }, { followingId: userId }],
        },
      });

      await Promise.all([
        this.ThreadRepository.deleteMany({ where: { user_id: userId } }),
        this.LikeRepository.deleteMany({ where: { user_id: userId } }),
        this.ReplyRepository.deleteMany({ where: { user_id: userId } }),
      ]);

      const deleteUser = await this.UserRepository.delete({
        where: { id: userId },
      });

      return res.status(200).json({
        code: 200,
        status: "Success",
        message: "Delete User Success",
        data: deleteUser,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error });
    }
  }
})();
