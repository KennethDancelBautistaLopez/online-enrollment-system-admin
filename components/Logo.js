import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href={'/'} className="flex gap-1 items-center ">
      <Image
        src="/scc-icon.webp" 
        alt="Admin Logo"
        width={40}
        height={40}
        className="mr-2 rounded-full object-cover dark:bg-gray-700 shadow-md bg-white"
      />
      <span className="dark:text-white text-xl font-bold">
        SCC ADMIN
      </span>
    </Link>
  );
}
