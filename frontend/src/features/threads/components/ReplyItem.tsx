import { Fragment } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import {
  Box,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  Text,
  useDisclosure,
} from "@chakra-ui/react";

interface ReplyItemInterface {
  reply: ThreadReplyType;
}

export default function ReplyItem({ reply }: ReplyItemInterface) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Fragment>
      <Flex gap={"15px"} border={"2px solid #3a3a3a"} p={"20px"} my={"15px"}>
        <Image
          borderRadius="full"
          boxSize="40px"
          objectFit="cover"
          src={`${reply?.user?.profile_picture}`}
          alt={`Profile Picture`}
        />
        <Box>
          <Flex mb={"5px"}>
            <Link to={`/profile/${reply?.user?.id}`}>
              <Text fontWeight={"bold"} me={"10px"}>
                {reply?.user?.fullname}
              </Text>
            </Link>
            <Box mt={"2px"} fontSize={"sm"} color={"gray.400"}>
              <Link to={`/profile/${reply?.user?.id}`}>
                @{reply?.user?.username}
              </Link>{" "}
              -{" "}
              <Text display={"inline-block"} title={reply?.created_at}>
                {moment(new Date(reply?.created_at)).calendar()}
              </Text>
            </Box>
          </Flex>
          <Text fontSize={"sm"} wordBreak={"break-word"}>
            {reply?.content}
          </Text>
          {reply?.image && (
            <Image
              onClick={() => {
                onOpen();
              }}
              mt={"10px"}
              borderRadius="5px"
              boxSize="350px"
              objectFit="cover"
              src={reply?.image}
              alt={`${reply?.image} Reply Image`}
              cursor={"pointer"}
            />
          )}
        </Box>
      </Flex>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        motionPreset="slideInBottom"
        size={"xl"}
      >
        <ModalContent borderRadius={0}>
          <ModalCloseButton />
          <ModalBody
            paddingTop={"50px"}
            paddingBottom={"10px"}
            paddingRight={"10px"}
            paddingLeft={"10px"}
            shadow={"dark-lg"}
          >
            <Image
              onClick={onOpen}
              width={"100%"}
              objectFit="cover"
              src={reply?.image}
              alt={`${reply?.image} Image Reply`}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Fragment>
  );
}
