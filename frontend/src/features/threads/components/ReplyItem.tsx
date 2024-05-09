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
import Swal from "sweetalert2";
import { RiDeleteBin5Line } from "react-icons/ri";
import { useAppSelectore } from "@/redux/store";
import { useDeleteReply } from "../hooks/useThreadsData";

interface ReplyItemInterface {
  reply: ThreadReplyType;
}

export default function ReplyItem({ reply }: ReplyItemInterface) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: profileData } = useAppSelectore((state) => state.profile);
  const { mutate: mutateDelete } = useDeleteReply();

  return (
    <Fragment>
      <Flex gap={"15px"} border={"2px solid #262626"} p={"20px"} my={"15px"}>
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
          {reply?.image !== "" && (
            <Image
              onClick={() => {
                onOpen();
              }}
              mt={"10px"}
              mb={"10px"}
              borderRadius="5px"
              boxSize="350px"
              objectFit="cover"
              src={reply?.image}
              alt={`${reply?.image} Reply Image`}
              cursor={"pointer"}
            />
          )}
          {/* Delete Reply */}
          {reply?.user?.id === profileData?.id && (
            <Flex
              alignItems={"center"}
              onClick={() => {
                Swal.fire({
                  title: "Are you sure?",
                  text: "This Reply Will Be Deleted Permanently!",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Yes, Delete This Reply!",
                }).then((result: any) => {
                  if (result.isConfirmed) {
                    mutateDelete(reply.id);
                  }
                });
              }}
              cursor={"pointer"}
            >
              <RiDeleteBin5Line
                style={{
                  fontSize: "20px",
                  marginRight: "5px",
                  marginTop: "1px",
                }}
              />
            </Flex>
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
