import { SERVER_URL } from "../../constants";

const UserProfile = async (authToken) => {
  const myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    `Bearer ${authToken}`
  );
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("ngrok-skip-browser-warning", "790355");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  try {
    const response = await fetch(
      `${SERVER_URL}/api/auth/user/profile`,
      requestOptions
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
};

export { UserProfile };