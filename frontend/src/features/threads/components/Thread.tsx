import { Fragment, useRef } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Flex,
  Spinner,
  Text,
  Image,
  Stack,
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
} from "../hooks/useThreadsData";
import { useAppSelectore } from "@/redux/store";
import ThreadForm from "./ThreadForm";

export default function Thread() {
  const {
    isLoading,
    data: threads,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfinityThreads();

  const { mutate } = usePostLike();
  const { mutate: mutateDelete } = useDeleteThread();
  const { data: profileData } = useAppSelectore((state) => state.profile);

  const imageContainerRef = useRef<HTMLDivElement>(null);

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
                      <Fragment key={thread.id}>
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
                            src={thread.user.profile_picture}
                            alt={`${thread.user.fullname} Profile Picture`}
                          />
                          <Box>
                            <Box
                              display={{ base: "block", md: "flex" }}
                              mb={"5px"}
                            >
                              <Link to={`/profile/${thread.user.id}`}>
                                <Text fontWeight={"bold"} me={"10px"}>
                                  {thread.user.fullname}
                                </Text>
                              </Link>
                              <Box
                                mt={"2px"}
                                fontSize={"sm"}
                                color={"gray.400"}
                              >
                                <Link to={`/profile/${thread.user.id}`}>
                                  @{thread.user.username}
                                </Link>{" "}
                                -{" "}
                                <Text
                                  display={"inline-block"}
                                  title={thread.created_at}
                                >
                                  {moment(
                                    new Date(thread.created_at)
                                  ).calendar()}
                                </Text>
                              </Box>
                            </Box>
                            <Text
                              fontSize={"sm"}
                              wordBreak={"break-word"}
                            >
                              {thread.content}
                            </Text>
                            {/* Image */}
                            <Box overflowX="auto" mb={"20px"} borderRadius={"10px"}>
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
                                  onClick={() => mutate(thread.id.toString())}
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
                              <Link to={`/reply/${thread.id}`}>
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

                              {/* Delet Thread */}
                              {thread.user.id === profileData?.id && (
                                <Flex
                                  alignItems={"center"}
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
                                        mutateDelete(thread.id);
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
      {/* <Flex alignItems={"center"} onClick={() => {
        Swal.
      }} cursor={"pointer"}>
        <RiDeleteBin5Line
          style={{
            fontSize: "20px",
            marginRight: "5px",
            marginTop: "1px",
          }}
        />
      </Flex> */}
    </Fragment>
  );
}
