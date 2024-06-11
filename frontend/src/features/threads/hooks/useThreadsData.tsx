import { API } from "@/utils/api";
import getError from "@/utils/getError";
import { toastError } from "@/utils/toast";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";

const token = localStorage.getItem("token");

//  FETCH INFINITY THREADS
const fecthInfinityThreads = async ({ pageParam = 1 }) => {
  const response = await API.get(`threads/cache/${pageParam}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const useInfinityThreads = () => {
  return useInfiniteQuery({
    queryKey: ["threads-infinity"],
    queryFn: fecthInfinityThreads,
    refetchOnWindowFocus: false,
    getNextPageParam: (LastPage, pages) => {
      if (LastPage.data.data.length) {
        return pages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: true,
  });
};

//  POST THREADS
const postThread = async (thread: ThreadPostType) => {
  return await API.post("threads", thread, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

export const usePostThread = (reset: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postThread,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["threads-infinity"],
      });
      reset();
    },
    onError: (error) => {
      toastError(getError(error));
    },
  });
};

//  LIKE THREADS
const postLikeThread = async (threadID: string) => {
  return await API.post(`likes/${threadID}/like`, "", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const usePostLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postLikeThread,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["threads-infinity"],
      });
    },
    onError: (error) => {
      toastError(getError(error));
    },
  });
};

//  DELETE THREADS
const deleteThread = async (threadID: string) => {
  return await API.delete(`threads/${threadID}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const useDeleteThread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteThread,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["threads-infinity"],
      });
    },
    onError: (error) => {
      toastError(getError(error));
    },
  });
};

//  DETAIL THREADS
const fetchDetailThread = async (threadID: string) => {
  const response = await API.get(`threads/byid/${threadID}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const useDetailThread = (threadID: string) => {
  return useQuery({
    queryKey: ["detail-thread"],
    queryFn: () => fetchDetailThread(threadID),
    refetchOnWindowFocus: false,
  });
};

// UDPATE THREADS
const updateThread = async (thread: ThreadUpdateType) => {
  const threadId = thread.threadID;
  const payload = {
    ...thread,
  };
  delete payload.threadID;

  const response = await API.put(`/threads/${threadId}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const useUpdateThread = (reset: () => void) => {
  const queryCLient = useQueryClient();

  return useMutation({
    mutationFn: updateThread,
    onSuccess: () => {
      queryCLient.invalidateQueries({
        queryKey: ["threads-infinity"],
      });
      reset();
    },
    onError: (error) => {
      toastError(getError(error));
    },
  });
};

//  POST REPLY
const postReply = async (reply: ReplyPostType) => {
  const threadId = reply.threadID;
  const payload = {
    ...reply,
  };
  delete payload.threadID;
  const response = await API.post(`replies/${threadId}/reply`, payload, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const usePostReply = (reset: () => void) => {
  const queryCLient = useQueryClient();

  return useMutation({
    mutationFn: postReply,
    onSuccess: () => {
      queryCLient.invalidateQueries({
        queryKey: ["detail-thread"],
      });
      reset();
    },
    onError: (error) => {
      toastError(getError(error));
    },
  });
};

//  DELETE REPLY
const deleteReply = async (replyID: string) => {
  return await API.delete(`replies/${replyID}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const useDeleteReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReply,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["detail-thread"],
      });
    },
    onError: (error) => {
      toastError(getError(error));
    },
  });
};

// UPDATE REPLY
const updateReply = async (reply: ReplyUpdateType) => {
  const threadId = reply.threadID;
  const replyId = reply.replyID;
  const payload = {
    ...reply,
  };

  delete payload.threadID;
  delete payload.replyID;

  const response = await API.put(
    `replies/${threadId}/reply/${replyId}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const useUpdateReply = (reset: () => void) => {
  const queryCLient = useQueryClient();

  return useMutation({
    mutationFn: updateReply,
    onSuccess: () => {
      queryCLient.invalidateQueries({
        queryKey: ["detail-thread"],
      });
      reset();
    },
    onError: (error) => {
      toastError(getError(error));
    },
  });
};

// UPDATE PROFILE PICTURE
const updateProfilePicture = async (user: EditProfileType) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("JWT token not found in localStorage.");
  }
  const decodedToken = token.split(".")[1];
  const userData = JSON.parse(atob(decodedToken));
  const idUser = userData?.User?.id;

  const payload = {
    ...user,
  };
  delete payload.image;
  delete payload.fullname;
  delete payload.bio;
  delete payload.password;

  const response = await API.put(`users/${idUser}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const usePutProfile = (reset: () => void) => {
  const queryCLient = useQueryClient();

  return useMutation({
    mutationFn: updateProfilePicture,
    onSuccess: () => {
      queryCLient.invalidateQueries({
        queryKey: ["detail-profile"],
      });
      reset();
    },
    onError: (error) => {
      toastError(getError(error));
    },
  });
};
