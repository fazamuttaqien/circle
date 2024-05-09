import { API } from "@/utils/api";
import getError from "@/utils/getError";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { toast } from "react-toastify";

const token = localStorage.getItem("token");

//  FETCH INFINITY THREADS
const fecthInfinityThreads = async ({ pageParam = 1 }) => {
  const response = await API.get(`threads/${pageParam}`, {
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
  });
};

//  POST THREADS
const postThread = (thread: ThreadPostType) => {
  return API.post("threads", thread, {
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
      toast.error(getError(error)),
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        };
    },
  });
};

//  LIKE THREADS
const postLikeThread = (threadId: string) => {
  return API.post(`likes/${threadId}/like`, "", {
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
      toast.error(getError(error)),
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        };
    },
  });
};

//  DELETE THREADS
const deleteThread = (threadId: string) => {
  return API.delete(`threads/${threadId}`, {
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
      toast.error(getError(error)),
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        };
    },
  });
};

//  DETAIL THREADS
const fetchDetailThread = async (threadId: string) => {
  const response = await API.get(`threads/byid/${threadId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const useDetailThread = (threadId: string) => {
  return useQuery({
    queryKey: ["detail-thread"],
    queryFn: () => fetchDetailThread(threadId),
    refetchOnWindowFocus: false,
  });
};

//  POST REPLY
const postReply = async (reply: ReplyPostType) => {
  const threadId = reply.threadId;
  const payload = {
    ...reply,
  };
  delete payload.threadId;
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
      toast.error(getError(error), {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    },
  });
};

//  DELETE REPLY
const deleteReply = (replyId: string) => {
  return API.delete(`replies/${replyId}`, {
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
      toast.error(getError(error)),
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        };
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
      toast.error(getError(error), {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    },
  });
};
