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
import { UploadApiResponse } from "cloudinary";

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

      const cacheKey = `usersPage${page}`;
      if (!cacheKey) return res.status(404).json({ message: "Key not found" });

      const cacheData = await redis.get(cacheKey);
      if (cacheData) {
        const usersRedis = JSON.parse(cacheData);
        const usersPg = await this.UserRepository.findMany({
          skip,
          take: pageSize,
        });

        const totalUsers = await this.UserRepository.count();
        const totalPages = Math.ceil(totalUsers / pageSize);

        if (
          usersRedis.data.length === usersPg.length &&
          usersRedis.pagination.totalUsers === totalUsers &&
          usersRedis.pagination.totalPages === totalPages
        ) {
          return res.status(200).json({
            code: 200,
            message: "Find all cache user success",
            data: usersRedis,
          });
        } else {
          await redis.del(cacheKey);
        }
      }

      const usersPg = await this.UserRepository.findMany({
        skip,
        take: pageSize,
      });

      const totalUsers = await this.UserRepository.count();
      const totalPages = Math.ceil(totalUsers / pageSize);

      if (page > totalPages)
        return res.status(404).json({ message: "Page not found" });

      const dataUsers = {
        data: usersPg,
        pagination: {
          totalUsers,
          totalPages,
          currentPage: page,
          pageSize,
        },
      };

      await redis.setEx(
        cacheKey,
        DEFAULT_EXPIRATION,
        JSON.stringify({
          data: dataUsers.data,
          pagination: dataUsers.pagination,
        })
      );

      return res.status(200).json({
        code: 200,
        message: "Find all users success",
        data: dataUsers,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }

  async findByID(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.params.userID;
      if (!isValidUUID(userId)) {
        return res.status(400).json({ message: "Invalid UUID" });
      }

      const cacheKey = `userID`;
      if (!cacheKey) return res.status(404).json({ message: "Key not found" });

      let usersData: UserRedis[] = [];

      const cache = await redis.get(cacheKey);
      if (cache) {
        usersData = JSON.parse(cache);
        const usersPg = await this.UserRepository.findUniqueOrThrow({
          where: {
            ID: userId,
          },
          select: {
            ID: true,
            username: true,
            fullname: true,
            email: true,
            profilePicture: true,
            bio: true,
            threads: {
              select: {
                ID: true,
                content: true,
                image: true,
                userID: true,
                isLiked: true,
              },
            },
            likes: {
              select: {
                ID: true,
                userID: true,
                threadID: true,
              },
            },
            replies: {
              select: {
                ID: true,
                content: true,
                image: true,
                userID: true,
                threadID: true,
              },
            },
            following: {
              select: {
                ID: true,
                followingID: true,
                isFollow: true,
                following: {
                  select: {
                    ID: true,
                    username: true,
                    fullname: true,
                    profilePicture: true,
                  },
                },
              },
            },
            follower: {
              select: {
                ID: true,
                followerID: true,
                isFollow: true,
                follower: {
                  select: {
                    ID: true,
                    username: true,
                    fullname: true,
                    profilePicture: true,
                  },
                },
              },
            },
          },
        });

        // check if the user already exists in the redis
        const existingUserIndex = Array.from(usersData).findIndex(
          (users) => users.ID === userId
        );
        if (existingUserIndex !== -1 && usersPg !== null) {
          // if user already exists, update it
          usersData[existingUserIndex] = usersPg;
        } else {
          // if user doesn't exist, add it
          Array.from(usersData).push(usersPg);
        }
        await redis.setEx(
          cacheKey,
          DEFAULT_EXPIRATION,
          JSON.stringify(usersData)
        );
        if (usersData[existingUserIndex]) {
          return res.status(200).json({
            code: 200,
            message: "Find by id cache threads success",
            data: usersData[existingUserIndex],
          });
        }
      }

      const users = await this.UserRepository.findUniqueOrThrow({
        where: {
          ID: userId,
        },
        select: {
          ID: true,
          username: true,
          fullname: true,
          email: true,
          profilePicture: true,
          bio: true,
          threads: {
            select: {
              ID: true,
              content: true,
              image: true,
              userID: true,
              isLiked: true,
            },
          },
          likes: {
            select: {
              ID: true,
              userID: true,
              threadID: true,
            },
          },
          replies: {
            select: {
              ID: true,
              content: true,
              image: true,
              userID: true,
              threadID: true,
            },
          },
          following: {
            select: {
              ID: true,
              followingID: true,
              isFollow: true,
              following: {
                select: {
                  ID: true,
                  username: true,
                  fullname: true,
                  profilePicture: true,
                },
              },
            },
          },
          follower: {
            select: {
              ID: true,
              followerID: true,
              isFollow: true,
              follower: {
                select: {
                  ID: true,
                  username: true,
                  fullname: true,
                  profilePicture: true,
                },
              },
            },
          },
        },
      });

      if (!users) return res.status(404).json({ message: "User not found" });

      usersData.push(users);
      await redis.setEx(
        cacheKey,
        DEFAULT_EXPIRATION,
        JSON.stringify(usersData)
      );

      return res.status(200).json({
        code: 200,
        message: "Find by id user success",
        data: users,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }

  // async findByName(req: Request, res: Response): Promise<Response> {
  //   try {
  //     const name = req.params.name;

  //     const cache_key = `user_name`;
  //     if (!cache_key) return res.status(404).json({ message: "key not found" });

  //     let users_data: UserNameRedis[] = [];

  //     const cache = await redis.get(cache_key);
  //     if (cache) {
  //       users_data = JSON.parse(cache);
  //       const users_pg = await this.UserRepository.findMany({
  //         where: {
  //           fullname: name,
  //         },
  //         select: {
  //           id: true,
  //           username: true,
  //           fullname: true,
  //           email: true,
  //           profile_picture: true,
  //           bio: true,
  //           created_at: true,
  //           updated_at: true,
  //         },
  //       });

  //       // check if the user already exists in the redis
  //       const existingUserIndex = Array.from(users_data).findIndex(
  //         (users) => users.fullname === name
  //       );
  //       if (existingUserIndex !== -1 && users_pg !== null) {
  //         // if user already exists, update it
  //         users_data[existingUserIndex] = users_pg[0];
  //       } else {
  //         // if user doesn't exist, add it
  //         Array.from(users_data).push(users_pg[0]);
  //       }
  //       await redis.setEx(
  //         cache_key,
  //         DEFAULT_EXPIRATION,
  //         JSON.stringify(users_data)
  //       );
  //       if (users_data[existingUserIndex]) {
  //         return res.status(200).json({
  //           code: 200,
  //           message: "find by name cache threads success",
  //           data: users_data[existingUserIndex],
  //         });
  //       }
  //     }

  //     const user = await this.UserRepository.findMany({
  //       where: {
  //         fullname: name,
  //       },
  //       select: {
  //         id: true,
  //         username: true,
  //         fullname: true,
  //         email: true,
  //         profile_picture: true,
  //         bio: true,
  //         created_at: true,
  //         updated_at: true,
  //       },
  //     });
  //     if (!user) return res.status(404).json({ message: "user not found" });

  //     users_data.push(user[0]);
  //     await redis.setEx(
  //       cache_key,
  //       DEFAULT_EXPIRATION,
  //       JSON.stringify(users_data)
  //     );

  //     return res.status(200).json({
  //       code: 200,
  //       message: "find by name user success",
  //       data: user,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     return res.status(500).json({ message: error });
  //   }
  // }

  async findByName(req: Request, res: Response): Promise<Response> {
    try {
      const name = req.params.name;
      const user = await this.UserRepository.findMany({
        where: {
          fullname: name,
        },
      });

      if (!user) return res.status(404).json({ message: "User not found" });

      return res.status(200).json({
        code: 200,
        message: "Find by name user success",
        data: user,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }

  async getSuggestedUser(req: Request, res: Response): Promise<Response> {
    try {
      const limit = parseInt(req.query.limit as string) || 5;

      const userid = res.locals.loginSession.User.id;
      const followingUsers = await this.UserRepository.findFirstOrThrow({
        where: { ID: userid },
        select: {
          ID: true,
          fullname: true,
          following: {
            select: {
              followingID: true,
            },
          },
        },
      });

      const followings = followingUsers.following.map(
        (item) => item.followingID
      );

      const users = await this.UserRepository.findMany({
        select: {
          ID: true,
          fullname: true,
          username: true,
          profilePicture: true,
        },
      });

      const data: any[] = [];
      for (let i = 0; i < users.length; i++) {
        if (users[i].ID !== userid && !followings.includes(users[i].ID)) {
          data.push(users[i]);
        }
      }
      const randomUsers = data.sort(() => 0.5 - Math.random()).slice(0, limit);

      return res.status(200).json({
        code: 200,
        message: "Get suggested user success",
        data: randomUsers,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }

  async updateWithoutImage(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.params.userID;
      if (!isValidUUID(userId)) {
        return res.status(400).json({ message: "Invalid UUID" });
      }

      const session = res.locals.loginSession.User.id;

      if (userId !== session)
        return res
          .status(403)
          .json({ message: "Unauthorization : You're not user login " });

      const user = await this.UserRepository.findUnique({
        where: { ID: userId },
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
      const usernameUUIDpart = id.substring(0, 8).replace(/-/g, "");

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
        where: { ID: userId },
        data: {
          fullname: fullname,
          username: username,
          password: hashPassword,
          bio: bio,
        },
      });

      return res.status(201).json({
        code: 201,
        message: "Upload data profile success",
        data: updateUser,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }

  async uploadProfilePicture(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.params.userID;

      if (!isValidUUID(userId)) {
        return res.status(400).json({ message: "Invalid UUID" });
      }

      const session = res.locals.loginSession.User.id;

      if (userId !== session)
        return res
          .status(403)
          .json({ message: "Unauthorization : You're not user Login " });

      const image = req.file;
      if (!image) return res.status(400).json({ message: "No image provided" });

      const oldUserData = await this.UserRepository.findUnique({
        where: { ID: userId },
        select: { profilePicture: true },
      });

      const cloudinaryUpload = await cloudinary.uploader.upload(image.path, {
        folder: "circle",
      });

      const profile_pictureURL = cloudinaryUpload.secure_url;

      fs.unlinkSync(image.path);

      if (oldUserData && oldUserData.profilePicture) {
        const publicId = oldUserData.profilePicture
          .split("/")
          .pop()
          ?.split(".")[0];
        await cloudinary.uploader.destroy(publicId as string);
      }

      const updateUser = await this.UserRepository.update({
        where: { ID: userId },
        data: {
          profilePicture: profile_pictureURL,
        },
      });

      return res.status(201).json({
        code: 201,
        message: "Upload picture profile success",
        data: updateUser,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.params.userID;
      if (!isValidUUID(userId)) {
        return res.status(400).json({ message: "Invalid UUID" });
      }

      const session = res.locals.loginSession.User.id;

      if (userId !== session) {
        return res
          .status(403)
          .json({ message: "Unauthorization : You're not user login " });
      }

      const body = req.body;
      const { error } = update.validate(body);
      if (error) return res.status(400).json({ message: error.message });
      console.log(body);

      const image = req.file;

      const user = await this.UserRepository.findUnique({
        where: { ID: userId },
      });
      if (!user) return res.status(404).json({ message: "User not found" });

      // ==================== UPDATE DATA ==================== //
      let hashPassword = user.password;
      let fullname = user.fullname;
      let bio = user.bio;
      let username = user.username;

      const id = uuidv4();
      const usernameUUIDpart = id.substring(0, 8).replace(/-/g, "");

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

      // ==================== UPLOAD IMAGE ==================== //
      const oldUserData = await this.UserRepository.findUniqueOrThrow({
        where: { ID: userId },
        select: { profilePicture: true },
      });

      let cloudinaryUpload: UploadApiResponse;
      let profilePictureURL: string = "";
      if (!image) {
        cloudinaryUpload = await cloudinary.uploader.upload(
          oldUserData.profilePicture,
          {
            folder: "circle",
          }
        );

        profilePictureURL = cloudinaryUpload.secure_url;

        if (oldUserData && oldUserData.profilePicture) {
          const publicId = oldUserData.profilePicture
            .split("/")
            .pop()
            ?.split(".")[0];
          await cloudinary.uploader.destroy(publicId as string);
        }
      } else {
        cloudinaryUpload = await cloudinary.uploader.upload(image.path, {
          folder: "circle",
        });

        profilePictureURL = cloudinaryUpload.secure_url;

        fs.unlinkSync(image.path);

        if (oldUserData && oldUserData.profilePicture) {
          const publicId = oldUserData.profilePicture
            .split("/")
            .pop()
            ?.split(".")[0];
          await cloudinary.uploader.destroy(publicId as string);
        }
      }

      const updated = await this.UserRepository.update({
        where: { ID: userId },
        data: {
          profilePicture: profilePictureURL,
          password: hashPassword,
          username: username,
          fullname: fullname,
          bio: bio,
        },
      });

      return res.status(201).json({
        code: 201,
        message: "Update user success",
        data: updated,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.params.userID;
      if (!isValidUUID(userId)) {
        return res.status(400).json({ message: "Invalid UUID" });
      }

      const session = res.locals.loginSession.User.id;
      if (userId !== session)
        return res
          .status(403)
          .json({ message: "Unauthorization : You're not user login" });

      const userDelete = await this.UserRepository.findUnique({
        where: { ID: userId },
        include: {
          threads: true,
          likes: true,
          replies: true,
        },
      });

      // Menghapus user delete untuk sesama user yang salaing folow
      if (!userDelete) {
        return res.status(400).json({ message: "User not found" });
      }
      await this.UserFollowingRepository.deleteMany({
        where: {
          OR: [{ followerID: userId }, { followingID: userId }],
        },
      });

      await Promise.all([
        this.ThreadRepository.deleteMany({ where: { userID: userId } }),
        this.LikeRepository.deleteMany({ where: { userID: userId } }),
        this.ReplyRepository.deleteMany({ where: { userID: userId } }),
      ]);

      const deleteUser = await this.UserRepository.delete({
        where: { ID: userId },
      });

      return res.status(200).json({
        code: 200,
        message: "Delete user success",
        data: deleteUser,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }
})();
