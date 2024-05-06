import {
  Button,
  ButtonSpinner,
  FormControl,
  Grid,
  GridItem,
  Input,
  Textarea,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Box,
  useDisclosure,
} from "@chakra-ui/react";
import { Fragment, useState } from "react";
import { RiImageAddFill } from "react-icons/ri";
import { usePostThread } from "../hooks/useThreadsData";

export default function ThreadForm() {
  // const { data: profileData } = useAppSelector((state) => state.profile);

  const [content, setContent] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const { mutate, isPending } = usePostThread(() => {
    setContent("");
    setImage(null); // reset the selected image after posting thread
  });

  const postThread = () => {
    const thread: ThreadPostType = {
      content,
    };
    if (image) {
      thread.image = image;
    }

    mutate(thread);
  };

  const textareaStyle = {
    backgroundImage:
      'url("https://media.istockphoto.com/id/1148387720/photo/background-from-white-paper-texture-bright-exclusive-background-pattern-close-up.webp?b=1&s=170667a&w=0&k=20&c=0N98FwrU05qkxSBOGHvWpl1DKeMEGHnAwUgy9Vqx8zM=")',
    backgroundSize: "cover", // or other properties to customize the appearance of the image
    /* additional styling properties */
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setImage(files[0]);
    }
  };

  return (
    <Fragment>
      <Grid>
        {/* berarti ada 5 kolom dengan lebar yang sama, atau 1fr, yang berarti fraksi
                dari sisa ruang yang tersedia. Jadi, grid akan dibagi menjadi lima kolom yang sama lebarnya. */}

        {/* gap={6}: Properti ini menentukan jarak antara baris dan kolom dalam grid, dalam satuan piksel.
                 Di sini, gap={6} berarti ada jarak 6 piksel antara setiap baris dan kolom dalam grid. */}
        {/* <GridItem>
                    <Avatar
                        borderRadius="full"
                        boxSize="40px"
                        objectFit="cover"
                        src={profileData?.profile_picture || "none"}
                    />
                </GridItem> */}
        <GridItem>
          <FormControl>
            <Textarea
              style={textareaStyle}
              resize={"none"}
              w="100%"
              placeholder="Let's post new thread!"
              value={content}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                setContent(event.target.value)
              }
              id="insertThread"
              borderRadius={"15"}
              color={"black"}
            />
          </FormControl>
          <Grid templateColumns="repeat(5, 1fr)" gap={4} mt={4}>
            <GridItem colSpan={2} h="10">
              <Box
                fontSize={"3xl"}
                color={"#38a169"}
                cursor={"pointer"}
                onClick={onOpen}
              >
                <RiImageAddFill />
              </Box>
            </GridItem>
            <GridItem colStart={6} colEnd={6} h="10">
              {isPending ? (
                <Button px={"70px"} colorScheme="green" borderRadius={"full"}>
                  <ButtonSpinner />
                </Button>
              ) : (
                <Button
                  px={"70px"}
                  colorScheme="green"
                  borderRadius={"full"}
                  onClick={postThread}
                >
                  Post
                </Button>
              )}
            </GridItem>
          </Grid>
        </GridItem>
      </Grid>

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
