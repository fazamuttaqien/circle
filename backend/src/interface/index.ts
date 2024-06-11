// =============================================  REDIS =============================================
interface ThreadRedis {
  ID: string;
  content: string;
  image: string[] | null;
  userID: string;
  isLiked: boolean | null;
  createdAt?: Date | string;
  likes: {
    ID: string;
    userID: string;
    threadID: string;
  }[];
  replies: {
    ID: string;
    content: string;
    image?: string | null;
    createdAt?: Date | string;
    threadID: string;
    userID: string;
  }[];
  user: {
    ID: string;
    username: string;
    fullname: string;
    email: string;
    avatar: string;
    bio: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };
}

interface UserRedis {
  ID: string;
  username: string;
  fullname: string;
  email: string;
  avatar: string;
  bio: string;
  likes: {
    ID: string;
    userID: string;
    threadID: string;
  }[];
  replies: {
    ID: string;
    content: string;
    image?: string | null;
    threadID: string;
    userID: string;
  }[];
  threads: {
    ID: string;
    content: string;
    image: string[];
    userID: string;
    isLiked: boolean | null;
  }[];
  follower: {
    ID: string;
    followerID: string;
    isFollow: boolean | null;
    follower: {
      ID: string;
      username: string;
      fullname: string;
      avatar: string;
    };
  }[];
  following: {
    ID: string;
    followingID: string;
    isFollow: boolean | null;
    following: {
      ID: string;
      username: string;
      fullname: string;
      avatar: string;
    };
  }[];
}

interface UserNameRedis {
  ID: string;
  username: string;
  fullname: string;
  email: string;
  avatar: string;
  bio: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export type { UserRedis, ThreadRedis, UserNameRedis };
