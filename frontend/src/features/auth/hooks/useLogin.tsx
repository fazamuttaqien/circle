import {
  IFormInput,
  useLoginValidation,
} from "@/lib/validation/useLoginValidation";
import { API } from "@/utils/api";
import getError from "@/utils/getError";
import { toastSuccess } from "@/utils/toast";
import { useState } from "react";
import { SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export function useLogin() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setisError] = useState<boolean>(false);
  const [error, seterror] = useState<string>("");
  const [isLoginSuccess, setisLoginSuccess] = useState<boolean>(false);

  const navigate = useNavigate();

  const { control, reset, handleSubmit, getValues } = useLoginValidation();

  const handleLogin: SubmitHandler<IFormInput> = async () => {
    try {
      setIsLoading(true);

      const { email, password } = getValues();
      const response = await API.post("login", { email, password });

      toastSuccess(response.data.message);
      localStorage.setItem("token", response.data.token);

      setisError(false);
      seterror("");
      setisLoginSuccess(true);

      navigate("/");
    } catch (error: any) {
      setisError(true);
      seterror(getError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    control,
    reset,
    handleSubmit,
    handleLogin,
    isLoading,
    isError,
    error,
    isLoginSuccess,
  };
}
