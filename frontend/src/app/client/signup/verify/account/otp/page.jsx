"use client";
import SignupPageLayout from "@/components/layout/signup";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  SendVerificationEmail,
  VerifyAccount,
} from "../../../../../../../functions/apis/signup";

const VerifyAccountOtpPage = () => {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [countDownTimer, setCountDownTimer] = useState(600);
  const [resendOTP, setResendOTP] = useState({ status: false, time: 60 });

  const [showError, setShowError] = useState({ message: "", display: false });
  const [showSuccess, setShowSuccess] = useState({
    message: "",
    display: false,
  });

  useEffect(() => {
    if (!sessionStorage.getItem("userEmail")) {
      router.push("/");
    }
    setUserEmail(sessionStorage.getItem("userEmail"));
    if (countDownTimer > 0) {
      let timeLeft = countDownTimer;
      const timer = setInterval(() => {
        timeLeft--;
        setCountDownTimer(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(timer);
          setShowError({
            message: "OTP expired. Please click on resend OTP",
            display: true,
          });
        }
      }, 1000);
    }
    if (resendOTP.time > 0) {
      let timeLeft = resendOTP.time;
      const timer = setInterval(() => {
        timeLeft--;
        setResendOTP({ status: false, time: timeLeft });
        if (timeLeft <= 0) {
          clearInterval(timer);
          setResendOTP({ status: true, time: 0 });
        }
      }, 1000);
    }
  }, []);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const ResendOTP = () => {
    setSubmitDisabled(true);
    setResending(true);
    SendVerificationEmail(userEmail).then((response) => {
      if (response.status === "error") {
        setShowError({ message: response.message, display: true });
        setSubmitting(false);
        setTimeout(() => {
          setShowError({ message: "", display: false });
          setResending(false);
        }, 5000);
      } else if (response.status === "success") {
        setShowSuccess({ message: response.message, display: true });
        setSubmitting(false);
        setTimeout(() => {
          setShowSuccess({ message: "", display: false });
          window.location.reload();
        }, 4000);
      }
    });
  };

  const [enteredOTP, setEnteredOTP] = useState("");

  const VerifyOTP = (e) => {
    e.preventDefault();
    setSubmitting(true);
    VerifyAccount(userEmail, enteredOTP).then((response) => {
      if (response.status === "error") {
        setShowError({ message: response.message, display: true });
        setEnteredOTP("");
        setSubmitting(false);
        setTimeout(() => {
          setShowError({ message: "", display: false });
        }, 6000);
      } else if (response.status === "success") {
        setShowSuccess({ message: response.message + ". Account Verified.", display: true });
        sessionStorage.removeItem("userEmail");
        setSubmitting(false);
        setTimeout(() => {
          setShowSuccess({ message: "", display: false });
          router.push("/");
        }, 2000);
      }
    });
  };

  return (
    <>
      <SignupPageLayout title="Verify your Dock">
        <div className="flex flex-col items-center justify-center gap-4 w-[350px]">
          <div className="w-full mt-4 md:mt-0 flex items-center justify-center text-yellow-50 text-xl md:text-2xl font-bold tracking-wider text-center">
            Hey {userEmail},
          </div>
          <div className="w-full bg-white/5 text-white text-base py-5 px-3 rounded-sm text-center font-medium tracking-wide">
            Welcome to Data Dock. Your account has been created successfully.
            Please verify your email address to activate your dock.
          </div>
          <form className="flex flex-col gap-4 items-center justify-center w-full">
            <div className="flex flex-col w-full">
              <div className="text-white/60 text-base font-semibold bg-[#0a0a0a] w-fit px-1 -mb-3 ml-2 z-10">
                Enter OTP
              </div>
              <input
                type="number"
                className="w-full text-center font-semibold tracking-widest text-2xl py-4 bg-transparent border border-white/30 text-white/80 px-2 placeholder:text-white/40 placeholder:text-base"
                style={{ letterSpacing: "15px" }}
                name="otp"
                placeholder=""
                value={enteredOTP}
                onChange={(e) => setEnteredOTP(e.target.value)}
              />
            </div>
          </form>
          <div className="w-full flex justify-between items-center mt-1">
            <div className="flex gap-2 text-white/50 font-medium">
              <span>Valid for</span>
              <span className="text-white/80 font-semibold tracking-widest">{`${
                String(Math.floor(countDownTimer / 60)).length == 1
                  ? "0" + String(Math.floor(countDownTimer / 60))
                  : String(Math.floor(countDownTimer / 60))
              }:${
                String(countDownTimer % 60).length == 1
                  ? "0" + String(countDownTimer % 60)
                  : String(countDownTimer % 60)
              } mins`}</span>
            </div>
            <button
              className={`flex gap-2 ${
                resendOTP.status ? "text-white font-medium" : "text-white/60"
              }`}
              disabled={!resendOTP.status}
              onClick={ResendOTP}
            >
              <span>{resending ? "Sending OTP" : "Resend OTP"}</span>
            </button>
          </div>
          <div className="w-full mt-1">
            <button
              type="submit"
              className={`py-3 w-full font-bold tracking-wider text-black ${
                submitting || enteredOTP.length < 6 || submitDisabled
                  ? "bg-white/70"
                  : "bg-white"
              }`}
              disabled={
                submitting ||
                enteredOTP.length < 6 ||
                submitDisabled ||
                countDownTimer <= 0
              }
              onClick={VerifyOTP}
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
                  Verify OTP
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

export default VerifyAccountOtpPage;
