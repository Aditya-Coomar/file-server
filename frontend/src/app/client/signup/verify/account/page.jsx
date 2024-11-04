"use client";
import SignupPageLayout from "@/components/layout/signup";
import { useState } from "react";
import { useRouter } from "next/navigation";

const VerifyAccountPage = () => {
  return (
    <>
      <SignupPageLayout title="Sign up to Data Dock"></SignupPageLayout>
    </>
  );
};

export default VerifyAccountPage;