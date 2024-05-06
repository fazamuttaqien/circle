import { AxiosError } from "axios";

export default function getError(error: unknown) {
  let errorMessage: string = "Unknown Error";

  if (error instanceof AxiosError) {
    if (error.message) {
      errorMessage = error.response?.data.message;
    } else {
      errorMessage = error.message;
    }
  }

  return errorMessage;
}
