"use client";
import SignupPageLayout from "@/components/layout/signup";
import { authExpiry } from "../../../../functions/helpers/auth-expiry";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserProfile } from "../../../../functions/apis/user";
import Cookies from "js-cookie";

const Dashboard = () => {
  const router = useRouter();
  const [userData, setUserData] = useState({});

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
      console.log("No auth found");
    }
  }, []);
  return (
    <>
      <div className="p-2">
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
            <img src={'/icons/mail/white.svg'} className="h-6 w-auto" />
            <div className="text-lg font-medium">{userData?.email}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
