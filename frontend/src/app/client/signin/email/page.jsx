"use client";
import SignupPageLayout from "@/components/layout/signup";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SendVerificationEmail } from "../../../../../functions/apis/signup";

const SigninViaEmail = () => {
  const router = useRouter();
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [submitDisabled, setSubmitDisabled] = useState(false);

  useEffect(() => {
    if (registeredEmail.length === 0 || !registeredEmail.includes("@")) {
        setSubmitDisabled(true);    
    }
  }, []);
  
  const [submitting, setSubmitting] = useState(false);

  const [showError, setShowError] = useState({ message: "", display: false });
  const [showSuccess, setShowSuccess] = useState({
    message: "",
    display: false,
  });

  const SendVerficationCode = (e) => {
    setSubmitting(true);
    e.preventDefault();
    SendVerificationEmail(registeredEmail).then((response) => {
      if (response.status === "error") {
        setShowError({ message: response.message, display: true });
        setSubmitting(false);
        setTimeout(() => {
          setShowError({ message: "", display: false });
        }, 6000);
      } else if (response.status === "success") {
        sessionStorage.setItem("loginUserEmail", registeredEmail);
        setShowSuccess({ message: response.message, display: true });
        setSubmitting(false);
        setTimeout(() => {
          setShowSuccess({ message: "", display: false });
          router.push("/client/signup/verify/account/otp");
        }, 2000);
      }
    });
  };
  return (
    <>
      <SignupPageLayout title="Sign in to your Dock">
        <div className="flex flex-col items-center justify-center gap-4 w-[350px]">
          <div className="w-full mt-4 md:mt-0 flex items-center justify-center text-yellow-50 text-xl md:text-2xl font-bold tracking-wider text-center">
            Welcome Back
          </div>
          <div className="w-full bg-white/5 text-white text-base py-5 px-3 rounded-sm text-center font-medium tracking-wide">
            Hey there, bored of typing your password? Sign in via email. We will
            send you a verification code to your&nbsp;
            <span className="font-bold">registered email address</span>.
          </div>
          <form className="flex flex-col gap-4 items-center justify-center w-full">
            <div className="flex flex-col w-full">
              <div className="text-white/60 text-base font-semibold bg-[#0a0a0a] w-fit px-1 -mb-3 ml-2 z-10">
                Registered Email
              </div>
              <input
                type="email"
                className="w-full font-medium tracking-wide text-lg py-4 bg-transparent border border-white/30 text-white/80 px-3 placeholder:text-white/40 placeholder:text-base"
                name="email"
                placeholder="enter your email"
                value={registeredEmail}
                onChange={(e) => setRegisteredEmail(e.target.value)}
              />
            </div>
          </form>
          <div className="w-full mt-1">
            <button
              type="submit"
              className={`py-3 w-full font-bold tracking-wider text-black ${submitDisabled ? "bg-white/70" : "bg-white/95"}`}
              disabled={submitting || submitDisabled}
              onClick={SendVerficationCode}
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
                  Send Verification Code
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="20px"
                    viewBox="0 -960 960 960"
                    width="20px"
                    fill="#000000"
                    className="mt-[2px]"
                  >
                    <path d="M80-160v-640h800v640H80Zm400-280 320-200v-80L480-520 160-720v80l320 200Z" />
                  </svg>
                </div>
              )}
            </button>
          </div>
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
      </SignupPageLayout>
    </>
  );
};

export default SigninViaEmail;
