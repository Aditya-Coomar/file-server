import { SERVER_URL } from "../../constants";

const SimpleLogin = async (username, password) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    username: username,
    password: password,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  try {
    const response = await fetch(
      `${SERVER_URL}/api/login`,
      requestOptions
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
};

export { SimpleLogin };
