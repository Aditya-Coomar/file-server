const CheckServerStatus = async () => {
  const requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  try {
    const response = await fetch("https://bursting-shepherd-promoted.ngrok-free.app", requestOptions);
    return response;
  } catch (error) {
    return error;
  }
};

export { CheckServerStatus };
