import { Fragment } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { BiLogOut } from "react-icons/bi";
import { BsHouse, BsHouseFill } from "react-icons/bs";
import { FaCircleUser, FaRegCircleUser } from "react-icons/fa6";
import {
  RiDeleteBin5Fill,
  RiUserSearchFill,
  RiUserSearchLine,
} from "react-icons/ri";
import { jwtDecode } from "jwt-decode";
import { API } from "@/utils/api";
import getError from "@/utils/getError";
import { toastError } from "@/utils/toast";
import { useAppDispacth } from "@/redux/store";
import { LOGOUT } from "@/redux/slice/auth";

interface SidebarDrawerInterface {
  closeDrawer: () => void;
}

interface User {
  id: string;
}

interface JwtPayload {
  User: User;
}

export default function Sidebar(props: SidebarDrawerInterface) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispacth();

  const token = localStorage.getItem("token");
  let idToken: string = "";

  if (token) {
    try {
      const decodedToken: JwtPayload = jwtDecode(token);
      idToken = decodedToken.User.id;
    } catch (error) {
      console.error("Error decoding JWT:", error);
    }
  }

  const deleteAccount = async () => {
    try {
      await API.delete(`users/${idToken}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      toastError(getError(error));
    }
  };

  return (
    <Fragment>
      <Box
        px={50}
        py={10}
        borderRight={"3px solid #262626"}
        overflow={"auto"}
        className="hide-scroll"
        color={"white"}
        h={"100%"}
      >
        <Flex flexDir={"column"} justifyContent={"space-between"} h={"100%"}>
          <Box>
            <Link to={"/"}>
              <Box display={"flex"} alignItems={"center"} gap={3} mb={6}>
                <Text fontSize={"2xl"}>
                  {location.pathname === "/" ? <BsHouseFill /> : <BsHouse />}
                  {/* Kalo kita ke halaman tersebut maka akan diubah menjadi homefill */}
                </Text>
                <Text fontSize={"md"} mt={1}>
                  Home
                </Text>
              </Box>
            </Link>
            <Link to={"/search"}>
              <Box display={"flex"} alignItems={"center"} gap={3} mb={6}>
                <Text fontSize={"2xl"}>
                  {location.pathname === "/search" ? (
                    <RiUserSearchFill />
                  ) : (
                    <RiUserSearchLine />
                  )}
                </Text>
                <Text fontSize={"md"} mt={1}>
                  Search
                </Text>
              </Box>
            </Link>
            <Link to={`/profile/${idToken}`}>
              <Box display={"flex"} alignItems={"center"} gap={3} mb={6}>
                <Text fontSize={"2xl"}>
                  {location.pathname.includes("/profile") ? (
                    <FaCircleUser />
                  ) : (
                    <FaRegCircleUser />
                  )}
                </Text>
                <Text fontSize={"md"} mt={1}>
                  Profile
                </Text>
              </Box>
            </Link>
            <Button
              onClick={() => {
                props.closeDrawer();
                Swal.fire({
                  title: "Are you sure?",
                  text: "Your Account Will Be Removed Permanently!",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Yes, Remove My Account!",
                }).then((result) => {
                  if (result.isConfirmed) {
                    deleteAccount();
                  }
                });
              }}
              display={"flex"}
              gap={3}
              colorScheme="red"
              size={"md"}
              width={"220px"}
              alignItems={"center"}
              justifyContent={"left"}
              borderRadius={"full"}
            >
              <Text fontSize={"2xl"}>
                <RiDeleteBin5Fill />
              </Text>
              <Text fontSize={"md"}>Remove Account</Text>
            </Button>
          </Box>

          <Flex alignItems={"center"} gap={3} mb={6}>
            <Text fontSize={"2xl"}>
              <BiLogOut />
            </Text>
            <Text
              fontSize={"md"}
              mt={1}
              cursor={"pointer"}
              onClick={() => {
                // props.closeDrawer();
                Swal.fire({
                  title: "Are you sure?",
                  text: "You Will Be Logged Out!",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Yes, Logout!",
                }).then((result) => {
                  if (result.isConfirmed) {
                    dispatch(LOGOUT());
                    localStorage.removeItem("token");
                    navigate("/login");
                  }
                });
              }}
            >
              Logout
            </Text>
          </Flex>
        </Flex>
      </Box>
    </Fragment>
  );
}
