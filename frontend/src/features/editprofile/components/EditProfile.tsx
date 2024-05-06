import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  FormControl,
  Input,
  Text,
} from "@chakra-ui/react";
import { Fragment, useEffect } from "react";
import { useEditProfile } from "../hooks/useEditProfile";
import { useNavigate } from "react-router-dom";
import { useAppDispacth, useAppSelectore } from "../../../redux/store";
import { getProfile } from "../../../redux/user/profileSlice";

export default function EditProfile() {
  const profile = useAppSelectore((state) => state.profile);
  const navigate = useNavigate();
  const dispatch = useAppDispacth();
  const {
    form,
    handleChange,
    handleEditProfile,
    isLoading,
    isError,
    error,
    isEditProfileSuccess,
  } = useEditProfile();

  useEffect(() => {
    if (isEditProfileSuccess) {
      dispatch(getProfile());
      navigate("/my-profile/" + profile.data?.id);
    }
  }, [isEditProfileSuccess]);

  return (
    <Fragment>
      <Box flex={1} px={5} py={10} overflow={"auto"} className="hide-scroll">
        <Card
          bg={"#3a3a3a"}
          color={"white"}
          mb={"15px"}
          px={"25px"}
          py={"30px"}
        >
          <CardBody py={4} px={5}>
            <Text fontSize={"2xl"} mb={"18px"}>
              Edit Profile Data
            </Text>
            {isError && (
              <Alert status="error" bg={"#FF6969"} mb={3} borderRadius={5}>
                <AlertIcon color={"white"} />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <FormControl mb={"20px"}>
              <Input
                type="fullname"
                placeholder="Type Fullname"
                bg={"#f8f9fb"}
                color={"black"}
                border={"none"}
                name="fullname"
                onChange={handleChange}
                value={form.fullname}
              />
            </FormControl>
            <FormControl mb={"20px"}>
              <Input
                type="password"
                placeholder="Type Password"
                bg={"#f8f9fb"}
                color={"black"}
                border={"none"}
                name="password"
                onChange={handleChange}
                value={form.password}
              />
            </FormControl>
            <FormControl mb={"20px"}>
              <Input
                type="bio"
                placeholder="Type Bio"
                bg={"#f8f9fb"}
                color={"black"}
                border={"none"}
                name="bio"
                onChange={handleChange}
                value={form.bio}
              />
            </FormControl>

            <Flex justifyContent={"end"}>
              {isLoading ? (
                <Button
                  isLoading
                  colorScheme="green"
                  variant="solid"
                  borderRadius={"full"}
                  mb={3}
                >
                  Loading
                </Button>
              ) : (
                <Button
                  type="submit"
                  borderRadius={"full"}
                  colorScheme="green"
                  mb={3}
                  onClick={() => handleEditProfile()}
                >
                  Edit Profile
                </Button>
              )}
            </Flex>
          </CardBody>
        </Card>
      </Box>
    </Fragment>
  );
}
