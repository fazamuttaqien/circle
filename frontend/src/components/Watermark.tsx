import { Box, Card, CardBody, Image, Text } from "@chakra-ui/react";
import { Fragment } from "react";
import {
  FaGithub,
  FaLinkedin,
  FaSquareFacebook,
  FaSquareInstagram,
} from "react-icons/fa6";

export default function Watermark() {
  return (
    <Fragment>
      <Card bg={"#3a3a3a"} color={"white"}>
        <CardBody py={4} px={5}>
          <Box fontSize={"md"}>
            Developed by Cheattos - {""}
            <FaGithub style={{ display: "inline", marginRight: "5px" }} />
            <FaLinkedin style={{ display: "inline", marginRight: "5px" }} />
            <FaSquareFacebook
              style={{ display: "inline", marginRight: "5px" }}
            />
            <FaSquareInstagram
              style={{ display: "inline", marginRight: "5px" }}
            />
          </Box>
          <Text fontSize={"xs"} color={"gray.400"}>
            Powered by{" "}
            <Image
              src="/circle.png"
              alt="Dumbways Logo"
              width={"20px"}
              display={"inline"}
              position={"relative"}
              bottom={"-3px"}
            />{" "}
            With Arre Pangestu as a Mentor
          </Text>
        </CardBody>
      </Card>
    </Fragment>
  );
}
