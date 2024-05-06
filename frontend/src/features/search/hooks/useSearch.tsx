import { API } from "../../../utils/api";
import { useQuery } from "@tanstack/react-query";
const token = localStorage.getItem("token");

const fetchUser = async (name: string) => {
  const response = await API.get(`users/name/${name}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const useSearch = (name: string) => {
  return useQuery({
    queryKey: ["todos-key"],
    queryFn: () => fetchUser(name),
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });
};
