import { useAppDispacth, useAppSelectore } from "@/redux/store";
import { getDetailUser } from "@/redux/slice/detailuser";
import { getProfile } from "@/redux/slice/profile";
import { API } from "@/utils/api";
import getError from "@/utils/getError";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Image,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { Fragment, useEffect } from "react";
import { FiEdit3 } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import { toastError } from "@/utils/toast";

export default function Profile() {
  const params = useParams();
  const dispatch = useAppDispacth();

  // taken from redux
  const {
    data: detailUser,
    isLoading,
    isError,
    error,
  } = useAppSelectore((state) => state.detailUser);
  const { data: profile } = useAppSelectore((state) => state.profile);

  useEffect(() => {
    dispatch(getDetailUser(params.userID || ""));
  }, [params]);

  const followAndUnfollow = async () => {
    try {
      await API.post("follows/" + params.userID, "", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      dispatch(getDetailUser(params.userID || ""));
      dispatch(getProfile());
    } catch (error) {
      toastError(getError(error));
    }
  };

  return (
    <Fragment>
      <Box flex={1} px={5} py={10} overflow={"auto"} className="hide-scroll">
        <Card bg={"#262626"} color={"white"} mb={"15px"}>
          <CardBody py={4} px={5}>
            <Text fontSize={"2xl"} mb={"10px"}>
              Profile
            </Text>
            {isLoading ? (
              <Spinner />
            ) : (
              <>
                {isError ? (
                  <Alert status="error" bg={"#FF6969"} mb={3} borderRadius={5}>
                    <AlertIcon color={"white"} />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <Box position={"relative"}>
                      <Image
                        src="https://assets-global.website-files.com/5a9ee6416e90d20001b20038/635ab99b5920d1d2c6e04397_horizontal%20(66).svg"
                        alt="Green Gradient"
                        borderRadius={"10px"}
                        width={"100%"}
                        height={"200px"}
                        objectFit={"cover"}
                      />
                      <Image
                        borderRadius="full"
                        bgColor={"#262626"}
                        border={"5px solid #262626"}
                        boxSize="75px"
                        objectFit="cover"
                        position={"absolute"}
                        top={"160px"}
                        left={"20px"}
                        src={detailUser?.avatar}
                        alt={detailUser?.fullname}
                      />
                      {profile?.ID === detailUser?.ID && (
                        <Link to={`/edit-profile`}>
                          <Button
                            color={"white"}
                            _hover={{ bg: "", borderColor: "" }}
                            size="sm"
                            borderRadius={"full"}
                            variant="outline"
                            position={"absolute"}
                            bottom={"-50px"}
                            right={"0px"}
                          >
                            <Text fontSize={"lg"}>
                              <FiEdit3 />
                            </Text>
                          </Button>
                        </Link>
                      )}

                      {profile?.ID !== detailUser?.ID && (
                        <>
                          <Button
                            color={"white"}
                            _hover={{ bg: "#04A51E", borderColor: "#04A51E" }}
                            size="sm"
                            borderRadius={"full"}
                            variant="outline"
                            position={"absolute"}
                            bottom={"-50px"}
                            right={"0px"}
                            onClick={followAndUnfollow}
                          >
                            {detailUser?.follower?.length ?? 0 > 0
                              ? "Unfollow"
                              : "Follow"}
                          </Button>
                        </>
                      )}
                    </Box>
                    <Text fontSize={"2xl"} mt={"40px"} fontWeight={"bold"}>
                      {detailUser?.fullname}
                    </Text>
                    <Text fontSize={"sm"} color={"gray.400"}>
                      @{detailUser?.username}
                    </Text>
                    <Text fontSize={"md"} mt={1}>
                      {detailUser?.bio}
                    </Text>
                    <Flex mt={"10px"} gap={3} mb={5}>
                      <Box fontSize={"md"}>
                        {detailUser?.follower.length}{" "}
                        <Text display={"inline"} color={"gray.400"}>
                          Followers
                        </Text>
                      </Box>
                      <Box fontSize={"md"}>
                        {detailUser?.following.length}{" "}
                        <Text display={"inline"} color={"gray.400"}>
                          Following
                        </Text>
                      </Box>
                    </Flex>

                    <Tabs variant="solid-rounded" colorScheme="green">
                      <TabList>
                        <Tab color={"white"}>Follower</Tab>
                        <Tab color={"white"}>Following</Tab>
                      </TabList>
                      <TabPanels>
                        <TabPanel>
                          <Box
                            bg={"#2b2b2b"}
                            px={5}
                            py={3}
                            borderRadius={"10px"}
                          >
                            {!detailUser?.follower.length ? (
                              <Text fontSize={"md"}>No Follower Found</Text>
                            ) : (
                              <>
                                {detailUser?.follower.map((follower, index) => (
                                  <Flex
                                    key={index}
                                    justifyContent={"space-between"}
                                    alignItems={"center"}
                                    my={4}
                                    display={{ base: "block", sm: "flex" }}
                                  >
                                    <Flex
                                      gap={2}
                                      alignItems={"center"}
                                      mb={{ base: 3, sm: 0 }}
                                    >
                                      <Text>
                                        <Image
                                          borderRadius="full"
                                          boxSize="45px"
                                          objectFit="cover"
                                          src={follower.follower.avatar}
                                          alt={follower.follower.fullname}
                                        />
                                      </Text>
                                      <Box>
                                        <Text fontSize={"sm"}>
                                          {follower.follower.fullname}
                                        </Text>
                                        <Text
                                          fontSize={"sm"}
                                          color={"gray.400"}
                                        >
                                          @{follower.follower.username}
                                        </Text>
                                      </Box>
                                    </Flex>
                                    <Text>
                                      <Link
                                        to={`/profile/${follower.follower.ID}`}
                                      >
                                        <Button
                                          color={"white"}
                                          _hover={{
                                            bg: "",
                                            borderColor: "",
                                          }}
                                          size="sm"
                                          borderRadius={"full"}
                                          variant="outline"
                                        >
                                          Profile
                                        </Button>
                                      </Link>
                                    </Text>
                                  </Flex>
                                ))}
                              </>
                            )}
                          </Box>
                        </TabPanel>
                        <TabPanel>
                          <Box
                            bg={"#2b2b2b"}
                            px={5}
                            py={3}
                            borderRadius={"10px"}
                          >
                            {!detailUser?.following.length ? (
                              <Text fontSize={"md"}>No Following Found</Text>
                            ) : (
                              <>
                                {detailUser?.following.map(
                                  (following, index) => (
                                    <Flex
                                      key={index}
                                      justifyContent={"space-between"}
                                      alignItems={"center"}
                                      my={4}
                                      display={{ base: "block", sm: "flex" }}
                                    >
                                      <Flex
                                        gap={2}
                                        alignItems={"center"}
                                        mb={{ base: 3, sm: 0 }}
                                      >
                                        <Text>
                                          <Image
                                            borderRadius="full"
                                            boxSize="45px"
                                            objectFit="cover"
                                            src={following.following.avatar}
                                            alt={following.following.fullname}
                                          />
                                        </Text>
                                        <Box>
                                          <Text fontSize={"sm"}>
                                            {following.following.fullname}
                                          </Text>
                                          <Text
                                            fontSize={"sm"}
                                            color={"gray.400"}
                                          >
                                            @{following.following.username}
                                          </Text>
                                        </Box>
                                      </Flex>
                                      <Text>
                                        <Link
                                          to={`/profile/${following.following.ID}`}
                                        >
                                          <Button
                                            color={"white"}
                                            _hover={{
                                              bg: "",
                                              borderColor: "",
                                            }}
                                            size="sm"
                                            borderRadius={"full"}
                                            variant="outline"
                                          >
                                            Profile
                                          </Button>
                                        </Link>
                                      </Text>
                                    </Flex>
                                  )
                                )}
                              </>
                            )}
                          </Box>
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
                  </>
                )}
              </>
            )}
          </CardBody>
        </Card>
      </Box>
    </Fragment>
  );
}
