import { useEffect, useState } from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { useAppDispacth } from "../redux/store";
import Main from "@/layout/Main";
import HomePage from "@/pages/HomePage";
import ReplyPage from "@/pages/ReplyPage";
import SearchPage from "@/pages/SearchPage";
import ProfilePage from "@/pages/ProfilePage";
import EditProfilePage from "@/pages/EditProfilePage";
import RegisterPage from "@/pages/RegisterPage";
import LoginPage from "@/pages/LoginPage";
import { authCheckAsync } from "@/redux/slice/auth";
import Auth from "@/layout/Auth";

function Router() {
  // menandakan proses pengecekan sedang dijalankan
  const [checkAuthFinish, setCheckAuthFinish] = useState<boolean>(true);
  const token = localStorage.getItem("token");

  const dispatch = useAppDispacth();

  async function authCheck() {
    try {
      if (token) {
        await dispatch(authCheckAsync(token));
      }
    } catch (error) {
      localStorage.clear();
      return <Navigate to="/login" />;
    } finally {
      setCheckAuthFinish(false);
    }
  }

  // useEffect(() => {
  //   if (token) {
  //     authCheck();
  //   } else {
  //     setCheckAuthFinish(false);
  //   }
  // }, [token]);

  useEffect(() => {
    authCheck();
  }, []);

  // function IsLogin() {
  //   if (token) {
  //     return <Navigate to={"/"} />;
  //   } else {
  //     return <Outlet />;
  //   }
  // }

  // function IsNotLogged() {
  //   if (!token) {
  //     return <Navigate to={"/login"} />;
  //   } else {
  //     return <Outlet />;
  //   }
  // }

  return (
    <>
      {/* {checkAuthFinish && (
        <Flex justifyContent={"center"} alignItems={"center"} h={"100vh"} w={"100vh"}>
          <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" w={"70px"} h={"70px"} />
        </Flex>
      )} */}
      {!checkAuthFinish && (
        <BrowserRouter>
          <Routes>
            <Route path="/">
              <Route
                index
                element={
                  <>
                    <Main>
                      <HomePage />
                    </Main>
                  </>
                }
              />
            </Route>

            <Route path="/reply/:threadID">
              <Route
                index
                element={
                  <>
                    <Main>
                      <ReplyPage />
                    </Main>
                  </>
                }
              />
            </Route>
            <Route path="/search">
              <Route
                index
                element={
                  <>
                    <Main>
                      <SearchPage />
                    </Main>
                  </>
                }
              />
            </Route>

            <Route path="/profile/:userID">
              <Route
                index
                element={
                  <>
                    <Main>
                      <ProfilePage />
                    </Main>
                  </>
                }
              />
            </Route>

            <Route path="/edit-profile">
              <Route
                index
                element={
                  <>
                    <Main>
                      <EditProfilePage />
                    </Main>
                  </>
                }
              />
            </Route>

            <Route
              path="/register"
              element={
                <Auth>
                  <RegisterPage />
                </Auth>
              }
            ></Route>
            <Route
              path="/login"
              element={
                <Auth>
                  <LoginPage />
                </Auth>
              }
            ></Route>
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
}

export default Router;
