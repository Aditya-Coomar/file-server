import { SERVER_URL } from "../../constants";

const UserSignup = async (email, fullname, username, password) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    email: email,
    fullname: fullname,
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
      `${SERVER_URL}/api/auth/register`,
      requestOptions
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
};

const SendVerificationEmail = async (email) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    email: email,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  try {
    const response = await fetch(
      `${SERVER_URL}/api/auth/otp/send/account`,
      requestOptions
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
};

const VerifyAccount = async (email, otp) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    email: email,
    otp: otp,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  try {
    const response = await fetch(
      `${SERVER_URL}/api/auth/otp/verify/account`,
      requestOptions
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
};

export { UserSignup, SendVerificationEmail, VerifyAccount };
