import { Fragment, useEffect, useState } from "react";
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
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { RiUserSearchLine } from "react-icons/ri";
import { ImSearch } from "react-icons/im";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useSearch } from "../hooks/useSearch";

export default function Search() {
  const [queryParams] = useSearchParams();
  const navigate = useNavigate();
  const [nameQuery, setNameQuery] = useState<string>(
    queryParams.get("search") || ""
  );

  const {
    isLoading,
    isError,
    error,
    data: users,
    refetch,
  } = useSearch(nameQuery);

  useEffect(() => {
    setNameQuery(queryParams.get("search") || "");
    refetch();
  }, [queryParams]);

  const applyFilter = () => {
    let url = "/search?";
    if (nameQuery) {
      url += `search=${nameQuery}`;
    }
    navigate(url);
    refetch();
  };

  return (
    <Fragment>
      <Box flex={1} px={5} py={10} overflow={"auto"} className="hide-scroll">
        <Text fontSize={"2xl"} mb={"10px"} ml={"15px"}>
          Search User
        </Text>

        <Flex gap={2} mb={"20px"}>
          <InputGroup>
            <InputLeftElement pointerEvents="none" fontSize={"20px"}>
              <RiUserSearchLine />
            </InputLeftElement>
            <Input
              type="text"
              placeholder="Fullname"
              borderRadius={"full"}
              border={"none"}
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
            />
          </InputGroup>
          <Button
            backgroundColor={"#04A51E"}
            color={"white"}
            borderRadius={"full"}
            onClick={() => applyFilter()}
          >
            <ImSearch />
          </Button>
        </Flex>

        <Card bg={"#262626"} color={"white"} mb={"15px"}>
          <CardBody py={2} px={5}>
            {isLoading ? (
              <Spinner />
            ) : (
              <>
                {isError ? (
                  <Alert status="error" bg={"#FF6969"} borderRadius={5}>
                    <AlertIcon color={"white"} />
                    <AlertDescription>{error.message}</AlertDescription>
                  </Alert>
                ) : (
                  <>
                    {users.data.length === 0 ? (
                      <Text fontSize={"lmd"} borderRadius={"10px"}>
                        No User Found
                      </Text>
                    ) : (
                      <>
                        {users.data.map(
                          (user: SearchUserType, index: number) => (
                            <Flex
                              display={{ base: "block", sm: "flex" }}
                              key={index}
                              justifyContent={"space-between"}
                              alignItems={"center"}
                              my={5}
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
                                    src={user.profilePicture}
                                    alt={user.fullname}
                                  />
                                </Text>
                                <Box>
                                  <Text fontSize={"sm"}>{user.fullname}</Text>
                                  <Text fontSize={"sm"} color={"gray.400"}>
                                    @{user.username}
                                  </Text>
                                </Box>
                              </Flex>
                              <Text>
                                <Link to={`/profile/${user.ID}`}>
                                  <Button
                                    color={"white"}
                                    _hover={{
                                      bg: "#04A51E",
                                      borderColor: "#04A51E",
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
