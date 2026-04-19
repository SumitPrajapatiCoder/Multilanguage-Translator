import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/header.css";
import api from "../api";
import { FaBars, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import defaultAvatar from "../assets/default-avatar.png";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const Header = () => {
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.post(
                    `/api/v1/user/get_User_data`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                setUser(res.data.data);
            } catch (err) {
                console.error("Error fetching user:", err.message);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleLogout = async () => {
        const result = await MySwal.fire({
            title: "Are you sure?",
            text: "Do you really want to log out?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, log out!",
        });

        if (!result.isConfirmed) return;

        localStorage.clear();
        toast.success("Logout Successful!");
        MySwal.fire("Logged Out!", "You have been logged out successfully.", "success");
        navigate("/");
    };

    const handleLinkClick = () => {
        setShowDropdown(false);
    };

    const isActive = (path) => location.pathname === path;

    const MenuLinks = () => (
        <>
            {user?.isAdmin && (
                <Link
                    to="/admin/users"
                    onClick={handleLinkClick}
                    className={isActive("/admin/users") ? "active-link" : ""}
                >
                    Admin Panel
                </Link>
            )}
            
            <Link
                to="/home"
                onClick={handleLinkClick}
                className={isActive("/home") ? "active-link" : ""}
            >
                Home
            </Link>

            <Link
                to="/profile"
                onClick={handleLinkClick}
                className={isActive("/profile") ? "active-link" : ""}
            >
                Profile
            </Link>
            
            <Link
                to="/translate"
                onClick={handleLinkClick}
                className={isActive("/translate") ? "active-link" : ""}
            >
                Learn & Translate
            </Link>

            <Link
                to="/history"
                onClick={handleLinkClick}
                className={isActive("/history") ? "active-link" : ""}
            >
                History
            </Link>

            <Link
                to="/create-meeting"
                onClick={handleLinkClick}
                className={isActive("/create-meeting") ? "active-link" : ""}
            >
                Create Meetings
            </Link>

            <Link
                to="/join"
                onClick={handleLinkClick}
                className={isActive("/join") ? "active-link" : ""}
            >
                Join Meetings
            </Link>

           
          
            {user && (
                <button
                    className="logout-button"
                    onClick={() => {
                        handleLogout();
                        handleLinkClick();
                    }}
                >
                    Logout
                </button>
            )}
        </>
    );

    return (
        <header className="navbar">
            <div className="left">
                {!isMobile && (
                    <Link to="/home" className="brand-link">
                        <span className="brand-text">Multi-Language</span>
                    </Link>
                )}
                {isMobile && (
                    <div
                        className="dropdown-icon"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        {showDropdown ? <FaTimes /> : <FaBars />}
                    </div>
                )}
            </div>

            <div className="center">
                {isMobile && (
                    <Link to="/home" className="brand-link">
                        <span className="brand-text">Multi-Languague</span>
                    </Link>
                )}
                {!isMobile && <nav className="menu">{MenuLinks()}</nav>}
            </div>

            <div className="right">
                {user && (
                    <>
                        <img
                            src={user.profileImage || defaultAvatar}
                            alt="Profile"
                            className="profile-img-small"
                        />
                        
                        <Link to="/home" className="brand-link">
                            <span className="username">{user.name}</span>
                        </Link>
                    </>
                )}
            </div>

            {isMobile && showDropdown && (
                <nav className="menu mobile-menu">{MenuLinks()}</nav>
            )}
        </header>
    );
};

export default Header;
