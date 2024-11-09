"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CheckServerStatus } from "../../functions/apis/server-status";
import { ReactTyped } from "react-typed";
import { useRouter } from "next/navigation";
import { DefaultLogin } from "../../functions/apis/login";
import Cookies from "js-cookie";
import { authExpiry } from "../../functions/helpers/auth-expiry";

export default function Home() {
  const router = useRouter();
  const [serverStatus, setServerStatus] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [showError, setShowError] = useState({ message: "", display: false });
  const [showSuccess, setShowSuccess] = useState({
    message: "",
    display: false,
  });

  useEffect(() => {
    CheckServerStatus().then((response) => {
      if (response.status === 200) {
        setServerStatus(true);
        if (Cookies.get("userAuth")) {
          if (authExpiry(Cookies.get("userAuth"))) {
            router.push("/");
          } else {
            router.push("/client/dashboard");
          } 
        }
      } else {
        setServerStatus(false);
      }
    });
  }, []);

  const [user, setUser] = useState({ username: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = (e) => {
    setSubmitting(true);
    e.preventDefault();
    DefaultLogin(user.username, user.password).then((response) => {
      if (response.status === "success") {
        setShowSuccess({ message: response.message, display: true });
        Cookies.set("userAuth", response.token, { expires: 1 });
        setTimeout(() => {
          setShowSuccess({ message: "", display: false });
          router.push("/client/dashboard");
        }, 1000);
      } else if (
        response.status === "error" &&
        response.message == "User is not verified"
      ) {
        setShowError({
          message: response.message + ". Verify your account first.",
          display: true,
        });
        sessionStorage.setItem("userEmail", user.username);
        setTimeout(() => {
          setShowError({ message: "", display: false });
          router.push("/client/signup/verify/account");
        }, 2000);
      } else if (response.status === "error") {
        setShowError({ message: response.message, display: true });
        setSubmitting(false);
        setTimeout(() => {
          setShowError({ message: "", display: false });
        }, 6000);
      }
    });
  };
  return (
    <>
      <div className="flex flex-col justify-center items-center mt-1 sm:mt-0 sm:h-screen gap-5 px-1">
        {serverStatus ? (
          <div className="bg-green-950/30 text-green-700 w-full sm:w-auto text-sm md:text-base font-mono border border-green-900 py-4 px-4 text-center">
            The server responded successfully.
          </div>
        ) : (
          <div className="bg-red-950/30 text-red-700 w-full sm:w-auto text-sm md:text-base border border-red-900 font-mono py-4 px-4 text-center">
            Connection failed. The server is offline or troubleshoot your
            connection.
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center items-center gap-10 w-full mt-5">
          <div className="flex flex-col justify-center items-center gap-10">
            <div className="flex gap-2 justify-center items-center tracking-wide">
              <span className="text-white font-bold text-xl">Dock your</span>
              <ReactTyped
                strings={["Data", "Images", "Videos", "Files"]}
                typeSpeed={100}
                backSpeed={50}
                backDelay={1000}
                loop
                className="text-white font-bold font-mono text-xl"
              />
            </div>
            <img
              src="/logo.png"
              alt="logo"
              className="h-[100px] sm:h-[150px] md:h-[200px] w-auto"
            />
          </div>

          {/*<hr className="bg-white/20 hidden sm:block sm:h-[400px] sm:w-[1px] sm:mr-7 mx-3" />*/}
          <div className="flex flex-col items-center justify-center gap-4 w-[350px]">
            <form className="flex flex-col gap-4 items-center justify-center w-full">
              <div className="flex flex-col w-full">
                <div className="text-white/60 text-base font-semibold bg-[#0a0a0a] w-fit px-1 -mb-3 ml-2 z-10">
                  Username
                </div>
                <input
                  type="text"
                  className="w-full text-lg py-3 bg-transparent border border-white/30 text-white/80 px-2 placeholder:text-white/40 placeholder:text-base"
                  name="username"
                  placeholder="enter your username / email"
                  value={user.username}
                  onChange={(e) =>
                    setUser({ ...user, username: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col w-full">
                <div className="text-white/60 text-base font-semibold bg-[#0a0a0a] w-fit px-1 -mb-3 ml-2 z-10">
                  Password
                </div>
                <div className="flex flex-row justify-between ">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    className="w-full text-lg py-3 border border-white/30 text-white/80 bg-transparent px-2 placeholder:text-white/40 placeholder:text-base"
                    name="username"
                    placeholder="enter your password"
                    value={user.password}
                    onChange={(e) =>
                      setUser({ ...user, password: e.target.value })
                    }
                  />
                  <button
                    className={`text-white/60 border border-white/30 px-3 border-l-0 ${
                      passwordVisible
                        ? "bg-white/70 border-black"
                        : "bg-transparent"
                    }`}
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="20px"
                        viewBox="0 -960 960 960"
                        width="20px"
                        fill={passwordVisible ? "#000000" : "#ffffff"}
                      >
                        <path d="m637-425-62-62q4-38-23-65.5T487-576l-62-62q13-5 27-7.5t28-2.5q70 0 119 49t49 119q0 14-2.5 28t-8.5 27Zm133 133-52-52q36-28 65.5-61.5T833-480q-49-101-144.5-158.5T480-696q-26 0-51 3t-49 10l-58-58q38-15 77.5-21t80.5-6q143 0 261.5 77.5T912-480q-22 57-58.5 103.5T770-292Zm-2 202L638-220q-38 14-77.5 21t-80.5 7q-143 0-261.5-77.5T48-480q22-57 58-104t84-85L90-769l51-51 678 679-51 51ZM241-617q-35 28-65 61.5T127-480q49 101 144.5 158.5T480-264q26 0 51-3.5t50-9.5l-45-45q-14 5-28 7.5t-28 2.5q-70 0-119-49t-49-119q0-14 3.5-28t6.5-28l-81-81Zm287 89Zm-96 96Z" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="20px"
                        viewBox="0 -960 960 960"
                        width="20px"
                        fill={passwordVisible ? "#000000" : "#ffffff"}
                      >
                        <path d="M480-312q70 0 119-49t49-119q0-70-49-119t-119-49q-70 0-119 49t-49 119q0 70 49 119t119 49Zm0-72q-40 0-68-28t-28-68q0-40 28-68t68-28q40 0 68 28t28 68q0 40-28 68t-68 28Zm0 192q-142.6 0-259.8-78.5Q103-349 48-480q55-131 172.2-209.5Q337.4-768 480-768q142.6 0 259.8 78.5Q857-611 912-480q-55 131-172.2 209.5Q622.6-192 480-192Zm0-288Zm0 216q112 0 207-58t146-158q-51-100-146-158t-207-58q-112 0-207 58T127-480q51 100 146 158t207 58Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="w-full">
                <button
                  className={`py-3 w-full font-bold tracking-wider text-black ${
                    !serverStatus
                      ? "cursor-not-allowed bg-white/80"
                      : "bg-white"
                  }`}
                  disabled={!serverStatus || submitting}
                  onClick={handleLogin}
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
                    <div className="flex items-center justify-center gap-2">
                      Login
                    </div>
                  )}
                </button>
              </div>
            </form>
            <div className="flex flex-nowrap w-full items-center">
              <hr className="bg-white/10 h-[1px] w-1/2" />
              <p className="text-white/50 mx-2 font-mono">or</p>
              <hr className="bg-white/10 h-[1px] w-1/2" />
            </div>
            <div className="flex flex-col gap-4 w-full">
              <button
                className={`text-white/60 border border-white/30 py-2 w-full font-semibold tracking-wider flex items-center justify-center gap-3 hover:text-black hover:bg-white ${
                  serverStatus ? "" : "cursor-not-allowed"
                }`}
                disabled={!serverStatus}
                onClick={() => router.push("/client/signin/email")}
              >
                <span>Continue with Email</span>
                {/*<img src={"/icons/mail/white.svg"} className="w-auto h-5" alt="email" />*/}
              </button>
            </div>
            <button
              onClick={() => router.push("/client/signup")}
              disabled={!serverStatus}
            >
              <p className="text-white/50 text-sm tracking-wide">
                Don't have an account?{" "}
                <span className="text-white hover:text-white/80 cursor-pointer font-semibold">
                  Sign up
                </span>
              </p>
            </button>
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
          </div>
        </div>
      </div>
    </>
  );
}
