import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { update } from "../utils/AuthUtil";
import { v4 as uuidv4 } from "uuid";
import * as bcyrpt from "bcrypt";
import cloudinary from "../config";
import * as fs from "fs";

const prisma = new PrismaClient();

function isValidUUID(uuid: string): boolean {
  const UUIDRegex =
    /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
  // const UUIDRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{3}-[a-f0-9]{3}-[a-f0-9]{12}$/i
  return UUIDRegex.test(uuid);
}

export default new (class UserService {
  private readonly UserRepository = prisma.user;
  private readonly ThreadRepository = prisma.thread;
  private readonly LikeRepository = prisma.like;
  private readonly ReplyRepository = prisma.reply;
  private readonly UserFollowingRepository = prisma.follow;

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

      const users = await this.UserRepository.findMany({
        skip,
        take: pageSize,
      });

      // calculating the total number of users in the database (for pagination)
      const totalUsers = await this.UserRepository.count();

      // calculate the number of pages based on the total number of users
      const totalPages = Math.ceil(totalUsers / pageSize);
      // const totalPages = Math.floor(totalUsers / pageSize)

      if (page > totalPages)
        return res.status(404).json({ message: "page not found" });
      // when a user inputs pages that exceed the available page capacity
      // the system will issue an error that the page does not exist

      const userss = {
        users,
        pagination: {
          totalUsers,
          totalPages,
          currentPage: page,
          pageSize,
        },
      };

      return res.status(200).json({
        code: 200,
        status: "Success",
        message: "Find All User Success",
        data: userss,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error });
    }
  }

  async findByID(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.params.userId;

      if (!isValidUUID(userId)) {
        return res.status(400).json({ message: "Invalid UUID" });
      }

      const users = await this.UserRepository.findUnique({
        where: {
          id: userId,
        },
        include: {
          threads: true,
          likes: true,
          replies: true,
          following: true,
          follower: true,
        },
      });

      if (!users) return res.status(404).json({ message: "User not found" });

      return res.status(200).json({
        code: 200,
        status: "Success",
        message: "Find By ID User Success",
        data: users,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error });
    }
  }

  async findByName(req: Request, res: Response): Promise<Response> {
    try {
      const name = req.params.name;
      console.log(name);

      const user = await this.UserRepository.findMany({
        where: {
          fullname: name,
        },
      });

      if (!user) return res.status(404).json({ message: "User not found" });

      return res.status(200).json({
        code: 200,
        status: "Success",
        message: "Find By Name User Success",
        data: user,
      });
    } catch (error) {
      console.log(error);
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
