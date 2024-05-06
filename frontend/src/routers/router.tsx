import { useEffect, useState, ReactNode } from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
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

  function IsLogin({ children }: { children: ReactNode }) {
    if (token) {
      return <>{children}</>;
    }
    return <Navigate to="/login" />;
  }

  function IsNotLogged({ children }: { children: ReactNode }) {
    if (!token) {
      return <>{children}</>;
    }
    return <Navigate to="/" />;
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
            <Route path="/">
              <Route
                index
                element={
                  <IsLogin>
                    <Main>
                      <HomePage />
                    </Main>
                  </IsLogin>
                }
              />
            </Route>

            <Route path="/reply/:threadId">
              <Route
                index
                element={
                  <IsLogin>
                    <Main>
                      <ReplyPage />
                    </Main>
                  </IsLogin>
                }
              />
            </Route>

            <Route path="/search">
              <Route
                index
                element={
                  <IsLogin>
                    <Main>
                      <SearchPage />
                    </Main>
                  </IsLogin>
                }
              />
            </Route>

            <Route path="/profile/:userId">
              <Route
                index
                element={
                  <IsLogin>
                    <Main>
                      <ProfilePage />
                    </Main>
                  </IsLogin>
                }
              />
            </Route>

            <Route path="/my-profile/:userId">
              <Route
                index
                element={
                  <IsLogin>
                    <Main>
                      <ProfilePage />
                    </Main>
                  </IsLogin>
                }
              />
            </Route>

            <Route path="/edit-profile">
              <Route
                index
                element={
                  <IsLogin>
                    <Main>
                      <EditProfilePage />
                    </Main>
                  </IsLogin>
                }
              />
            </Route>

            <Route path="/register">
              <Route
                index
                element={
                  <IsNotLogged>
                    <RegisterPage />
                  </IsNotLogged>
                }
              />
            </Route>

            <Route path="/login">
              <Route
                index
                element={
                  <IsNotLogged>
                    <LoginPage />
                  </IsNotLogged>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
}

export default Router;
