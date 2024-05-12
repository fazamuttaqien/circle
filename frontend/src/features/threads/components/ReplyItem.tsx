import { Fragment, useRef, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import {
  Box,
  Button,
  ButtonSpinner,
  Flex,
  FormControl,
  FormLabel,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import Swal from "sweetalert2";
import { RiDeleteBin5Line } from "react-icons/ri";
import { MdOutlineSystemUpdateAlt } from "react-icons/md";
import { useAppSelectore } from "@/redux/store";
import { useDeleteReply, useUpdateReply } from "../hooks/useThreadsData";

interface ReplyItemInterface {
  reply: ThreadReplyType;
}

export default function ReplyItem({ reply }: ReplyItemInterface) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data: profileData } = useAppSelectore((state) => state.profile);
  const { mutate: mutateDelete } = useDeleteReply();

  const initialRef = useRef(null);
  const finalRef = useRef(null);

  // =================================  Edit Reply  =================================
  const [content, setContent] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);

  const { mutate, isPending } = useUpdateReply(() => {
    setContent("");
    setImage(null); // reset the selected image after posting thread
  });

  const updateReply = () => {
    const replies: ReplyUpdateType = {
      content,
      thread_id: reply.thread_id,
      replyId: reply.id,
    };
    if (image) {
      replies.image = image;
    }
    mutate(replies);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setImage(files[0]);
    }
  };

  const handleClick = () => {
    updateReply();
    onClose();
  };

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
          {isPending ? (
            <Button colorScheme="#04A51E" borderRadius={"full"}>
              <ButtonSpinner />
            </Button>
          ) : (
            <Box mb={"10px"}>
              <Text fontSize={"sm"} wordBreak={"break-word"}>
                {reply?.content}
              </Text>
              {reply?.image !== "" && (
                <Image
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
          )}

          {/* Delete adn Update Reply */}
          {reply?.user?.id === profileData?.id && (
            <Flex alignItems={"center"}>
              <Box
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
                  }}
                />
              </Box>
              <Box fontSize={"3xl"} cursor={"pointer"} onClick={onOpen}>
                <MdOutlineSystemUpdateAlt
                  style={{ fontSize: "20px", marginLeft: "20px" }}
                />
              </Box>
            </Flex>
          )}
        </Box>
      </Flex>

      {/* Modal Upload Image */}
      {/* <Modal
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
      </Modal> */}

      {/* Modal Edit Reply */}
      <Modal
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}
        isOpen={isOpen}
        onClose={onClose}
        isCentered
      >
        <ModalOverlay />

        <ModalContent>
          <ModalHeader>Edit Reply</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mt={4}>
              <FormLabel>Content</FormLabel>
              <Input
                type="text"
                placeholder="Content"
                value={content}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setContent(event.target.value)
                }
              />
            </FormControl>
            <FormLabel mt={4}>Image</FormLabel>
            <Input
              type="file"
              name="image"
              border={"none"}
              onChange={handleFileChange}
            />{" "}
          </ModalBody>

          <ModalFooter>
            <Box>
              <Button colorScheme="blue" mr={3} onClick={handleClick}>
                Save
              </Button>
            </Box>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Fragment>
  );
}
