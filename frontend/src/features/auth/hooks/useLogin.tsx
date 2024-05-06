import { API } from "@/utils/api";
import getError from "@/utils/getError";
import { useState, ChangeEvent } from "react";
import { toast } from "react-toastify";

export function useLogin() {
  const [form, setForm] = useState<Login>({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setisError] = useState<boolean>(false);
  const [error, seterror] = useState<string>("");
  const [isLoginSuccess, setisLoginSuccess] = useState<boolean>(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleLogin() {
    try {
      setIsLoading(true);

      const response = await API.post("login", form);

      console.log(response);

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

      localStorage.setItem("token", response.data.token);

      setisError(false);
      seterror("");
      setisLoginSuccess(true);
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
    handleLogin,
    isLoading,
    isError,
    error,
    isLoginSuccess,
  };
}
