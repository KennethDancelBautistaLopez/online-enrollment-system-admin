import Link from "next/link";
import {useRouter} from "next/router";
import {signOut} from "next-auth/react";
import Cookies from "js-cookie";
import {toast} from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { applyTheme, getSavedTheme} from "@/components/darkmode";

const Logo = dynamic(() => import('@/components/Logo'), { ssr: false });

export default function Nav({show}) {
  const inactiveLink = 'flex gap-1 p-1 text-gray-700 dark:text-gray-300';
  const activeLink = inactiveLink + ' bg-highlight text-black dark:text-white dark:bg-gray-700';
  const inactiveIcon = 'w-6 h-6';
  const activeIcon = inactiveIcon + ' text-primary';
  const [theme, setTheme] = useState('light');
  const router = useRouter();
  const {pathname} = router;


  const { data: session } = useSession();

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      Cookies.remove('user');
      toast.success('Logout successful!');
      router.push('/');
    } catch (error) {
      toast.error('Logout failed! Try again.');
    }
  };

  useEffect(() => {
    const saved = getSavedTheme();
    applyTheme(saved);
    setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    setTheme(newTheme);
  };
  
  return (
<aside className={(show ? 'left-0' : '-left-full') + " top-0 text-gray-500 p-4 fixed w-full bg-bgGray dark:bg-gray-900 h-full md:static md:w-auto transition-all"}>
        <div className="mb-4 mr-4">
          <Logo />
        </div>
    <nav className="flex flex-col gap-2">
      <Link href={'/'} className={pathname === '/' ? activeLink : inactiveLink}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={pathname === '/' ? activeIcon : inactiveIcon}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
        Dashboard
      </Link>
        <Link href={'/students'} className={pathname.includes('/students') ? activeLink : inactiveLink}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={pathname.includes('/students') ? activeIcon : inactiveIcon}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
          </svg>
          Students
        </Link>
        {(session?.user?.role === "admin" || session?.user?.role === "superAdmin" || session?.user?.role === "registrar") && (
          <Link href={'/lists'} className={pathname.includes('/lists') ? activeLink : inactiveLink}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={pathname.includes('/lists') ? activeIcon : inactiveIcon}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        Lists
        </Link>
        )}
        {( session?.user?.role === "superAdmin" || session?.user?.role === "registrar") && (
          <Link href="/manage-subjects" className={pathname.includes('/manage-subjects') ? activeLink : inactiveLink}>
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 -960 960 960"
              fill="currentColor"
              className={pathname.includes('/manage-subjects') ? activeIcon : inactiveIcon}
              width="20"
              height="20"
            >
              <path d="M560-564v-68q33-14 67.5-21t72.5-7q26 0 51 4t49 10v64q-24-9-48.5-13.5T700-600q-38 0-73 9.5T560-564Zm0 220v-68q33-14 67.5-21t72.5-7q26 0 51 4t49 10v64q-24-9-48.5-13.5T700-380q-38 0-73 9t-67 27Zm0-110v-68q33-14 67.5-21t72.5-7q26 0 51 4t49 10v64q-24-9-48.5-13.5T700-490q-38 0-73 9.5T560-454ZM260-320q47 0 91.5 10.5T440-278v-394q-41-24-87-36t-93-12q-36 0-71.5 7T120-692v396q35-12 69.5-18t70.5-6Zm260 42q44-21 88.5-31.5T700-320q36 0 70.5 6t69.5 18v-396q-33-14-68.5-21t-71.5-7q-47 0-93 12t-87 36v394Zm-40 118q-48-38-104-59t-116-21q-42 0-82.5 11T100-198q-21 11-40.5-1T40-234v-482q0-11 5.5-21T62-752q46-24 96-36t102-12q58 0 113.5 15T480-740q51-30 106.5-45T700-800q52 0 102 12t96 36q11 5 16.5 15t5.5 21v482q0 23-19.5 35t-40.5 1q-37-20-77.5-31T700-240q-60 0-116 21t-104 59ZM280-494Z"/>
            </svg>
            Subjects
          </div>
        </Link>
        )}
        {(session?.user?.role === "superAdmin" || session?.user?.role === "registrar") && (
          <Link href="/sections" className={pathname.includes('/sections') ? activeLink : inactiveLink}>
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 -960 960 960"
            fill="currentColor"
            className={pathname.includes('/sections') ? activeIcon : inactiveIcon}
            width="20"
            height="20"
          >
            <path d="M270-80q-45 0-77.5-30.5T160-186v-558q0-38 23.5-68t61.5-38l395-78v640l-379 76q-9 2-15 9.5t-6 16.5q0 11 9 18.5t21 7.5h450v-640h80v720H270Zm90-233 200-39v-478l-200 39v478Zm-80 16v-478l-15 3q-11 2-18 9.5t-7 18.5v457q5-2 10.5-3.5T261-293l19-4Zm-40-472v482-482Z"/>
          </svg>
          Sections
        </div>
      </Link> 
        )}
        {(session?.user?.role === "admin" || session?.user?.role === "superAdmin") && (
          <Link href={'/events'} className={pathname.includes('/events') ? activeLink : inactiveLink}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" strokeWidth={1.5} className={pathname.includes('/events') ? activeIcon : inactiveIcon}>
          <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
        </svg>
        Events
        </Link>
        )}
        
        {session?.user?.role === 'superAdmin' && (
          <>  
        <Link href={'/overall'} className={pathname.includes('/overall') ? activeLink : inactiveLink}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={pathname.includes('/overall') ? activeIcon : inactiveIcon}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9a1 1 0 0 1-1-1V3c0-.552.45-1.007.997-.93a7.004 7.004 0 0 1 5.933 5.933c.078.547-.378.997-.93.997h-5Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M8.003 4.07C8.55 3.994 9 4.449 9 5v5a1 1 0 0 0 1 1h5c.552 0 1.008.45.93.997A7.001 7.001 0 0 1 2 11a7.002 7.002 0 0 1 6.003-6.93Z"/>
        </svg>
        Overall
        </Link>
        </>
        )}
        {(session?.user?.role === 'superAdmin' || session?.user?.role === 'admin' || session?.user?.role === 'registrar') && (
          <Link href={'/totalStudents'} className={pathname.includes('/totalStudents') ? activeLink : inactiveLink}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={pathname.includes('/totalStudents') ? activeIcon : inactiveIcon}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>

          Total Students
          </Link>
        )}

        {(session?.user?.role === 'superAdmin' || session?.user?.role === 'admin'|| session?.user?.role === 'accountant') && (
          <Link href={'/all-payments'} className={pathname.includes('/all-payments') ? activeLink : inactiveLink}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={pathname.includes('/all-payments') ? activeIcon : inactiveIcon}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
          </svg>
          List of Payments</Link>
        )}
            
          {(session?.user?.role === 'superAdmin' || session?.user?.role === 'accountant') && (
          <>  
          <Link href={'/paymentsPage'} className={pathname.includes('/paymentsPage') ? activeLink : inactiveLink}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={pathname.includes('/paymentsPage') ? activeIcon : inactiveIcon}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 7.629A3 3 0 0 0 9.017 9.43c-.023.212-.002.425.028.636l.506 3.541a4.5 4.5 0 0 1-.43 2.65L9 16.5l1.539-.513a2.25 2.25 0 0 1 1.422 0l.655.218a2.25 2.25 0 0 0 1.718-.122L15 15.75M8.25 12H12m9 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Payments
          </Link>
          </>
          )}
        {session?.user?.role === 'superAdmin' && (
          <Link href={'/create-admin'} className={pathname.includes('/create-admin') ? activeLink : inactiveLink}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={pathname.includes('/create-admin') ? activeIcon : inactiveIcon}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
            Add Admin
          </Link>
        )}
        <button onClick={logout} className={inactiveLink}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Logout
        </button>
      </nav>
      <footer className="mt-auto pt-4 border-t border-gray-300 dark:border-gray-700">
        <div className="flex justify-center">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md border dark:border-white border-black sm:px-6 sm:py-3 text-lg sm:text-xl flex items-center justify-center"
          >
            {theme === 'light' ? (
              <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={activeIcon + ' text-yellow-400'}
            >
              <path
                fillRule="evenodd"
                d="M12 2.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75zm0 16.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75zM4.81 4.81a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 0 1-1.06 1.06L4.81 5.87a.75.75 0 0 1 0-1.06zm12.32 12.32a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 0 1-1.06 1.06l-1.06-1.06a.75.75 0 0 1 0-1.06zM2.25 12a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1-.75-.75zm16.5 0a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75zM6.5 12a5.5 5.5 0 1 1 11 0 5.5 5.5 0 0 1-11 0z"
                clipRule="evenodd"
              />
            </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className={inactiveIcon}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2.25m6.364.386-1.591 1.591M21 
                        12h-2.25m-.386 6.364-1.591-1.591M12 
                        18.75V21m-4.773-4.227-1.591 1.591M5.25 
                        12H3m4.227-4.773L5.636 5.636M15.75 
                        12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                />
              </svg>
            )}
          </button>
        </div>
      </footer>

    </aside>
  );
}
