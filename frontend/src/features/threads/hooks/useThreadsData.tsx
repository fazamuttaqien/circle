import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import { API } from "../../../utils/api";
import getError from "../../../utils/getError";
const token = localStorage.getItem("token");

//  fecth infinite threads
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
//  fetch infinity threads

//  post threads
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
//  post threads

//  like threads
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
//  like threads

//  delete threads
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
//  delete threads

//  detail threads
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
//  detail threads

//  post reply
const postReply = (reply: ReplyPostType) => {
  const threadId = reply.threadId;
  const payload = {
    ...reply,
  };
  delete payload.threadId;
  return API.post(`replies/${threadId}/reply`, payload, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
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
//  post reply
