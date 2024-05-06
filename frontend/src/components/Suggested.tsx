import { Fragment, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Text,
} from "@chakra-ui/react";
import { useAppDispacth, useAppSelectore } from "../redux/store";
import { getSuggested } from "../redux/user/suggestedSlice";

export default function Suggested() {
  const dispatch = useAppDispacth();
  const {
    data: suggestedData,
    isLoading,
    isError,
    error,
  } = useAppSelectore((state) => state.suggested);

  useEffect(() => {
    dispatch(getSuggested());
  }, []);

  return (
    <Fragment>
      <Card bg={"#3a3a3a"} color={"white"} mb={"15px"}>
        <CardBody py={4} px={5}>
          <Text fontSize={"xl"} mb={3}>
            Suggested For You
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
                  {!suggestedData.length ? (
                    <Text fontSize={"lmd"}>No Suggest Yet</Text>
                  ) : (
                    <>
                      {suggestedData.map((suggested, index) => (
                        <Flex
                          key={index}
                          justifyContent={"space-between"}
                          alignItems={"center"}
                          my={4}
                        >
                          <Flex gap={2} alignItems={"center"}>
                            <Text>
                              <Image
                                borderRadius="full"
                                boxSize="45px"
                                objectFit="cover"
                                src={suggested.profile_picture}
                                alt={suggested.fullname}
                              />
                            </Text>
                            <Box>
                              <Text fontSize={"sm"}>{suggested.fullname}</Text>
                              <Text fontSize={"sm"} color={"gray.400"}>
                                @{suggested.username}
                              </Text>
                            </Box>
                          </Flex>
                          <Text>
                            <Link to={`/profile/${suggested.id}`}>
                              <Button
                                color={"white"}
                                _hover={{
                                  bg: "#38a169",
                                  borderColor: "#38a169",
                                }}
                                size="sm"
                                borderRadius={"full"}
                                variant="outline"
                              >
                                Visit Profile
                              </Button>
                            </Link>
                          </Text>
                        </Flex>
                      ))}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </Fragment>
  );
}
