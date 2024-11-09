"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UserProfile,
  CreateFolder,
  DirectoryContent,
  UploadFile,
  DownloadFile,
  DownloadFolder,
  DeleteFile,
  DeleteFolder,
} from "../../../../../functions/apis/user";
import { authExpiry } from "../../../../../functions/helpers/auth-expiry";
import Cookies from "js-cookie";

const ParentDock = () => {
  const router = useRouter();
  const [userData, setUserData] = useState({});
  const [storageInfo, setStorageInfo] = useState({});
  const [directoryContent, setDirectoryContent] = useState();
  const [createFolderForm, setCreateFolderForm] = useState(false);
  const [uploadFileForm, setUploadFileForm] = useState(false);

  const [newFolderName, setNewFolderName] = useState({ name: "", path: "" });
  const [newFile, setNewFile] = useState({ file: null, path: "" });

  const [showError, setShowError] = useState({ message: "", display: false });
  const [showSuccess, setShowSuccess] = useState({
    message: "",
    display: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [newContent, setNewContent] = useState(0);

  useEffect(() => {
    if (Cookies.get("userAuth")) {
      if (authExpiry(Cookies.get("userAuth"))) {
        router.push("/");
      } else {
        UserProfile(Cookies.get("userAuth")).then((response) => {
          if (response.status === "error") {
            router.push("/");
          } else if (response.status === "success") {
            setUserData(response.message);
          }
        });
      }
    } else {
      router.push("/");
    }
  }, []);

  useEffect(() => {
    if (Cookies.get("userAuth")) {
      if (authExpiry(Cookies.get("userAuth"))) {
        router.push("/");
      } else {
        if (userData?.username) {
          DirectoryContent(Cookies.get("userAuth"), userData?.username).then(
            (response) => {
              if (response.status === "error") {
                console.log("Error");
              } else if (response.status === "success") {
                setDirectoryContent(response.message);
              }
            }
          );
        }
      }
    } else {
      router.push("/");
    }
  }, [userData, newContent]);

  const CreateNewFolder = (e) => {
    e.preventDefault();
    setSubmitting(true);
    CreateFolder(
      Cookies.get("userAuth"),
      userData?.username,
      newFolderName.name
    ).then((response) => {
      if (response.status === "error") {
        setShowError({ message: response.message, display: true });
        setSubmitting(false);
        setTimeout(() => {
          setShowError({ message: "", display: false });
        }, 4000);
      } else if (response.status === "success") {
        setShowSuccess({ message: response.message, display: true });
        setNewContent(newContent + 1);
        setSubmitting(false);
        setCreateFolderForm(false);
        setTimeout(() => {
          setShowSuccess({ message: "", display: false });
          setNewFolderName({ name: "", path: "" });
        }, 2000);
      }
    });
  };

  const UploadNewFile = (e) => {
    e.preventDefault();
    setSubmitting(true);
    UploadFile(Cookies.get("userAuth"), userData?.username, newFile.file).then(
      (response) => {
        if (response.status === "error") {
          setShowError({ message: response.message, display: true });
          setSubmitting(false);
          setTimeout(() => {
            setShowError({ message: "", display: false });
          }, 4000);
        } else if (response.status === "success") {
          setShowSuccess({ message: response.message, display: true });
          setNewContent(newContent + 1);
          setSubmitting(false);
          setUploadFileForm(false);
          setTimeout(() => {
            setShowSuccess({ message: "", display: false });
            setNewFile({ file: null, path: "" });
          }, 2000);
        }
      }
    );
  };

  const DownloadNewFile = (filename) => {
    DownloadFile(Cookies.get("userAuth"), userData?.username, filename).then(
      (response) => {
        if (response.status === "error") {
          setShowError({ message: response.message, display: true });
          setTimeout(() => {
            setShowError({ message: "", display: false });
          }, 4000);
        } else {
          try {
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (error) {
            console.error(error);
          }
        }
      }
    );
  };

  const DownloadNewFolder = (foldername) => {
    DownloadFolder(
      Cookies.get("userAuth"),
      userData?.username,
      foldername
    ).then((response) => {
      if (response.status === "error") {
        setShowError({ message: response.message, display: true });
        setTimeout(() => {
          setShowError({ message: "", display: false });
        }, 4000);
      } else {
        try {
          const url = window.URL.createObjectURL(new Blob([response]));
          const link = document.createElement("a");
          link.href = url;
          let filename = foldername + ".zip";
          link.setAttribute("download", filename);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        } catch (error) {
          setShowError({ message: "Error Downloading", display: true });
          setTimeout(() => {
            setShowError({ message: "", display: false });
          }, 3000);
        }
      }
    });
  };

  const DeleteNewFile = (filename) => {
    DeleteFile(Cookies.get("userAuth"), userData?.username, filename).then(
      (response) => {
        if (response.status === "error") {
          setShowError({ message: response.message, display: true });
          setTimeout(() => {
            setShowError({ message: "", display: false });
          }, 4000);
        } else {
          setNewContent(newContent + 1);
          setShowSuccess({ message: response.message, display: true });
          setTimeout(() => {
            setShowSuccess({ message: "", display: false });
          }, 2000);
        }
      }
    );
  };

  const DeleteNewFolder = (foldername) => {
    DeleteFolder(Cookies.get("userAuth"), userData?.username, foldername).then(
      (response) => {
        if (response.status === "error") {
          setShowError({ message: response.message, display: true });
          setTimeout(() => {
            setShowError({ message: "", display: false });
          }, 4000);
        } else {
          setNewContent(newContent + 1);
          setShowSuccess({ message: response.message, display: true });
          setTimeout(() => {
            setShowSuccess({ message: "", display: false });
          }, 2000);
        }
      }
    );
  };

  return (
    <>
      <div className="p-2 flex flex-col gap-2 min-h-screen overflow-auto">
        <div className="bg-white/5 w-full flex flex-col gap-6 py-3 px-3 rounded-md text-white">
          <div className="w-full flex justify-between items-center gap-2">
            <img
              src={"/icons/cloud.png"}
              alt="Settings Image"
              className="h-12 w-auto"
            />
            <div className="text-2xl font-semibold tracking-wide">
              Your Dock
            </div>
          </div>
        </div>
        <div className="bg-white/5 w-full flex flex-col gap-6 py-3 px-3 rounded-md text-white">
          <div className="w-full flex justify-start items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20px"
              viewBox="0 -960 960 960"
              width="20px"
              fill="#FFFFFF"
            >
              <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm8-360-36 36q-11 11-11 28t11 28q11 11 28 11t28-11l104-104q12-12 12-28t-12-28L508-612q-11-11-28-11t-28 11q-11 11-11 28t11 28l36 36H360q-17 0-28.5 11.5T320-480q0 17 11.5 28.5T360-440h128Z" />
            </svg>
            <div className="text-base font-semibold tracking-wide flex justify-between w-full items-center">
              {"/"}
              {userData?.username}
              {"/"}
              <button onClick={() => router.push("/client/dashboard")}>
                <img src={"/icons/home.png"} className="h-6 w-auto" />
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1 text-white/95">
          <button
            className="w-full flex justify-between items-center gap-2 bg-white/5 px-2 py-4 rounded-md"
            onClick={() => setCreateFolderForm(!createFolderForm)}
          >
            <img src={"/icons/add-folder.png"} className="h-6 w-auto" />
            <div className="text-base font-medium tracking-wide">
              Add Collection
            </div>
          </button>
          <button
            className="w-full flex justify-between items-center gap-2 bg-white/5 px-2 py-4 rounded-md"
            onClick={() => setUploadFileForm(!uploadFileForm)}
          >
            <img src={"/icons/upload_file.png"} className="h-6 w-auto" />
            <div className="text-base font-medium tracking-wide">
              Upload File
            </div>
          </button>
        </div>

        {createFolderForm && (
          <div className="bg-white/5 w-full flex flex-col gap-4 py-3 px-3 rounded-md text-white">
            <div className="w-full flex justify-between items-center gap-3">
              <img
                src={"/icons/folder.png"}
                alt="Folder Image"
                className="h-7 w-auto"
              />
              <div className="flex flex-col w-full">
                <input
                  type="text"
                  className="w-full font-medium tracking-wide rounded-md text-lg py-3 bg-transparent border border-white/10 text-white/80 px-3 placeholder:text-white/40 placeholder:text-base active:border-0 focus:border-0"
                  name="folderName"
                  placeholder="enter your collection name"
                  value={newFolderName.name}
                  onChange={(e) =>
                    setNewFolderName({
                      name: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="w-full grid grid-cols-2 items-center gap-2">
              <button
                type="button"
                className="bg-white/10 py-2 rounded-md text-white/80 font-semibold tracking-wide"
                onClick={() => setCreateFolderForm(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="bg-white/90 py-2 rounded-md text-black font-bold tracking-wide"
                onClick={CreateNewFolder}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin mx-auto h-6 w-6 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </>
                ) : (
                  <>Create</>
                )}
              </button>
            </div>
          </div>
        )}

        {uploadFileForm && (
          <div className="bg-white/5 w-full flex flex-col gap-4 py-3 px-3 rounded-md text-white">
            <div className="w-full flex justify-between items-center gap-3">
              <img
                src={"/icons/document.png"}
                alt="Folder Image"
                className="h-7 w-auto"
              />
              <div className="flex flex-col w-full">
                <input
                  type="file"
                  className="w-full font-medium tracking-wide rounded-md text-sm py-3 bg-transparent border border-white/10 text-white/80 px-3 placeholder:text-white/40 placeholder:text-base active:border-0 focus:border-0"
                  name="uploadFile"
                  placeholder="upload your file"
                  onChange={(e) => setNewFile({ file: e.target.files[0] })}
                />
              </div>
            </div>
            <div className="w-full grid grid-cols-2 items-center gap-2">
              <button
                type="button"
                className="bg-white/10 py-2 rounded-md text-white/80 font-semibold tracking-wide"
                onClick={() => setUploadFileForm(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="bg-white/90 py-2 rounded-md text-black font-bold tracking-wide"
                onClick={UploadNewFile}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin mx-auto h-6 w-6 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </>
                ) : (
                  <>Upload</>
                )}
              </button>
            </div>
          </div>
        )}

        {showError.display && (
          <div className="bg-red-950/30 text-red-700 w-full text-sm md:text-base border border-red-900 font-mono py-3 px-2 text-center">
            {showError.message}
          </div>
        )}
        {showSuccess.display && (
          <div className="bg-green-950/30 text-green-700 w-full text-sm md:text-base font-mono border border-green-900 py-4 px-2 text-center">
            {showSuccess.message}
          </div>
        )}

        <div className="flex flex-col bg-white/5 w-full px-3 py-5 gap-3 text-white/80 rounded-md flex-grow">
          {directoryContent?.map((item, index) => (
            <div
              className="flex justify-start items-center gap-3 py-3 border-b border-white/10"
              key={index}
            >
              <img
                src={
                  item.type == "directory"
                    ? "/icons/folder.png"
                    : "/icons/document.png"
                }
                className="h-5 w-auto"
              />
              <div className="text-base font-medium tracking-wide w-full flex items-center justify-between">
                <span className="text-nowrap truncate">{item.name}</span>
                <div className="flex justify-end items-center gap-4">
                  <button
                    onClick={() => {
                      if (item.type == "directory") {
                        router.push(`/client/dashboard/dock/${item.name}`);
                      } else {
                        DownloadNewFile(item.name);
                      }
                    }}
                  >
                    <img
                      src={
                        item.type == "directory"
                          ? "/icons/open_folder.png"
                          : "/icons/download_file.png"
                      }
                      className="h-5 w-auto"
                    />
                  </button>
                  <>
                    {item.type == "directory" && (
                      <button onClick={() => DownloadNewFolder(item.name)}>
                        <img
                          src={"/icons/zip.png"}
                          className="h-5 mt-1 w-auto"
                        />
                      </button>
                    )}
                  </>
                    <button onClick={() => 
                        item.type == "directory"
                            ? DeleteNewFolder(item.name)
                            : DeleteNewFile(item.name)
                    }>
                        <img src={"/icons/delete.png"} className="h-5 w-auto" />
                    </button>
                </div>
              </div>
            </div>
          ))}
          {directoryContent?.length == 0 && (
            <div className="flex justify-center items-center gap-3 py-3 border-b border-white/10">
              <div className="text-base font-semibold tracking-wide">
                No Files or Folders found
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ParentDock;
