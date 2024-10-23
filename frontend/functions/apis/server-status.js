const CheckServerStatus = async () => {
  const requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  try {
    const response = await fetch("http://127.0.0.1:8000/", requestOptions);
    return response;
  } catch (error) {
    return error;
  }
};

export { CheckServerStatus };
