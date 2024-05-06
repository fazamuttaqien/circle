// =============================================  REDIS =============================================
interface ThreadRedis {
  id: string;
  content: string;
  image: string[] | null;
  user_id: string;
  isLiked: boolean | null;
  // created_at?: Date | string;
  likes: {
    id: string;
    user_id: string;
    thread_id: string;
  }[];
  replies: {
    id: string;
    content: string;
    image?: string | null;
    // created_at?: Date | string;
    thread_id: string;
    user_id: string;
  }[];
  user: {
    id: string;
    username: string;
    fullname: string;
    email: string;
    profile_picture: string;
    bio: string;
    // created_at?: Date | string;
    // updated_at?: Date | string;
  };
}

interface UserRedis {
  id: string;
  username: string;
  fullname: string;
  email: string;
  profile_picture: string;
  bio: string;
  likes: {
    id: string;
    user_id: string;
    thread_id: string;
  }[];
  replies: {
    id: string;
    content: string;
    image?: string | null;
    thread_id: string;
    user_id: string;
  }[];
  threads: {
    id: string;
    content: string;
    image: string[];
    user_id: string;
    isLiked: boolean | null;
  }[];
  followers: {
    id: string;
    followerId: string;
    isFollow: boolean | null;
  }[];
  following: {
    id: string;
    followingId: string;
    isFollow: boolean | null;
  }[];
}

interface UserNameRedis {
  id: string;
  username: string;
  fullname: string;
  email: string;
  profile_picture: string;
  bio: string;
  created_at?: Date | null;
  updated_at?: Date | null;
}

export type { UserRedis, ThreadRedis, UserNameRedis };
