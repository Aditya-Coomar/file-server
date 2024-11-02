"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SignupPage = () => {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const signupFields = [
    {
      label: "Email",
      type: "email",
      placeholder: "enter your email",
      name: "email",
      autoComplete: "email",
    },
    {
      label: "Full Name",
      type: "text",
      placeholder: "enter your full name",
      name: "fullName",
      autoComplete: "name",
    },
    {
      label: "Username",
      type: "text",
      placeholder: "enter your username",
      name: "username",
      autoComplete: "username",
    },
  ];
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
            <form className="flex flex-col gap-3 items-center justify-center w-full">
              {signupFields.map((field, index) => (
                <div key={index} className="flex flex-col w-full">
                  <div className="text-white/60 text-base font-semibold bg-[#0a0a0a] w-fit px-1 -mb-3 ml-2 z-10">
                    {field.label}
                  </div>
                  <input
                    type={field.type}
                    className="w-full text-lg py-3 bg-transparent border border-white/30 text-white/80 px-2 placeholder:text-white/40 placeholder:text-base"
                    name={field.name}
                    placeholder={field.placeholder}
                    autoComplete={field.autoComplete}
                  />
                </div>
              ))}
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
              <div className="flex flex-col w-full">
                <div className="text-white/60 text-base font-semibold bg-[#0a0a0a] w-fit px-1 -mb-3 ml-2 z-10">
                  Confirm Password
                </div>
                <input
                  type="password"
                  className="w-full text-lg py-3 bg-transparent border border-white/30 text-white/80 px-2 placeholder:text-white/40 placeholder:text-base"
                  name="confirmPassword"
                  placeholder="confirm your password"
                />
              </div>
              <div className="w-full mt-2">
                <button
                  type="submit"
                  className={`py-3 w-full font-bold tracking-wider text-black ${"bg-white"}`}
                >
                  Sign up
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
