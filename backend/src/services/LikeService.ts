import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

function isValidUUID(uuid: string): boolean {
  const UUIDRegex =
    /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
  return UUIDRegex.test(uuid);
}

export default new (class LikeService {
  private readonly LikeRepository = prisma.like;
  private readonly UserRepository = prisma.user;
  private readonly ThreadRepository = prisma.thread;

  async like(req: Request, res: Response): Promise<Response> {
    try {
      const threadId = req.params.threadID;

      if (!isValidUUID(threadId)) {
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
        include: {
          likes: true,
        },
      });
      if (!threadSelected)
        return res.status(404).json({ message: "Thread not found" });

      const exitingLike = threadSelected.likes.find(
        (like) => like.userID === userId
      );

      if (exitingLike) {
        await this.LikeRepository.delete({
          where: {
            ID: exitingLike.ID,
          },
        });

        await this.ThreadRepository.update({
          where: { ID: threadId },
          data: {
            isLiked: false,
          },
        });

        return res.status(200).json({
          code: 200,
          message: "Undo like thread success",
        });
      }

      const likeThread = await this.LikeRepository.create({
        data: {
          userID: userSelected.ID,
          threadID: threadSelected.ID,
        },
      });

      await this.ThreadRepository.update({
        where: { ID: threadId },
        data: {
          isLiked: true,
        },
      });

      return res.status(200).json({
        code: 200,
        message: "Like thread success",
        data: likeThread,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  }
})();
