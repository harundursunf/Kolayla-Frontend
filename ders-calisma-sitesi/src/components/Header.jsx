import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";

const Header = () => {
    const [isMenu1Open, setIsMenu1Open] = useState(false);
    const [isMenu2Open, setIsMenu2Open] = useState(false);
    const [isSubMenu1Open, setIsSubMenu1Open] = useState(false);
    const [isSubMenu2Open, setIsSubMenu2Open] = useState(false);
    const [isMenu3Open, setIsMenu3Open] = useState(false);

    const menu1Ref = useRef(null);
    const menu2Ref = useRef(null);
    const menu3Ref = useRef(null);

    const [user, setUser] = useState(null);
    const [isAuth, setIsAuth] = useState(false);
    const navigate = useNavigate();

    const handleLogOut = () => {
        localStorage.removeItem("authToken");
        setUser(null);
        setIsAuth(false);
        navigate("/");
    };

    const token = localStorage.getItem("authToken");

    const getUserIdFromToken = (token) => {
        if (!token) return null;
        try {
            const payload = atob(token.split(".")[1]);
            const decoded = JSON.parse(payload);
            return decoded.userId;
        } catch (error) {
            console.error("Token decode edilemedi:", error);
            return null;
        }
    };

    const userId = getUserIdFromToken(token);

    useEffect(() => {
        const getUser = async () => {
            if (!userId || isAuth) return;

            try {
                const res = await fetch(`http://localhost:5000/api/users/getUserInfo/${userId}`);
                if (!res.ok) {
                    throw new Error(`Veriler alınamadı: ${res.statusText}`);
                }
                const data = await res.json();
                setUser(data);
                setIsAuth(true);
            } catch (error) {
                console.error("Kullanıcı bilgileri alınamadı:", error);
                setIsAuth(false);
                 // Consider logging out if user info fails?
                 // handleLogOut();
            }
        };

        if (userId && !user) {
          getUser();
        } else if (!userId) {
          setIsAuth(false);
          setUser(null);
        }
    }, [userId, isAuth]); // Keep isAuth dependency

    const handleClickOutside = (event) => {
        if (menu1Ref.current && !menu1Ref.current.contains(event.target)) {
            setIsMenu1Open(false);
        }
        if (menu2Ref.current && !menu2Ref.current.contains(event.target)) {
            setIsMenu2Open(false);
            setIsSubMenu1Open(false);
            setIsSubMenu2Open(false);
        }
        if (menu3Ref.current && !menu3Ref.current.contains(event.target)) {
            setIsMenu3Open(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // --- Refined Style Definitions ---
    const baseMenuButtonStyle = "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500";
    const inactiveMenuButtonStyle = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
    const activeMenuButtonStyle = "bg-gray-100 text-indigo-600"; // More distinct active style

    const menuItemStyle = "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150 ease-in-out whitespace-nowrap";
    const dropdownContainerStyle = "absolute right-0 mt-2 w-52 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 py-1";

    const baseAuthButtonStyle = "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm";
    const loginButtonStyle = `${baseAuthButtonStyle} text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-indigo-500`;
    const signupButtonStyle = `${baseAuthButtonStyle} text-white bg-red-600 hover:bg-red-700 focus:ring-red-500`;
    const logoutButtonStyle = `${baseAuthButtonStyle} text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-400`; // Adjusted logout color

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm"> {/* Softer shadow */}
            <div className="flex items-center justify-between px-6 lg:px-16 h-20 max-w-screen-xl mx-auto"> {/* Slightly reduced height */}

                <div className="flex items-center gap-6 lg:gap-8"> {/* Adjusted gap */}
                    <Link to="/" className="flex-shrink-0">
                        <img src="/logo2.jpg" alt="Site Logosu" className="h-20 w-auto" /> {/* Slightly smaller logo */}
                    </Link>

                    <nav className="hidden md:flex items-center gap-4 lg:gap-6"> {/* Adjusted gap */}

                        <div ref={menu1Ref} className="relative">
                            <button
                                onClick={() => {
                                    setIsMenu1Open((prev) => !prev);
                                    setIsMenu2Open(false); setIsMenu3Open(false); setIsSubMenu1Open(false); setIsSubMenu2Open(false);
                                }}
                                className={`${baseMenuButtonStyle} ${isMenu1Open ? activeMenuButtonStyle : inactiveMenuButtonStyle}`}
                            >
                                GÜNLÜK <FaChevronDown size={14} className={`transition-transform duration-200 ${isMenu1Open ? 'rotate-180' : ''}`} />
                            </button>
                            {isMenu1Open && (
                                <div className={dropdownContainerStyle}>
                                    <ul>
                                        
                                        <li><Link to="/GunlukSoz" className={menuItemStyle} onClick={() => setIsMenu1Open(false)}>Günlük Sözler</Link></li>
                                        <li><Link to="/personal" className={menuItemStyle} onClick={() => setIsMenu1Open(false)}>Günlük Hedefler</Link></li>
                                        <li><Link to="/Bilgiler" className={menuItemStyle} onClick={() => setIsMenu1Open(false)}>Günlük Bilgiler</Link></li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div ref={menu2Ref} className="relative">
                            <button
                                onClick={() => {
                                    setIsMenu2Open((prev) => !prev);
                                    setIsMenu1Open(false); setIsMenu3Open(false);
                                }}
                                className={`${baseMenuButtonStyle} ${isMenu2Open ? activeMenuButtonStyle : inactiveMenuButtonStyle}`}
                            >
                                AYT/TYT <FaChevronDown size={14} className={`transition-transform duration-200 ${isMenu2Open ? 'rotate-180' : ''}`} />
                            </button>
                            {isMenu2Open && (
                                <div className={dropdownContainerStyle}>
                                    <ul>
                                        <li>
                                            <button onClick={() => setIsSubMenu1Open(!isSubMenu1Open)} className={`${menuItemStyle} flex justify-between items-center w-full`}>
                                                AYT <FaChevronDown size={12} className={`transition-transform duration-200 ${isSubMenu1Open ? 'rotate-180' : ''}`} />
                                            </button>
                                            {isSubMenu1Open && (
                                                <ul className="pl-4 border-l border-gray-200 ml-2 my-1"> {/* Added margin */}
                                                    <li><Link to="/ayt" className={menuItemStyle} onClick={() => {setIsMenu2Open(false); setIsSubMenu1Open(false);}}>AYT Konuları</Link></li>
                                                    <li><Link to="/aytMat" className={menuItemStyle} onClick={() => {setIsMenu2Open(false); setIsSubMenu1Open(false);}}>AYT Matematik</Link></li>
                                                    <li><Link to="/aytTur" className={menuItemStyle} onClick={() => {setIsMenu2Open(false); setIsSubMenu1Open(false);}}>AYT Türkçe</Link></li>
                                                </ul>
                                            )}
                                        </li>
                                        <li>
                                            <button onClick={() => setIsSubMenu2Open(!isSubMenu2Open)} className={`${menuItemStyle} flex justify-between items-center w-full`}>
                                                TYT <FaChevronDown size={12} className={`transition-transform duration-200 ${isSubMenu2Open ? 'rotate-180' : ''}`} />
                                            </button>
                                            {isSubMenu2Open && (
                                                <ul className="pl-4 border-l border-gray-200 ml-2 my-1"> {/* Added margin */}
                                                    <li><Link to="/tyt" className={menuItemStyle} onClick={() => {setIsMenu2Open(false); setIsSubMenu2Open(false);}}>TYT Konuları</Link></li>
                                                    <li><Link to="/tytMat" className={menuItemStyle} onClick={() => {setIsMenu2Open(false); setIsSubMenu2Open(false);}}>TYT Matematik</Link></li>
                                                    <li><Link to="/tytTurkce" className={menuItemStyle} onClick={() => {setIsMenu2Open(false); setIsSubMenu2Open(false);}}>TYT Türkçe</Link></li>
                                                </ul>
                                            )}
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div ref={menu3Ref} className="relative">
                            <button
                                onClick={() => {
                                    setIsMenu3Open((prev) => !prev);
                                    setIsMenu1Open(false); setIsMenu2Open(false); setIsSubMenu1Open(false); setIsSubMenu2Open(false);
                                }}
                                className={`${baseMenuButtonStyle} ${isMenu3Open ? activeMenuButtonStyle : inactiveMenuButtonStyle}`}
                            >
                                DERS İŞLEMLERİ <FaChevronDown size={14} className={`transition-transform duration-200 ${isMenu3Open ? 'rotate-180' : ''}`} />
                            </button>
                            {isMenu3Open && (
                                <div className={dropdownContainerStyle}>
                                    <ul>
                                    <li><Link to="/pomodoro" className={menuItemStyle} onClick={() => setIsMenu1Open(false)}>Pomodoro</Link></li>
                                        <li><Link to="/hayallerim/notlarım" className={menuItemStyle} onClick={() => setIsMenu3Open(false)}>Notlarım</Link></li>
                                        <li><Link to="/hayallerim/netlerim" className={menuItemStyle} onClick={() => setIsMenu3Open(false)}>Netlerim</Link></li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>

                <div className="flex items-center gap-3"> {/* Reduced gap */}
                    {isAuth && user ? (
                        <>
                            <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                {user.username}
                            </span>
                            <button
                                onClick={handleLogOut}
                                className={logoutButtonStyle}
                            >
                                Çıkış Yap
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className={loginButtonStyle}
                            >
                                Giriş Yap
                            </Link>
                            <Link
                                to="/signup"
                                className={signupButtonStyle}
                            >
                                Kayıt Ol
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;