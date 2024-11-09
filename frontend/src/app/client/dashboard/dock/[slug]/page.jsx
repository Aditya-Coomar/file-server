"use client";
import { useRouter } from "next/navigation";


const ChildDock = ({params}) => {
  const slug = params.slug;
  return <div className="text-white"> {slug}</div>;
};
export default ChildDock;