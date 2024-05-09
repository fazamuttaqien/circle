import { useAppSelectore } from "@/redux/store";
import { API } from "@/utils/api";
import getError from "@/utils/getError";
import { useState, ChangeEvent, useEffect } from "react";
import { toast } from "react-toastify";

export function userEditProfilePicture() {
  const profile = useAppSelectore((state) => state.profile);
  const [form, setForm] = useState<EditProfilePictureType>({
    image: undefined,
  });
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoadingProfilePicture, setIsLoadingProfilePicture] =
    useState<boolean>(false);
  const [isErrorProfilePicture, setIsErrorProfilePicture] =
    useState<boolean>(false);
  const [errorProfilePicture, setErrorProfilePicture] = useState<string>("");
  const [isEditProfilePictureSuccess, setIsEditProfilePictureSuccess] =
    useState<boolean>(false);

  useEffect(() => {
    setForm({
      image: stringToFile(
        profile.data?.profile_picture || "",
        "image.png",
        "text/plain"
      ),
    });
  }, [profile]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
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

  async function handleEditProfilePicture() {
    try {
      setIsLoadingProfilePicture(true);

      const response = await API.put(`/users/profilepicture/${idUser}`, form, {
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
      setIsErrorProfilePicture(false);
      setErrorProfilePicture("");
      setIsEditProfilePictureSuccess(true);
    } catch (error) {
      setIsErrorProfilePicture(true);
      setErrorProfilePicture(getError(error));
    } finally {
      setIsLoadingProfilePicture(false);
    }
  }

  return {
    form,
    avatar,
    isLoadingProfilePicture,
    isErrorProfilePicture,
    errorProfilePicture,
    isEditProfilePictureSuccess,
    handleChange,
    handleImageChange,
    handleEditProfilePicture,
  };
}

function stringToFile(data: string, filename: string, mimeType: string): File {
  const blob = new Blob([data], { type: mimeType });
  const file = new File([blob], filename, { type: mimeType });
  return file;
}
