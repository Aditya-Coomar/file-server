"use client";
import SignupPageLayout from "@/components/layout/signup";
import { authExpiry } from "../../../../functions/helpers/auth-expiry";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserProfile } from "../../../../functions/apis/user";
import Cookies from "js-cookie";
import { DirectoryInfo } from "../../../../functions/apis/user";

const Dashboard = () => {
  const router = useRouter();
  const [userData, setUserData] = useState({});
  const [storageInfo, setStorageInfo] = useState({});

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
            DirectoryInfo(Cookies.get("userAuth")).then((response) => {
              if (response.status === "error") {
                console.log("Error");
              } else if (response.status === "success") {
                setStorageInfo(response.message);
              }
            });
          }
        });
      }
    } else {
      router.push("/");
    }
  }, []);
  return (
    <>
      <div className="p-2 flex flex-col gap-2 h-screen overflow-auto">
        <div className="bg-white/5 w-full flex flex-col gap-6 py-3 px-3 rounded-md text-white">
          <div className="w-full flex justify-between items-center gap-2">
            <img
              src={"/profile/owl.png"}
              alt="Profile Image"
              className="h-14 w-auto rounded-full"
            />
            <div className="text-2xl font-medium">{userData?.fullname}</div>
          </div>
          <div className="w-full flex justify-start items-center gap-3">
            <img src={"/icons/user.svg"} className="h-6 w-auto" />
            <div className="text-lg font-medium">{userData?.username}</div>
          </div>
          <div className="w-full flex justify-start items-center -mt-3 gap-3">
            <img src={"/icons/mail/white.svg"} className="h-6 w-auto" />
            <div className="text-lg font-medium">{userData?.email}</div>
          </div>
          <div className="w-full flex justify-start items-center -mt-3 gap-3">
            <img src={"/icons/status.svg"} className="h-6 w-auto" />
            <div className="text-lg font-medium">
              {userData.email ? "Online" : "Offline"}
            </div>
            <div
              className={`${
                userData.email ? "bg-green-600" : "bg-red-700"
              } rounded-full h-2 w-2`}
            ></div>
          </div>
          <div className="w-full flex justify-end -mt-14">
            <button onClick={
              () => {
                Cookies.remove("userAuth");
                router.push("/");
              }
            }>
              <img src={"/icons/logout.png"} className="h-8 w-auto" />
            </button>
          </div>
        </div>

        <div className="bg-white/5 w-full flex flex-col gap-6 py-3 px-3 rounded-md text-white">
          <div className="w-full flex justify-between items-center gap-2">
            <img
              src={"/storage.png"}
              alt="Storage Image"
              className="h-12 w-auto"
            />
            <div className="text-2xl font-medium">Your Storage</div>
          </div>
          <div className="flex justify-between items-center mt-1">
            <div className="w-full flex justify-start items-center gap-3 tracking-wider">
              <img src={"/icons/file.svg"} className="h-6 w-auto" />
              <div className="text-lg font-medium text-yellow-500">
                {storageInfo?.count?.files} File(s)
              </div>
            </div>
            <div className="w-full flex justify-start items-center gap-3 tracking-wider">
              <img src={"/icons/folder.svg"} className="h-6 w-auto" />
              <div className="text-lg font-medium text-yellow-500">
                {storageInfo?.count?.folders} Folder(s)
              </div>
            </div>
          </div>
          <div className="w-full flex justify-start items-center -mt-3 gap-3 tracking-wider">
            <img src={"/icons/donut.svg"} className="h-6 w-auto" />
            <div className="text-lg font-medium text-yellow-500">
              {storageInfo?.used_space}
              {"/"}
              {storageInfo?.allocated_space} GB Used
            </div>
          </div>
          <div className="w-full flex justify-start items-center -mt-3 gap-3 tracking-wider">
            <img src={"/icons/status.svg"} className="h-6 w-auto" />
            <div className="text-lg font-medium">
              {storageInfo.allocated_space ? "Online" : "Offline"}
            </div>
            <div
              className={`${
                storageInfo.allocated_space ? "bg-green-600" : "bg-red-700"
              } rounded-full h-2 w-2`}
            ></div>
          </div>
        </div>

        <div className="flex-grow">
          <div className="bg-transparent w-full flex flex-col justify-center items-center gap-6 py-3 px-3 rounded-md text-white mt-5">
            <button className="flex flex-col gap-3 justify-center items-center"
            type="button"
            onClick={() => router.push("/client/dashboard/dock")}
            >
              <img
                src={"/icons/proceed_to_your_doc.png"}
                className="h-28 w-auto"
              />
              <div className="text-xl flex gap-2 justify-center items-center font-semibold">
                Explore your Dock
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="28px"
                  viewBox="0 -960 960 960"
                  width="28px"
                  fill="#FFFFFF"
                >
                  <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm8-360-36 36q-11 11-11 28t11 28q11 11 28 11t28-11l104-104q12-12 12-28t-12-28L508-612q-11-11-28-11t-28 11q-11 11-11 28t11 28l36 36H360q-17 0-28.5 11.5T320-480q0 17 11.5 28.5T360-440h128Z" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        <button className="bg-white/5 w-full flex flex-col gap-6 py-3 px-3 rounded-md text-white"
        type="button"
        >
          <div className="w-full flex justify-between items-center gap-2">
            <img
              src={"/icons/settings.png"}
              alt="Settings Image"
              className="h-8 w-auto"
            />
            <div className="text-xl font-semibold tracking-wide">Settings</div>
          </div>
        </button>
      </div>
    </>
  );
};

export default Dashboard;
