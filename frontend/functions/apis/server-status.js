
import { SERVER_URL } from "../../constants";

const CheckServerStatus = async () => {
  const myHeaders = new Headers();
  myHeaders.append("ngrok-skip-browser-warning", "790355");
  const requestOptions = {
    headers: myHeaders,
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
