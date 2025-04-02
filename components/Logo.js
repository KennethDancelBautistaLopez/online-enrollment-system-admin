import Link from "next/link";

export default function Logo() {
  return (
    <Link href={'/'} className="flex gap-1 items-center ">
      <img
        src="/SCC icon.webp" 
        alt="Admin Logo"
        className="w-10 h-10 mr-2 rounded-full object-cover shadow-md bg-white"
      />
      <span className=" text-xl font-bold">
        SCC ADMIN
      </span>
    </Link>
  );
}
