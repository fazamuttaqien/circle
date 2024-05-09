import { API } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
const token = localStorage.getItem("token");

// const fetchUser = async (name: string) => {
//   if (!name) {
//     return { data: [] };
//   }

//   const response = await API.get(`usersbyname/${name}`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   return response.data;
// };

// export const useSearch = (name: string) => {
//   if (!name) {
//     return {
//       isLoading: false,
//       isError: false,
//       data: { data: [] },
//       refetch: () => {},
//     };
//   }

//   return useQuery({
//     queryKey: ["detail-user", name],
//     queryFn: () => fetchUser(name),
//     staleTime: 10000,
//     refetchOnWindowFocus: false,
//   });
// };

const fetchUser = async (name: string) => {
  if (!name) {
    return { data: [] };
  }
  const response = await API.get(`usersbyname/${name}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const useSearch = (name: string) => {
  return useQuery({
    queryKey: ["detail-user"],
    queryFn: () => fetchUser(name),
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });
};
