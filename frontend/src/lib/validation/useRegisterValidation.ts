import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

export interface IFormInput {
  email: string;
  password: string;
  fullname: string;
}

export const useRegisterValidation = () => {
  const initialValue: IFormInput = {
    email: "",
    password: "",
    fullname: "",
  };

  const schema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup
      .string()
      .required()
      .min(8, "Password must be at least 8 characters"),
    fullname: yup
      .string()
      .required()
      .min(4, "Fullname must be at least 4 characters"),
  });

  return useForm<IFormInput>({
    defaultValues: initialValue,
    resolver: yupResolver(schema),
    mode: "all",
    reValidateMode: "onSubmit",
  });
};
