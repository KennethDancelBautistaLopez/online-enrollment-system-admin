import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href={'/'} className="flex gap-1 items-center ">
      <Image
        src="/SCC icon.webp" 
        alt="Admin Logo"
        width={40}  // Specify the width (you can adjust as needed)
        height={40} // Specify the height (you can adjust as needed)
        className="mr-2 rounded-full object-cover dark:bg-gray-700 shadow-md bg-white"
      />
      <span className="dark:text-white text-xl font-bold">
        SCC ADMIN
      </span>
    </Link>
  );
}
