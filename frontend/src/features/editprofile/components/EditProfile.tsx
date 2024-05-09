import { useAppDispacth, useAppSelectore } from "@/redux/store";
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
  Image,
} from "@chakra-ui/react";
import { Fragment, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEditProfile } from "../hooks/useEditProfile";
import { getProfile } from "@/redux/user/profileSlice";
import { BsArrowLeft } from "react-icons/bs";

export default function EditProfile() {
  const profile = useAppSelectore((state) => state.profile);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispacth();
  const {
    form,
    avatar,
    handleChange,
    handleEditProfile,
    handleImageChange,
    isLoading,
    isError,
    error,
    isEditProfileSuccess,
  } = useEditProfile();

  useEffect(() => {
    if (isEditProfileSuccess) {
      dispatch(getProfile());
      navigate("/profile/" + profile.data?.id);
    }
  }, [isEditProfileSuccess]);

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Fragment>
      <Box flex={1} px={5} py={10} overflow={"auto"} className="hide-scroll">
        <Card
          bg={"#262626"}
          color={"white"}
          mb={"15px"}
          px={"25px"}
          py={"30px"}
        >
          <CardBody py={4} px={5}>
            <Flex gap={"3"} alignItems={"center"} mb={4}>
              <Link to={`/profile/${profile.data?.id}`}>
                <Text fontSize={"2xl"}>
                  <BsArrowLeft />
                </Text>
              </Link>
              <Text fontSize={"2xl"}>Edit Profile</Text>
            </Flex>
            {isError && (
              <Alert status="error" bg={"#FF6969"} mb={3} borderRadius={5}>
                <AlertIcon color={"white"} />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}{" "}
            <Box mb={"20px"} onClick={handleAvatarClick}>
              {avatar ? (
                <Image
                  src={avatar}
                  alt="avatar"
                  borderRadius="50%"
                  w={70}
                  h={70}
                  cursor={"pointer"}
                />
              ) : (
                <Image
                  src={profile.data?.profile_picture}
                  alt={profile.data?.username}
                  borderRadius="50%"
                  w={70}
                  h={70}
                  cursor={"pointer"}
                />
              )}
            </Box>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
              ref={fileInputRef}
            />
            <FormControl mb={"20px"}>
              <Input
                type="fullname"
                placeholder="Type Fullname"
                color={"white"}
                border={"none"}
                borderBottom={"2px solid white"}
                name="fullname"
                onChange={handleChange}
                value={form.fullname}
              />
            </FormControl>
            <FormControl mb={"20px"}>
              <Input
                type="password"
                placeholder="Type Password"
                color={"white"}
                border={"none"}
                borderBottom={"2px solid white"}
                name="password"
                onChange={handleChange}
                value={form.password}
              />
            </FormControl>
            <FormControl mb={"20px"}>
              <Input
                type="bio"
                placeholder="Type Bio"
                color={"white"}
                name="bio"
                border={"none"}
                borderBottom={"2px solid white"}
                onChange={handleChange}
                value={form.bio}
              />
            </FormControl>
            <Flex justifyContent={"end"}>
              {isLoading ? (
                <Button
                  isLoading
                  colorScheme="#04A51E"
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
                  onClick={() => {
                    handleEditProfile();
                  }}
                >
                  Save
                </Button>
              )}
            </Flex>
          </CardBody>
        </Card>
      </Box>
    </Fragment>
  );
}
