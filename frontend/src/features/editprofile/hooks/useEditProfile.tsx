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
    image: undefined,
  });
  const [avatar, setAvatar] = useState<string | null>(null);
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
      image: undefined,
    });
  }, [profile]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setForm({
        image: file,
      });
      const reader = new FileReader();
      reader.onload = () => {
        const dataURL = reader.result as string;
        setAvatar(dataURL);
      };
      reader.readAsDataURL(file);
    }
  };

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
      const response = await API.put(`users/${idUser}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
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
    avatar,
    handleChange,
    handleEditProfile,
    handleImageChange,
    isLoading,
    isError,
    error,
    isEditProfileSuccess,
  };
}
