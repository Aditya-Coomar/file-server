import { SERVER_URL } from "../../constants";

const UserProfile = async (authToken) => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${authToken}`);
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

const DirectoryInfo = async (authToken) => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${authToken}`);
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("ngrok-skip-browser-warning", "790355");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  try {
    const response = await fetch(
      `${SERVER_URL}/api/auth/user/storage/info`,
      requestOptions
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
};

const DirectoryContent = async (authToken, path) => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${authToken}`);
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("ngrok-skip-browser-warning", "790355");

  const raw = JSON.stringify({
    directory_path: path,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  try {
    const response = await fetch(
      `${SERVER_URL}/api/auth/user/get/directory`,
      requestOptions
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
};

const CreateFolder = async (authToken, path, folderName) => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${authToken}`);
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("ngrok-skip-browser-warning", "790355");

  const raw = JSON.stringify({
    directory_name: folderName,
    base_directory_path: path,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  try {
    const response = await fetch(
      `${SERVER_URL}/api/auth/user/create/directory`,
      requestOptions
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
};

const UploadFile = async (authToken, path, file) => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${authToken}`);
  myHeaders.append("ngrok-skip-browser-warning", "790355");

  const formdata = new FormData();
  formdata.append("directory_path", path);
  formdata.append("file", file);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formdata,
    redirect: "follow",
  };

  try {
    const response = await fetch(
      `${SERVER_URL}/api/auth/user/upload/file`,
      requestOptions
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
};

const DownloadFile = async (authToken, path, filename) => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${authToken}`);
  myHeaders.append("ngrok-skip-browser-warning", "790355");

  const formdata = new FormData();
  formdata.append("directory_path", "aditya_coomar");
  formdata.append("file_name", "UNITV COA.pdf");

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formdata,
    redirect: "follow",
  };

  try {
    const response = await fetch(
      `${SERVER_URL}/api/auth/user/download/file`,
      requestOptions
    );
    if (!response.ok) {
      const message = await response.json();
      return message;
    }
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error(error);
  }
};

const DownloadFolder = async (authToken, path, foldername) => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${authToken}`);
  myHeaders.append("ngrok-skip-browser-warning", "790355");

  const formdata = new FormData();
  formdata.append("directory_path", `${path}/${foldername}`);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formdata,
    redirect: "follow",
  };

  try {
    const response = await fetch(
      `${SERVER_URL}/api/auth/user/download/folder`,
      requestOptions
    );
    if (!response.ok) {
      const message = await response.json();
      return message;
    } else {
      const blob = await response.blob();
      return blob;
    }
  } catch (error) {
    console.error(error);
  }
};

const DeleteFile = async (authToken, path, filename) => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${authToken}`);
  myHeaders.append("ngrok-skip-browser-warning", "790355");

  const formdata = new FormData();
  formdata.append("directory_path", path);
  formdata.append("file_name", filename);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formdata,
    redirect: "follow",
  };

  try {
    const response = await fetch(
      `${SERVER_URL}/api/auth/user/delete/file`,
      requestOptions
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
};

const DeleteFolder = async (authToken, path, foldername) => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${authToken}`);
  myHeaders.append("ngrok-skip-browser-warning", "790355");

  const formdata = new FormData();
  formdata.append("directory_path", `${path}/${foldername}`);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formdata,
    redirect: "follow",
  };

  try {
    const response = await fetch(
      `${SERVER_URL}/api/auth/user/delete/folder`,
      requestOptions
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
};

export {
  UserProfile,
  DirectoryInfo,
  DirectoryContent,
  CreateFolder,
  UploadFile,
  DownloadFile,
  DownloadFolder,
  DeleteFile,
  DeleteFolder,
};
