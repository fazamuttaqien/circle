import {
  Button,
  ButtonSpinner,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Box,
  useDisclosure,
  Flex,
} from "@chakra-ui/react";
import { Fragment, useState } from "react";
import { RiImageAddFill } from "react-icons/ri";
import { usePostReply } from "../hooks/useThreadsData";

export default function ReplyForm({ threadId }: { threadId: string }) {
  // const { data: profileData } = useAppSelector((state) => state.profile);

  const [content, setContent] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const { mutate, isPending } = usePostReply(() => {
    setContent("");
    setImage(null); // reset the selected image after posting thread
  });

  const postReply = () => {
    const reply: ReplyPostType = {
      content,
      threadId,
    };
    if (image) {
      reply.image = image;
    }

    mutate(reply);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setImage(files[0]);
    }
  };

  return (
    <Fragment>
      <Flex alignItems={"center"} gap={"10px"}>
        <Input
          type="text"
          placeholder="Let's post new reply!"
          value={content}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setContent(event.target.value)
          }
        />
        <Box
          fontSize={"3xl"}
          color={"#38a169"}
          cursor={"pointer"}
          onClick={onOpen}
        >
          <RiImageAddFill />
        </Box>
        {isPending ? (
          <Button px={"70px"} colorScheme="green" borderRadius={"full"}>
            <ButtonSpinner />
          </Button>
        ) : (
          <Button
            px={"70px"}
            colorScheme="green"
            borderRadius={"full"}
            onClick={postReply}
          >
            Reply
          </Button>
        )}
      </Flex>

      <Modal
        isCentered
        onClose={onClose}
        isOpen={isOpen}
        motionPreset="slideInBottom"
        size={"xl"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Image</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input type="file" name="image" onChange={handleFileChange} />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Fragment>
  );
}
