import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  BrowserRouter,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Flex, Spinner } from "@chakra-ui/react";
import { API } from "@/utils/api";
import Main from "@/layout/Main";
import HomePage from "@/pages/HomePage";
import ReplyPage from "@/pages/ReplyPage";
import SearchPage from "@/pages/SearchPage";
import ProfilePage from "@/pages/ProfilePage";
import EditProfilePage from "@/pages/EditProfilePage";
import RegisterPage from "@/pages/RegisterPage";
import LoginPage from "@/pages/LoginPage";

function Router() {
  // menandakan proses pengecekan sedang dijalankan
  const [checkAuthFinish, setCheckAuthFinish] = useState<boolean>(true);
  const token = localStorage.getItem("token");
  async function authCheck() {
    try {
      await API.get("check", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      localStorage.clear();
      return <Navigate to="/login" />;
    } finally {
      setCheckAuthFinish(false);
    }
  }

  useEffect(() => {
    if (token) {
      authCheck();
    } else {
      setCheckAuthFinish(false);
    }
  }, [token]);

  function IsLogin() {
    if (token) {
      return <Navigate to={"/"} />;
    } else {
      return <Outlet />;
    }
  }

  function IsNotLogged() {
    if (!token) {
      return <Navigate to={"/login"} />;
    } else {
      return <Outlet />;
    }
  }

  return (
    <>
      {checkAuthFinish && (
        <Flex
          justifyContent={"center"}
          alignItems={"center"}
          width={"100vw"}
          height={"100vh"}
        >
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            width={"70px"}
            height={"70px"}
          />
        </Flex>
      )}

      {!checkAuthFinish && (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<IsNotLogged />}>
              <Route path="/">
                <Route
                  index
                  element={
                    <Main>
                      <HomePage />
                    </Main>
                  }
                />
              </Route>

              <Route path="/reply/:threadID">
                <Route
                  index
                  element={
                    <Main>
                      <ReplyPage />
                    </Main>
                  }
                />
              </Route>

              <Route path="/search">
                <Route
                  index
                  element={
                    <Main>
                      <SearchPage />
                    </Main>
                  }
                />
              </Route>

              <Route path="/profile/:userID">
                <Route
                  index
                  element={
                    <Main>
                      <ProfilePage />
                    </Main>
                  }
                />
              </Route>

              <Route path="/profile/:userID">
                <Route
                  index
                  element={
                    <Main>
                      <ProfilePage />
                    </Main>
                  }
                />
              </Route>

              <Route path="/edit-profile">
                <Route
                  index
                  element={
                    <Main>
                      <EditProfilePage />
                    </Main>
                  }
                />
              </Route>
            </Route>

            <Route path="/" element={<IsLogin />}>
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
}

export default Router;
