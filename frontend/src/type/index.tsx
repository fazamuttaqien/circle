interface Register {
  fullname: string;
  email: string;
  password: string;
}

interface Login {
  email: string;
  password: string;
}

interface FollowType {
  ID: string;
  follower: FillFollower;
  following: FillFollower;
  isFollow: boolean;
}

interface FillFollower {
  ID: string;
  username: string;
  fullname: string;
  profilePicture: string;
}

interface UserProfileType {
  ID: string;
  username: string;
  fullname: string;
  email: string;
  password: null;
  profilePicture: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
  follower: FollowType[];
  following: FollowType[];
}

interface SearchUserType {
  ID: string;
  username: string;
  fullname: string;
  email: string;
  password: null;
  profilePicture: string;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Suggested {
  ID: string;
  username: string;
  fullname: string;
  profilePicture: string;
}

interface EditProfileType {
  fullname?: string;
  password?: string;
  bio?: string;
  image?: File;
}

interface EditProfilePictureType {
  image?: File;
}

interface ThreadPostType {
  content: string;
  image?: File[];
}

interface ThreadUpdateType {
  content: string;
  image?: File[];
  threadID?: string;
}

interface ReplyPostType {
  content: string;
  image?: File;
  threadID?: string;
}

interface ReplyUpdateType {
  content: string;
  image?: File;
  isEdited?: boolean;
  threadID?: string;
  replyID?: string;
}

interface ThreadHomeType {
  ID: string;
  content: string;
  image: string[];
  isEdited?: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    ID: string;
    username: string;
    fullname: string;
    profilePicture: string;
  };
  likes: ThreadLikeType[];
  replies: {
    length: number;
  };
  isLiked: boolean;
}

interface ThreadLikeType {
  ID: string;
  createdAt: string;
  updatedAt: string;
  user: {
    ID: string;
    username: string;
    fullname: string;
    profilePicture: string;
  };
}

interface ThreadReplyType {
  ID: string;
  content: string;
  image: string;
  threadID: string;
  isEdited?: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    ID: string;
    username: string;
    fullname: string;
    profilePicture: string;
  };
}
