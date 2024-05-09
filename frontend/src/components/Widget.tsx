import { Box } from "@chakra-ui/react";
import { Fragment } from "react";
import Suggested from "./Suggested";
import Watermark from "./Watermark";
import Profile from "./Profile";

export default function Widget() {
  return (
    <Fragment>
      <Box
        w={{ base: "37%", "2xl": "30%" }}
        px={10}
        py={10}
        style={{ borderLeft: "3px solid #262626" }}
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
