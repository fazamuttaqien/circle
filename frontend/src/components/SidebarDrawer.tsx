import { Fragment } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

import { ImSearch } from "react-icons/im";
import { RiSearchFill } from "react-icons/ri";

import { IoHomeOutline, IoHome } from "react-icons/io5";
import { CiLogout } from "react-icons/ci";

import { FaUserAlt } from "react-icons/fa";
import { FaRegUser } from "react-icons/fa";

import { RiDeleteBin5Fill } from "react-icons/ri";
import { useAppSelectore } from "@/redux/store";
import getError from "@/utils/getError";
import { API } from "@/utils/api";

interface SidebarDrawerInterface {
  closeDrawer: () => void;
}

interface User {
  id: string;
}

interface JwtPayload {
  User: User;
}

export default function SidebarDrawer(props: SidebarDrawerInterface) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: profile } = useAppSelectore((state) => state.profile);

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

      localStorage.clear();
      navigate("/login");
    } catch (error) {
      toast.error(getError(error), {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

  return (
    <Fragment>
      <Box
        py={10}
        px={50}
        borderRight={"3px solid #fffff"}
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
                  {location.pathname === "/" ? <IoHome /> : <IoHomeOutline />}
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
                    <RiSearchFill />
                  ) : (
                    <ImSearch />
                  )}
                </Text>
                <Text fontSize={"md"} mt={1}>
                  Search
                </Text>
              </Box>
            </Link>

            <Link to={`/my-profile/${profile?.id}`}>
              <Box display={"flex"} alignItems={"center"} gap={3} mb={6}>
                <Text fontSize={"2xl"}>
                  {location.pathname === "/my-profile" ? (
                    <FaUserAlt />
                  ) : (
                    <FaRegUser />
                  )}
                </Text>
                <Text fontSize={"md"} mt={1}>
                  My Profile
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
              <CiLogout />
            </Text>
            <Text
              fontSize={"md"}
              mt={1}
              cursor={"pointer"}
              onClick={() => {
                props.closeDrawer();
                Swal.fire({
                  title: "Are you sure?",
                  text: "You will logout form app",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#A3D8FF",
                  cancelButtonColor: "#FDFFC2",
                  confirmButtonText: "Yes, logout!",
                }).then((resault) => {
                  if (resault.isConfirmed) {
                    localStorage.clear();
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
