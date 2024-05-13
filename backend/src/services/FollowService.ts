import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

function isValidUUID(uuid: string): boolean {
  const UUIDRegex =
    /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
  return UUIDRegex.test(uuid);
}

export default new (class FollowService {
  private readonly UserRepository = prisma.user;
  private readonly UserFollowingRepository = prisma.follow;

  async follow(req: Request, res: Response): Promise<Response> {
    try {
      const followingId = req.params.followingID;
      if (!isValidUUID(followingId)) {
        return res.status(400).json({ message: "Invalid UUID" });
      }

      const userId = res.locals.loginSession.User.id;

      if (followingId == userId)
        return res.status(400).json({ message: "You cant follow your self" });

      const followingUser = await this.UserRepository.findUnique({
        where: {
          ID: followingId,
        },
      });

      if (!followingUser)
        return res.status(404).json({ message: "User not found" });

      const followerUser = await this.UserRepository.findUnique({
        where: {
          ID: userId,
        },
      });

      if (!followerUser)
        return res.status(404).json({ message: "User not found" });

      const exitingFollow = await this.UserFollowingRepository.findFirst({
        where: {
          followerID: userId,
          followingID: followingId,
        },
      });

      if (exitingFollow) {
        await this.UserFollowingRepository.delete({
          where: {
            ID: exitingFollow.ID,
          },
        });
        return res.status(200).json({ message: "You unfollow this user" });
      }

      const followUser = await this.UserFollowingRepository.create({
        data: {
          followerID: userId,
          followingID: followingId,
          isFollow: true,
        },
        select: {
          ID: true,
          followerID: true,
          followingID: true,
          follower: {
            select: {
              ID: true,
              username: true,
              fullname: true,
              profilePicture: true,
            },
          },
          following: {
            select: {
              ID: true,
              username: true,
              fullname: true,
              profilePicture: true,
            },
          },
          folowedAt: true,
          isFollow: true,
        },
      });

      return res.status(201).json({
        code: 201,
        message: "Follow user success",
        data: followUser,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }
})();
