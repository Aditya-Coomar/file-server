"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserSignup } from "../../../../functions/apis/signup";

const SignupPage = () => {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [user, setUser] = useState({
    email: "",
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const signupFields = [
    {
      label: "Email",
      type: "email",
      placeholder: "enter your email",
      name: "email",
      autoComplete: "email",
      onchange: (e) => setUser({ ...user, email: e.target.value }),
      value: user.email,
    },
    {
      label: "Full Name",
      type: "text",
      placeholder: "enter your full name",
      name: "fullName",
      autoComplete: "name",
      onchange: (e) => setUser({ ...user, fullName: e.target.value }),
      value: user.fullName,
    },
    {
      label: "Username",
      type: "text",
      placeholder: "enter your username",
      name: "username",
      autoComplete: "username",
      onchange: (e) => setUser({ ...user, username: e.target.value }),
      value: user.username,
    },
  ];

  const [submitDisabled, setSubmitDisabled] = useState(false);
  const checkSubmitDisabled = () => {
    if (user.password !== user.confirmPassword || user.password.length < 8) {
      setSubmitDisabled(true);
    } else if (
      user.email.length === 0 ||
      user.fullName.length === 0 ||
      user.username.length === 0
    ) {
      setSubmitDisabled(true);
    } else {
      setSubmitDisabled(false);
    }
  };
  useEffect(() => {
    checkSubmitDisabled();
  }, [user]);

  const [showError, setShowError] = useState({ message: "", display: false });
  const [showSuccess, setShowSuccess] = useState({
    message: "",
    display: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSignup = async (e) => {
    setSubmitting(true);
    e.preventDefault();
    UserSignup(user.email, user.fullName, user.username, user.password).then(
      (response) => {
        if (response.status == "error") {
          setSubmitting(false);
          setShowError({ message: response.message, display: true });
          setUser({ ...user, password: "", confirmPassword: "" });
          setTimeout(() => {
            setShowError({ message: "", display: false });
          }, 5000);
        } else if (response.status == "success") {
          sessionStorage.setItem("userEmail", user.email);
          setShowSuccess({ message: response.message, display: true });
          setTimeout(() => {
            router.push("/client/signup/verify/account");
          }, 2000);
        }
      }
    );
  };
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-7 md:gap-10 lg:gap-14 w-full mt-2">
          <div className="flex flex-col justify-center items-center gap-8">
            <div className="flex gap-2 justify-center items-center tracking-wide">
              <span className="text-white font-bold text-xl md:text-2xl">
                Sign up to Data Dock
              </span>
            </div>
            <img
              src="/logo.png"
              alt="logo"
              className="h-[90px] sm:h-[120px] md:h-[200px] lg:h-[300px] w-auto"
            />
          </div>
          {/*<hr className="bg-white/20 hidden sm:block sm:h-[400px] sm:w-[1px] sm:mr-7 mx-3" />*/}
          <div className="flex flex-col items-center justify-center gap-4 w-[350px]">
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
            <form className="flex flex-col gap-3 items-center justify-center w-full">
              {signupFields.map((field, index) => (
                <div key={index} className="flex flex-col w-full">
                  <div className="text-white/60 text-base font-semibold bg-[#0a0a0a] w-fit px-1 -mb-3 ml-2 z-10">
                    {field.label} <span className="text-yellow-500">*</span>
                  </div>
                  <input
                    type={field.type}
                    className="w-full text-lg py-3 bg-transparent border border-white/30 text-white/80 px-2 placeholder:text-white/40 placeholder:text-base"
                    name={field.name}
                    placeholder={field.placeholder}
                    autoComplete={field.autoComplete}
                    onChange={field.onchange}
                    value={field.value}
                  />
                </div>
              ))}
              <div className="flex flex-col w-full">
                <div className="text-white/60 text-base font-semibold bg-[#0a0a0a] w-fit px-1 -mb-3 ml-2 z-10">
                  Password <span className="text-yellow-500">*</span>
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
              {user.password.length > 0 && user.password.length < 8 && (
                <div className="flex flex-row items-center w-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="14px"
                    fill="#991b1b"
                  >
                    <path d="M109-120q-11 0-20-5.5T75-140q-5-9-5.5-19.5T75-180l370-640q6-10 15.5-15t19.5-5q10 0 19.5 5t15.5 15l370 640q6 10 5.5 20.5T885-140q-5 9-14 14.5t-20 5.5H109Zm69-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm0-120q17 0 28.5-11.5T520-400v-120q0-17-11.5-28.5T480-560q-17 0-28.5 11.5T440-520v120q0 17 11.5 28.5T480-360Zm0-100Z" />
                  </svg>
                  <p className="text-red-800 text-sm ml-2">
                    {" "}
                    Password must be at least 8 characters long
                  </p>
                </div>
              )}
              <div className="flex flex-col w-full">
                <div className="text-white/60 text-base font-semibold bg-[#0a0a0a] w-fit px-1 -mb-3 ml-2 z-10">
                  Confirm Password <span className="text-yellow-500">*</span>
                </div>
                <div className="flex flex-row justify-between ">
                  <input
                    type="password"
                    className={`w-full text-lg py-3 border border-white/30 ${
                      !(user.confirmPassword.length === 0) && "border-r-0"
                    } text-white/80 bg-transparent px-2 placeholder:text-white/40 placeholder:text-base`}
                    name="username"
                    placeholder="confirm your password"
                    value={user.confirmPassword}
                    onChange={(e) =>
                      setUser({ ...user, confirmPassword: e.target.value })
                    }
                  />
                  <button
                    className={`text-white/60 border border-white/30 px-3 border-l-0 ${
                      user.confirmPassword.length === 0 && "hidden"
                    }`}
                    type="button"
                    disabled
                  >
                    {user.password === user.confirmPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="20px"
                        fill="#75FB4C"
                      >
                        <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="20px"
                        fill="#EA3323"
                      >
                        <path d="M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="flex w-full">
                <p className="text-yellow-500 text-sm">
                  Required fields are marked with an asterisk ( * )
                </p>
              </div>
              <div className="w-full mt-1">
                <button
                  type="submit"
                  className={`py-3 w-full font-bold tracking-wider text-black ${
                    submitDisabled
                      ? "bg-white/70 cursor-not-allowed"
                      : "bg-white"
                  }`}
                  onClick={handleSignup}
                  disabled={submitDisabled || submitting}
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
                    "Sign Up"
                  )}
                </button>
              </div>
            </form>
            <button onClick={() => router.push("/")}>
              <p className="text-white/50 text-sm tracking-wide">
                Already have an account?{" "}
                <span className="text-white hover:text-white/80 cursor-pointer font-semibold">
                  Login
                </span>
              </p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;
