import "react-toastify/dist/ReactToastify.css";
import { Fragment } from "react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider } from "react-redux";
import getError from "./utils/getError";
import store from "./redux/store";
import { toastError } from "./utils/toast";
import { ToastContainer } from "react-toastify";
import Router from "./routers/router";

const theme = extendTheme({
  colors: {
    myGreen: "#04A51E",
  },
});

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toastError(getError(error));
    },
  }),
});

function App() {
  return (
    <>
      <Fragment>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <ChakraProvider theme={theme}>
              <Router />
            </ChakraProvider>
            <ReactQueryDevtools initialIsOpen={false} position="bottom" />
          </QueryClientProvider>
        </Provider>
        <ToastContainer />
      </Fragment>
    </>
  );
}

export default App;
