import { Fragment, ReactNode, useEffect } from "react";
import { Flex, useDisclosure } from "@chakra-ui/react";
import Sidebar from "@/components/Sidebar";
import Widget from "@/components/Widget";
import { useAppSelectore } from "@/redux/store";
import { useNavigate } from "react-router-dom";

export default function Main({ children }: { children: ReactNode }) {
  const { onClose } = useDisclosure();

  const auth = useAppSelectore((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isLogin) {
      navigate("/");
    }
  }, []);

  return (
    <Fragment>
      <Flex color="white" h={"100vh"} mx={"10%"}>
        <Sidebar closeDrawer={onClose} />
        {children}
        <Widget />
      </Flex>
    </Fragment>
  );
}
