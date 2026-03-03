// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "../styles/profile.css";
// import { FaPen, FaCamera, FaEye, FaEyeSlash } from "react-icons/fa";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import defaultAvatar from "../assets/default-avatar.png";
// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";

// const MySwal = withReactContent(Swal);

// const Profile = () => {
//     const [user, setUser] = useState(null);
//     const [editMode, setEditMode] = useState(false);
//     const [showPasswordFields, setShowPasswordFields] = useState(false);
//     const [verifiedOldPassword, setVerifiedOldPassword] = useState(false);

//     const [showOldPass, setShowOldPass] = useState(false);
//     const [showNewPass, setShowNewPass] = useState(false);
//     const [showConfirmPass, setShowConfirmPass] = useState(false);

//     const [formData, setFormData] = useState({
//         name: "",
//         email: "",
//         oldPassword: "",
//         newPassword: "",
//         confirmPassword: "",
//     });

//     const [selectedFile, setSelectedFile] = useState(null);
//     const [previewImage, setPreviewImage] = useState(null);

//     useEffect(() => {
//         const fetchUser = async () => {
//             try {
//                 const res = await axios.post(
//                     "/api/v1/user/get_User_data",
//                     {},
//                     { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
//                 );
//                 setUser(res.data.data);
//                 setFormData((prev) => ({
//                     ...prev,
//                     name: res.data.data.name,
//                     email: res.data.data.email,
//                 }));
//             } catch {
//                 toast.error("Failed to load profile");
//             }
//         };
//         fetchUser();
//     }, []);

//     const handleVerifyOldPassword = async () => {
//         if (!formData.oldPassword) return toast.error("Enter current password");

//         try {
//             const res = await axios.post(
//                 "/api/v1/user/verify-password",
//                 { oldPassword: formData.oldPassword },
//                 { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
//             );
//             if (res.data.success) {
//                 setVerifiedOldPassword(true);
//                 toast.success("Password verified");
//             }
//         } catch (err) {
//             toast.error(err.response?.data?.message || "Wrong password");
//         }
//     };

//     const handleUpdate = async () => {
//         if (
//             verifiedOldPassword &&
//             formData.newPassword !== formData.confirmPassword
//         ) {
//             return toast.error("Passwords do not match");
//         }

//         try {
//             const payload = {
//                 name: formData.name,
//                 email: formData.email,
//                 ...(verifiedOldPassword && formData.newPassword
//                     ? { newPassword: formData.newPassword }
//                     : {}),
//             };

//             const res = await axios.put(
//                 "/api/v1/user/update_profile",
//                 payload,
//                 { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
//             );

//             setUser(res.data.data);
//             setEditMode(false);
//             setShowPasswordFields(false);
//             setVerifiedOldPassword(false);
//             setFormData((prev) => ({
//                 ...prev,
//                 oldPassword: "",
//                 newPassword: "",
//                 confirmPassword: "",
//             }));
//             toast.success("Profile updated");
//         } catch (err) {
//             toast.error(err.response?.data?.message || "Update failed");
//         }
//     };

//     const handleFileChange = (e) => {
//         const file = e.target.files[0];
//         if (!file) return;
//         setSelectedFile(file);
//         setPreviewImage(URL.createObjectURL(file));
//     };

//     const handleImageUpload = async () => {
//         if (!selectedFile) return;

//         const imgData = new FormData();
//         imgData.append("image", selectedFile);

//         try {
//             const res = await axios.put(
//                 "/api/v1/user/upload_profile_image",
//                 imgData,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${localStorage.getItem("token")}`,
//                         "Content-Type": "multipart/form-data",
//                     },
//                 }
//             );
//             setUser(res.data.data);
//             setPreviewImage(null);
//             setSelectedFile(null);
//             toast.success("Profile image updated");
//         } catch {
//             toast.error("Image upload failed");
//         }
//     };

//     const handleDeleteImage = async () => {
//         const result = await MySwal.fire({
//             title: "Delete profile image?",
//             icon: "warning",
//             showCancelButton: true,
//             confirmButtonColor: "#d33",
//         });

//         if (!result.isConfirmed) return;

//         try {
//             const res = await axios.delete("/api/v1/user/delete_profile_image", {
//                 headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//             });
//             setUser(res.data.data);
//             toast.success("Profile image deleted");
//         } catch {
//             toast.error("Failed to delete image");
//         }
//     };

//     return (
//         <div className="profile-page">
//             <div className="profile-main">
//                 <div className="profile-header">
//                     <div className="avatar-wrapper">
//                         <img
//                             src={user?.profileImage || defaultAvatar}
//                             alt="Profile"
//                             className="profile-img"
//                         />
//                         <label htmlFor="file-upload" className="camera-icon">
//                             <FaCamera />
//                         </label>
//                         <input
//                             id="file-upload"
//                             type="file"
//                             accept="image/*"
//                             onChange={handleFileChange}
//                             hidden
//                         />
//                     </div>

//                     <h2>{user?.name}</h2>
//                     <p className="user-email">{user?.email}</p>
//                 </div>

//                 {previewImage && (
//                     <div className="preview-section">
//                         <img src={previewImage} alt="Preview" className="preview-img" />
//                         <button className="save-btn" onClick={handleImageUpload}>
//                             Upload
//                         </button>
//                     </div>
//                 )}

//                 {!editMode ? (
//                     <>
//                         <p><strong>User ID:</strong> {user?._id}</p>
//                         <p>
//                             <strong>Joined:</strong>{" "}
//                             {new Date(user?.createdAt).toLocaleDateString()}
//                         </p>
//                         <button
//                             className="edit-profile-btn"
//                             onClick={() => setEditMode(true)}
//                         >
//                             <FaPen /> Edit Profile
//                         </button>
//                     </>
//                 ) : (
//                     <>
//                         <input
//                             className="profile-input"
//                             value={formData.name}
//                             onChange={(e) =>
//                                 setFormData({ ...formData, name: e.target.value })
//                             }
//                         />
//                         <input
//                             className="profile-input"
//                             value={formData.email}
//                             onChange={(e) =>
//                                 setFormData({ ...formData, email: e.target.value })
//                             }
//                         />

//                         <button
//                             className="toggle-password-btn"
//                             onClick={() => setShowPasswordFields(!showPasswordFields)}
//                         >
//                             Change Password
//                         </button>

//                         {showPasswordFields && (
//                             <>
//                                 {!verifiedOldPassword ? (
//                                     <div className="password-input-wrapper">
//                                         <input
//                                             type={showOldPass ? "text" : "password"}
//                                             className="profile-input"
//                                             placeholder="Current Password"
//                                             value={formData.oldPassword}
//                                             onChange={(e) =>
//                                                 setFormData({
//                                                     ...formData,
//                                                     oldPassword: e.target.value,
//                                                 })
//                                             }
//                                         />
//                                         <span
//                                             className="show-hide-icon"
//                                             onClick={() => setShowOldPass(!showOldPass)}
//                                         >
//                                             {showOldPass ? <FaEyeSlash /> : <FaEye />}
//                                         </span>
//                                         <button onClick={handleVerifyOldPassword}>Verify</button>
//                                     </div>
//                                 ) : (
//                                     <>
//                                         <div className="password-input-wrapper">
//                                             <input
//                                                 type={showNewPass ? "text" : "password"}
//                                                 className="profile-input"
//                                                 placeholder="New Password"
//                                                 value={formData.newPassword}
//                                                 onChange={(e) =>
//                                                     setFormData({
//                                                         ...formData,
//                                                         newPassword: e.target.value,
//                                                     })
//                                                 }
//                                             />
//                                             <span
//                                                 className="show-hide-icon"
//                                                 onClick={() => setShowNewPass(!showNewPass)}
//                                             >
//                                                 {showNewPass ? <FaEyeSlash /> : <FaEye />}
//                                             </span>
//                                         </div>

//                                         <div className="password-input-wrapper">
//                                             <input
//                                                 type={showConfirmPass ? "text" : "password"}
//                                                 className="profile-input"
//                                                 placeholder="Confirm Password"
//                                                 value={formData.confirmPassword}
//                                                 onChange={(e) =>
//                                                     setFormData({
//                                                         ...formData,
//                                                         confirmPassword: e.target.value,
//                                                     })
//                                                 }
//                                             />
//                                             <span
//                                                 className="show-hide-icon"
//                                                 onClick={() =>
//                                                     setShowConfirmPass(!showConfirmPass)
//                                                 }
//                                             >
//                                                 {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
//                                             </span>
//                                         </div>
//                                     </>
//                                 )}
//                             </>
//                         )}

//                         <button className="save-btn" onClick={handleUpdate}>
//                             Save
//                         </button>
//                         <button
//                             className="cancel-btn"
//                             onClick={() => setEditMode(false)}
//                         >
//                             Cancel
//                         </button>

//                         {user?.profileImage && (
//                             <button className="delete-btn" onClick={handleDeleteImage}>
//                                 Delete Image
//                             </button>
//                         )}
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Profile;
























import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/profile.css";
import { FaPen, FaCamera, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import defaultAvatar from "../assets/default-avatar.png";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const Profile = () => {
    const [user, setUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [verifiedOldPassword, setVerifiedOldPassword] = useState(false);

    const [showOldPass, setShowOldPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.post(
                    "/api/v1/user/get_User_data",
                    {},
                    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
                );
                setUser(res.data.data);
                setFormData((prev) => ({
                    ...prev,
                    name: res.data.data.name,
                    email: res.data.data.email,
                }));
            } catch {
                toast.error("Failed to load profile");
            }
        };
        fetchUser();
    }, []);

    const handleVerifyOldPassword = async () => {
        if (!formData.oldPassword) return toast.error("Enter current password");

        try {
            const res = await axios.post(
                "/api/v1/user/verify-password",
                { oldPassword: formData.oldPassword },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            if (res.data.success) {
                setVerifiedOldPassword(true);
                toast.success("Password verified");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Wrong password");
        }
    };

    const handleUpdate = async () => {
        if (
            verifiedOldPassword &&
            formData.newPassword !== formData.confirmPassword
        ) {
            return toast.error("Passwords do not match");
        }

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                ...(verifiedOldPassword && formData.newPassword
                    ? { newPassword: formData.newPassword }
                    : {}),
            };

            const res = await axios.put(
                "/api/v1/user/update_profile",
                payload,
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

            setUser(res.data.data);
            setEditMode(false);
            setShowPasswordFields(false);
            setVerifiedOldPassword(false);
            setFormData((prev) => ({
                ...prev,
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            }));
            toast.success("Profile updated");
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed");
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFile(file);
        setPreviewImage(URL.createObjectURL(file));
    };

    const handleImageUpload = async () => {
        if (!selectedFile) return;

        const imgData = new FormData();
        imgData.append("image", selectedFile);

        try {
            const res = await axios.put(
                "/api/v1/user/upload_profile_image",
                imgData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            setUser(res.data.data);
            setPreviewImage(null);
            setSelectedFile(null);
            toast.success("Profile image updated");
        } catch {
            toast.error("Image upload failed");
        }
    };

    const handleCancelUpload = () => {
        setPreviewImage(null);
        setSelectedFile(null);
    };

    const handleDeleteImage = async () => {
        const result = await MySwal.fire({
            title: "Delete profile image?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
        });

        if (!result.isConfirmed) return;

        try {
            const res = await axios.delete("/api/v1/user/delete_profile_image", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setUser(res.data.data);
            toast.success("Profile image deleted");
        } catch {
            toast.error("Failed to delete image");
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-main">
                
                <div className="profile-header">
                    <div className="avatar-wrapper">
                        <img
                            src={user?.profileImage || defaultAvatar}
                            alt="Profile"
                            className="profile-img"
                        />
                        <label htmlFor="file-upload" className="camera-icon">
                            <FaCamera />
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            hidden
                        />
                    </div>
                    <h2>{user?.name}</h2>
                    <p className="user-email">{user?.email}</p>
                </div>

                {previewImage && (
                    <div className="preview-section">
                        <img src={previewImage} alt="Preview" className="preview-img" />
                        <div className="preview-buttons">
                            <button className="save-btn" onClick={handleImageUpload}>
                                Upload
                            </button>
                            <button className="cancel-btn" onClick={handleCancelUpload}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <div className="profile-info">
                    {!editMode ? (
                        <>
                            <p><strong>User ID:</strong> {user?._id}</p>
                            <p><strong>Joined:</strong> {new Date(user?.createdAt).toLocaleDateString()}</p>

                            <button className="edit-profile-btn" onClick={() => setEditMode(true)}>
                                <FaPen /> Edit Profile
                            </button>
                        </>
                    ) : (
                        <div className="edit-section">
                            <input
                                className="profile-input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Name"
                            />
                            <input
                                className="profile-input"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="Email"
                            />

                            <button
                                className="toggle-password-btn"
                                onClick={() => setShowPasswordFields(!showPasswordFields)}
                            >
                                {showPasswordFields ? "Cancel Password Change" : "Change Password"}
                            </button>

                            {showPasswordFields && (
                                <>
                                    {!verifiedOldPassword ? (
                                        <>
                                            <div className="password-input-wrapper">
                                                <input
                                                    type={showOldPass ? "text" : "password"}
                                                    className="profile-input"
                                                    placeholder="Current Password"
                                                    value={formData.oldPassword}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, oldPassword: e.target.value })
                                                    }
                                                />
                                                <span
                                                    className="show-hide-icon"
                                                    onClick={() => setShowOldPass(!showOldPass)}
                                                >
                                                    {showOldPass ? <FaEyeSlash /> : <FaEye />}
                                                </span>
                                            </div>
                                            <button className="verify-btn" onClick={handleVerifyOldPassword}>
                                                Verify Password
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="password-input-wrapper">
                                                <input
                                                    type={showNewPass ? "text" : "password"}
                                                    className="profile-input"
                                                    placeholder="New Password"
                                                    value={formData.newPassword}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, newPassword: e.target.value })
                                                    }
                                                />
                                                <span
                                                    className="show-hide-icon"
                                                    onClick={() => setShowNewPass(!showNewPass)}
                                                >
                                                    {showNewPass ? <FaEyeSlash /> : <FaEye />}
                                                </span>
                                            </div>

                                            <div className="password-input-wrapper">
                                                <input
                                                    type={showConfirmPass ? "text" : "password"}
                                                    className="profile-input"
                                                    placeholder="Confirm Password"
                                                    value={formData.confirmPassword}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, confirmPassword: e.target.value })
                                                    }
                                                />
                                                <span
                                                    className="show-hide-icon"
                                                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                                                >
                                                    {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            <div className="edit-buttons">
                                <button className="save-btn" onClick={handleUpdate}>Save</button>
                                <button className="cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>
                                {user?.profileImage && (
                                    <button className="delete-btn" onClick={handleDeleteImage}>
                                        Delete Image
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
