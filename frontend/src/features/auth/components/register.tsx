import { Fragment, useEffect, useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "../hooks/useRegister";

export default function Register() {
  const [show, setShow] = useState<boolean>(false);
  const navigate = useNavigate();
  const {
    form,
    handleChange,
    handleRegister,
    isLoading,
    isError,
    error,
    isRegisterSuccess,
  } = useRegister();

  useEffect(() => {
    if (isRegisterSuccess) {
      navigate("/login");
    }
  }, [isRegisterSuccess]);

  return (
    <Fragment>
      <Flex justifyContent={"center"} alignItems={"center"} height={"100vh"}>
        <Box width={"100%"} maxWidth={"450px"} p={4} color={"white"}>
          <Heading as="h2" size="3xl" noOfLines={1} color={"green.400"} mb={3}>
            circle
          </Heading>
          <Text fontSize={"xl"} mb={3}>
            Create account Circle
          </Text>
          {isError && (
            <Alert status="error" bg={"#FF6969"} mb={3} borderRadius={5}>
              <AlertIcon color={"white"} />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <FormControl mb={4}>
            <Input
              type="text"
              placeholder="Fullname *"
              name="fullname"
              value={form.fullname}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl mb={4}>
            <Input
              type="email"
              placeholder="Email *"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl mb={4}>
            <InputGroup size="md">
              <Input
                placeholder="Password *"
                name="password"
                value={form.password}
                type={show ? "text" : "password"}
                onChange={handleChange}
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={() => setShow(!show)}>
                  {show ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>
          {isLoading ? (
            <Button
              isLoading
              colorScheme="green"
              variant="solid"
              borderRadius={"full"}
              width={"100%"}
              mb={3}
            >
              Loading
            </Button>
          ) : (
            <Button
              type="submit"
              borderRadius={"full"}
              colorScheme="green"
              width={"100%"}
              mb={3}
              onClick={handleRegister}
            >
              Register
            </Button>
          )}
          <Text>
            Already have an account?{" "}
            <Link style={{ color: "#48bb78" }} to={"/login"}>
              Login
            </Link>
          </Text>
        </Box>
      </Flex>
    </Fragment>
  );
}
