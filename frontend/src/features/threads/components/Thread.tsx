import { Fragment, useRef, useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Flex,
  Spinner,
  Text,
  Image,
  Stack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
  Input,
  ModalFooter,
  Button,
  IconButton,
} from "@chakra-ui/react";
import moment from "moment";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { BiCommentDetail } from "react-icons/bi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import {
  useDeleteThread,
  useInfinityThreads,
  usePostLike,
  useUpdateThread,
} from "../hooks/useThreadsData";
import { useAppSelectore } from "@/redux/store";
import ThreadForm from "./ThreadForm";
import { MdOutlineSystemUpdateAlt } from "react-icons/md";
import { CloseIcon } from "@chakra-ui/icons";

interface CustomFile extends File {
  preview: string;
}

export default function Thread() {
  const {
    isLoading,
    data: threads,
    isError,
    error,
    // hasNextPage,
    // fetchNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfinityThreads();

  const { mutate } = usePostLike();
  const { mutate: mutateDelete } = useDeleteThread();
  const { data: profileData } = useAppSelectore((state) => state.profile);

  const imageContainerRef = useRef<HTMLDivElement>(null);

  // =================================  Edit Thread  =================================
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<{ file: File; preview: string }[]>([]);
  const [selectedThread, setSelectedThread] = useState<ThreadHomeType>({
    ID: "",
    content: "",
    image: [],
    isLiked: false,
    likes: [],
    replies: [],
    createdAt: "",
    updatedAt: "",
  });

  const { isOpen, onOpen, onClose } = useDisclosure();

  const initialRef = useRef(null);
  const finalRef = useRef(null);

  const { mutate: mutateUpdateThread, isPending } = useUpdateThread(() => {
    setImage([]); // reset the selected image after posting thread
    setSelectedThread({} as ThreadHomeType);
  });

  const updateThread = () => {
    // console.log(selectedThread);
    const threads: ThreadUpdateType = {
      content: selectedThread.content,
      image: image.map(({ file, preview }) => {
        const clonedFile: CustomFile = new File([file], file.name, {
          type: file.type,
          lastModified: file.lastModified,
        }) as CustomFile;
        clonedFile.preview = preview;
        return clonedFile;
      }),
      threadID: selectedThread.ID,
    };

    mutateUpdateThread(threads);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      Promise.all(
        filesArray.map((file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve({ file, preview: e.target?.result as string });
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
          });
        })
      ).then((images) => {
        setImage(
          (prevImages: { file: File; preview: string }[]) =>
            [...prevImages, ...images] as { file: File; preview: string }[]
        );
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImage((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleClick = () => {
    updateThread();
    onClose();
  };

  const handleOpenModalEdit = (thread: ThreadHomeType) => {
    setSelectedThread(thread);
    onOpen();
  };

  return (
    <Fragment>
      <Box flex={1} px={5} py={10} overflow={"auto"} className="hide-scroll">
        <Text fontSize={"2xl"} mb={"10px"} ml={"15px"}>
          Home
        </Text>
        <ThreadForm /> <br />
        {isLoading ? (
          <Box textAlign={"center"}>
            <Spinner size="xl" />
          </Box>
        ) : (
          <>
            {isError ? (
              <Alert status="error" bg={"#FF6969"} mb={3} borderRadius={5}>
                <AlertIcon color={"white"} />
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            ) : (
              <>
                {threads?.pages.map((group, i) => (
                  <Fragment key={i}>
                    {group.data.data.map((thread: ThreadHomeType) => (
                      <Fragment key={thread.ID}>
                        <Flex
                          gap={"15px"}
                          border={"2px solid #262626"}
                          p={"20px"}
                          mb={"10px"}
                        >
                          <Image
                            borderRadius="full"
                            boxSize="40px"
                            objectFit="cover"
                            src={thread.user?.profilePicture}
                            alt={`${thread.user?.fullname} Profile Picture`}
                          />
                          <Box>
                            <Box
                              display={{ base: "block", md: "flex" }}
                              mb={"5px"}
                            >
                              <Link to={`/profile/${thread.user?.ID}`}>
                                <Text fontWeight={"bold"} me={"10px"}>
                                  {thread.user?.fullname}
                                </Text>
                              </Link>
                              <Box
                                mt={"2px"}
                                fontSize={"sm"}
                                color={"gray.400"}
                              >
                                <Link to={`/profile/${thread.user?.ID}`}>
                                  @{thread.user?.username}
                                </Link>{" "}
                                -{" "}
                                <Text
                                  display={"inline-block"}
                                  title={thread.createdAt}
                                >
                                  {moment(
                                    new Date(thread.createdAt)
                                  ).calendar()}
                                </Text>
                              </Box>
                            </Box>
                            <Text fontSize={"sm"} wordBreak={"break-word"}>
                              {thread.content}
                            </Text>
                            {/* Image */}
                            <Box
                              overflowX="auto"
                              mb={"20px"}
                              borderRadius={"10px"}
                            >
                              <Stack
                                ref={imageContainerRef}
                                spacing={4}
                                mt={4}
                                direction="row"
                                overflowX="auto"
                              >
                                {thread.image.length !== 0 &&
                                  thread.image.map((images, index) => (
                                    <Box
                                      key={index}
                                      position="relative"
                                      flex="0 0 auto"
                                      minWidth="100px"
                                    >
                                      <Image
                                        boxSize={"300px"}
                                        width={"100%"}
                                        objectFit="cover"
                                        src={images}
                                        alt={`${images}@${index}`}
                                        borderRadius={"10px"}
                                      />
                                    </Box>
                                  ))}
                              </Stack>
                            </Box>

                            {/* Button like */}
                            <Flex gap={"15px"}>
                              <Flex alignItems={"center"}>
                                <Box
                                  onClick={() => mutate(thread.ID.toString())}
                                  cursor={"pointer"}
                                >
                                  {thread.isLiked ? (
                                    <AiFillHeart
                                      style={{
                                        fontSize: "20px",
                                        marginRight: "5px",
                                        marginTop: "1px",
                                      }}
                                    />
                                  ) : (
                                    <AiOutlineHeart
                                      style={{
                                        fontSize: "20px",
                                        marginRight: "5px",
                                        marginTop: "1px",
                                      }}
                                    />
                                  )}
                                </Box>
                                <Text
                                  cursor={"pointer"}
                                  fontSize={"sm"}
                                  color={"gray.400"}
                                >
                                  {thread.likes.length}
                                </Text>
                              </Flex>

                              {/* Button Reply */}
                              <Link to={`/reply/${thread.ID}`}>
                                <Flex alignItems={"center"}>
                                  <BiCommentDetail
                                    style={{
                                      fontSize: "20px",
                                      marginRight: "5px",
                                      marginTop: "1px",
                                    }}
                                  />
                                  <Text fontSize={"sm"} color={"gray.400"}>
                                    {thread.replies.length} Replies
                                  </Text>
                                </Flex>
                              </Link>

                              {/* Delete and Update Thread */}
                              {thread.user!.ID === profileData?.ID && (
                                <Flex alignItems={"center"}>
                                  <Box
                                    onClick={() => {
                                      Swal.fire({
                                        title: "Are you sure?",
                                        text: "This Thread Will Be Deleted Permanently!",
                                        icon: "warning",
                                        showCancelButton: true,
                                        confirmButtonColor: "#3085d6",
                                        cancelButtonColor: "#d33",
                                        confirmButtonText:
                                          "Yes, Delete This Thread!",
                                      }).then((result: any) => {
                                        if (result.isConfirmed) {
                                          mutateDelete(thread.ID);
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
                                  </Box>
                                  <Box
                                    fontSize={"3xl"}
                                    cursor={"pointer"}
                                    onClick={() => handleOpenModalEdit(thread)}
                                  >
                                    <MdOutlineSystemUpdateAlt
                                      style={{
                                        fontSize: "20px",
                                        marginLeft: "20px",
                                      }}
                                    />
                                  </Box>
                                </Flex>
                              )}
                            </Flex>
                          </Box>
                        </Flex>
                      </Fragment>
                    ))}
                  </Fragment>
                ))}
                <Flex justifyContent={"center"}>
                  {isFetching && isFetchingNextPage ? (
                    <Box textAlign={"center"}>
                      <p>No More Threads</p>
                    </Box>
                  ) : (
                    <>
                      {/* {hasNextPage && (
                        <Button
                          colorScheme="#04A51E"
                          size="md"
                          onClick={() => {
                            fetchNextPage();
                          }}
                        >
                          Load More
                        </Button>
                      )} */}
                    </>
                  )}
                </Flex>
              </>
            )}
          </>
        )}
      </Box>
      {/* Modal Edit Thread */}
      <Modal
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}
        isOpen={isOpen}
        onClose={onClose}
        isCentered
      >
        <ModalOverlay />

        <ModalContent>
          <ModalHeader>Edit Thread</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mt={4}>
              <FormLabel>Content</FormLabel>
              <Input
                type="text"
                placeholder="Content"
                value={selectedThread.content}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setSelectedThread({
                    ...selectedThread,
                    content: event.target.value,
                  })
                }
              />
            </FormControl>
            <FormLabel mt={4}>Image</FormLabel>
            <Input
              type="file"
              name="image"
              accept="image/*"
              multiple
              border={"none"}
              onChange={handleFileChange}
              ref={fileInputRef}
            />{" "}
            <Stack
              direction={["column", "row"]}
              spacing="24px"
              overflowX={"auto"}
            >
              {image.map((images, index) => (
                <Box key={index} position="relative">
                  <Image
                    src={images.preview}
                    alt={`${images.preview}@${index}`}
                    boxSize="150px"
                    objectFit="cover"
                    borderRadius={"lg"}
                  />
                  <IconButton
                    aria-label="Delete Image"
                    icon={<CloseIcon />}
                    onClick={() => handleRemoveImage(index)}
                    position="absolute"
                    top="1"
                    right="1"
                    zIndex="1"
                    size={"xs"}
                    borderRadius={"full"}
                    colorScheme="blackAlpha"
                  />
                </Box>
              ))}
            </Stack>
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
