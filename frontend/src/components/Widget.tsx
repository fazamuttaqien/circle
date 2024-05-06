import { Box } from "@chakra-ui/react";
import { Fragment } from "react";
import Watermark from "../components/Watermark";
import Profile from "./Profile";
import Suggested from "./Suggested";

export default function Widget() {
  return (
    <Fragment>
      <Box
        w={{ base: "37%", "2xl": "30%" }}
        px={10}
        py={10}
        style={{ borderLeft: "3px solid #3a3a3a" }}
        overflow={"auto"}
        className="hide-scroll"
        display={{ base: "none", xl: "block" }}
      >
        <Profile />
        <Suggested />
        <Watermark />
      </Box>
    </Fragment>
  );
}
