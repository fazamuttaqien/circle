import { useAppSelectore } from "@/redux/store";
import { API } from "@/utils/api";
import getError from "@/utils/getError";
import { useState, ChangeEvent, useEffect } from "react";
import { toast } from "react-toastify";

export function useEditProfile() {
  const profile = useAppSelectore((state) => state.profile);
  const [form, setForm] = useState<EditProfileType>({
    fullname: "",
    password: "",
    bio: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isEditProfileSuccess, setIsEditProfileSuccess] =
    useState<boolean>(false);

  useEffect(() => {
    setForm({
      fullname: profile.data?.fullname || "",
      password: "",
      bio: "",
    });
  }, [profile]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("JWT token not found in localStorage.");
  }
  const decodedToken = token.split(".")[1];
  const userData = JSON.parse(atob(decodedToken));
  const idUser = userData?.User?.id;

  async function handleEditProfile() {
    try {
      setIsLoading(true);

      const response = await API.put(`users/nopp/${idUser}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(response.data.message, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      setIsError(false);
      setError("");
      setIsEditProfileSuccess(true);
    } catch (error) {
      setIsError(true);
      setError(getError(error));
    } finally {
      setIsLoading(false);
    }
  }

  return {
    form,
    handleChange,
    handleEditProfile,
    isLoading,
    isError,
    error,
    isEditProfileSuccess,
  };
}
