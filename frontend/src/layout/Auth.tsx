import { useAppSelectore } from "@/redux/store";
import { FC, ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: ReactNode;
}

const Auth: FC<Props> = ({ children }) => {
  const auth = useAppSelectore((state) => state.auth);

  if (auth.isLogin) {
    return <Navigate to={"/"} />;
  }

  return <>{children}</>;
};

export default Auth;
