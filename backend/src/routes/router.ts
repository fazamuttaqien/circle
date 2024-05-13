import * as express from "express";
import * as path from "path";
import AuthController from "../controllers/AuthController";
import AuthMiddelware from "../middlewares/AuthMiddelware";
import upload from "../middlewares/UploadMiddleware";
import UserController from "../controllers/UserController";
import ThreadController from "../controllers/ThreadController";
import FollowController from "../controllers/FollowController";
import LikeController from "../controllers/LikeController";
import ReplyController from "../controllers/ReplyController";

const router = express.Router();

// Auth
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthMiddelware.Auth, AuthController.logout);
router.get("/check", AuthMiddelware.Auth, AuthController.check);

// Follow
router.post(
  "/follows/:followingID",
  AuthMiddelware.Auth,
  FollowController.follow
);

// Like
router.post("/likes/:threadID/like", AuthMiddelware.Auth, LikeController.like);

// Reply
router.post(
  "/replies/:threadID/reply",
  AuthMiddelware.Auth,
  upload.single("image"),
  ReplyController.addReply
);
router.put(
  "/replies/:threadID/reply/:replyID",
  AuthMiddelware.Auth,
  upload.single("image"),
  ReplyController.updateReply
);
router.delete(
  "/replies/:replyID",
  AuthMiddelware.Auth,
  ReplyController.deleteReply
);

// Thread
router.get("/threads/:page", AuthMiddelware.Auth, ThreadController.findAll);
router.get(
  "/threads/byid/:threadID",
  AuthMiddelware.Auth,
  ThreadController.findByID
);
router.post(
  "/threads",
  AuthMiddelware.Auth,
  upload.any(),
  ThreadController.addThread
);
router.put(
  "/threads/:threadID",
  AuthMiddelware.Auth,
  upload.any(),
  ThreadController.updateThread
);
router.delete(
  "/threads/:threadID",
  AuthMiddelware.Auth,
  ThreadController.deleteThread
);

// Thread Queue
router.post(
  "/threads/queue",
  AuthMiddelware.Auth,
  upload.any(),
  ThreadController.addThreadQueue
);
router.put(
  "/threads/queue/:threadID",
  AuthMiddelware.Auth,
  upload.any(),
  ThreadController.updateThreadQueue
);

// Thread Redis
router.get(
  "/threads/cache/:page",
  AuthMiddelware.Auth,
  ThreadController.findAllRedis
);

// User
router.get("/users", AuthMiddelware.Auth, UserController.findAll);
router.get("/users/:userID", AuthMiddelware.Auth, UserController.findByID);
router.get(
  "/usersbyname/:name",
  AuthMiddelware.Auth,
  UserController.findByName
);
router.get(
  "/users/suggested/:limit",
  AuthMiddelware.Auth,
  UserController.getSuggestedUser
);

router.put(
  "/users/noprofilepicture/:userID",
  AuthMiddelware.Auth,
  UserController.updateWithoutImage
);

router.put(
  "/users/profilepicture/:userID",
  AuthMiddelware.Auth,
  upload.single("image"),
  UserController.uploadProfilePicture
);

router.put(
  "/users/:userID",
  AuthMiddelware.Auth,
  upload.single("image"),
  UserController.update
);
router.delete("/users/:userID", AuthMiddelware.Auth, UserController.delete);
router.use("/uploads", express.static(path.join(__dirname, "uploads")));

export default router;
