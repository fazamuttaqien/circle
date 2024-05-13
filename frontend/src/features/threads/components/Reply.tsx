import { Fragment, Key, useRef } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  // Button,
  Flex,
  Spinner,
  Text,
  Image,
  Stack,
} from "@chakra-ui/react";
import moment from "moment";
import { Link, useParams } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import { useDetailThread } from "../hooks/useThreadsData";
import ReplyForm from "./ReplyForm";
import ReplyItem from "./ReplyItem";

export default function Reply() {
  const params = useParams();

  const {
    isLoading,
    data: thread,
    isError,
    error,
  } = useDetailThread(params.threadID || "");

  const imageContainerRef = useRef<HTMLDivElement>(null);

  return (
    <Fragment>
      <Box flex={1} px={5} py={10} overflow={"auto"} className="hide-scroll">
        <Flex gap={"3"} alignItems={"center"} mb={4}>
          <Link to={"/"}>
            <Text fontSize={"2xl"}>
              <BsArrowLeft />
            </Text>
          </Link>
          <Text fontSize={"2xl"}>Detail Thread</Text>
        </Flex>

        <Flex gap={"15px"} border={"2px solid #262626"} p={"20px"} mb={"10px"}>
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
                  <Image
                    borderRadius="full"
                    boxSize="40px"
                    objectFit="cover"
                    src={`${thread?.data?.user?.profilePicture}`}
                    alt={`Profile Picture`}
                  />
                  <Box>
                    <Flex mb={"5px"}>
                      <Link to={`/profile/${thread?.data?.user?.id}`}>
                        <Text fontWeight={"bold"} me={"10px"}>
                          {thread?.data?.user?.fullname}
                        </Text>
                      </Link>
                      <Box mt={"2px"} fontSize={"sm"} color={"gray.400"}>
                        <Link to={`/profile/${thread?.data?.user?.id}`}>
                          @{thread?.data?.user?.username}
                        </Link>{" "}
                        -{" "}
                        <Text
                          display={"inline-block"}
                          title={thread?.data?.created_at}
                        >
                          {moment(
                            new Date(thread?.data?.created_at)
                          ).calendar()}
                        </Text>
                      </Box>
                    </Flex>
                    <Text fontSize={"sm"} mb={"10px"} wordBreak={"break-word"}>
                      {thread?.data?.content}
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
                        {thread?.data?.image.length !== 0 &&
                          thread?.data?.image.map(
                            (
                              images: string | undefined,
                              index: Key | null | undefined
                            ) => (
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
                            )
                          )}
                      </Stack>
                    </Box>
                  </Box>
                </>
              )}
            </>
          )}
        </Flex>

        <Box border={"2px solid #262626"} p={"20px"} mb={"10px"}>
          <ReplyForm threadID={params.threadID || ""} />
        </Box>

        {!isLoading && !isError ? (
          <>
            {thread.data.replies.map((reply: ThreadReplyType) => (
              <ReplyItem key={reply.ID} reply={reply} />
            ))}
          </>
        ) : null}
      </Box>
    </Fragment>
  );
}
