import { SERVER_URL } from "../../constants";

const CheckServerStatus = async () => {
  const requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  try {
    const response = await fetch(SERVER_URL, requestOptions);
    return response;
  } catch (error) {
    return error;
  }
};

export { CheckServerStatus };
