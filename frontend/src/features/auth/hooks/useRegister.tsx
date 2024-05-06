import { API } from "@/utils/api";
import getError from "@/utils/getError";
import { useState, ChangeEvent } from "react";
import { toast } from "react-toastify";

export function useRegister() {
  const [form, setForm] = useState<Register>({
    fullname: "",
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setisError] = useState<boolean>(false);
  const [error, seterror] = useState<string>("");
  const [isRegisterSuccess, setisRegisterSuccess] = useState<boolean>(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleRegister() {
    try {
      setIsLoading(true);

      const response = await API.post("register", form);

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
      setisError(false);
      seterror("");
      setisRegisterSuccess(true);
    } catch (error: any) {
      setisError(true);
      seterror(getError(error));
    } finally {
      setIsLoading(false);
    }
  }

  return {
    form,
    handleChange,
    handleRegister,
    isLoading,
    isError,
    error,
    isRegisterSuccess,
  };
}
