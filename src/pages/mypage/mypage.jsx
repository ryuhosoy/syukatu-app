import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../state/AuthContext";
import axios from "axios";
import "./mypage.css";
import { useNavigate } from "react-router-dom";
import { 
  Edit, 
  Save, 
  Cancel, 
  Person, 
  Email, 
  School, 
  Work, 
  LocationOn,
  Cake 
} from "@mui/icons-material";

function Mypage() {
  const { user } = useContext(AuthContext);
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    university: "",
    graduationYear: "",
    location: "",
    birthday: "",
    jobPreference: "",
  });
  const [editedData, setEditedData] = useState({
    username: "",
    email: "",
    university: "",
    graduationYear: "",
    location: "",
    birthday: "",
    jobPreference: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`https://syukatu-app-backend.vercel.app/api/users/${user._id}`);
        setUserData({
          username: res.data.username,
          email: res.data.email,
          university: res.data.university,
          graduationYear: res.data.graduationYear,
          location: res.data.location,
          birthday: res.data.birthday,
          jobPreference: res.data.jobPreference,
        });
        setEditedData({
          username: res.data.username,
          email: res.data.email,
          university: res.data.university,
          graduationYear: res.data.graduationYear,
          location: res.data.location,
          birthday: res.data.birthday,
          jobPreference: res.data.jobPreference,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserData();
  }, [user._id]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditedData({
      username: userData.username,
      email: userData.email,
      university: userData.university,
      graduationYear: userData.graduationYear,
      location: userData.location,
      birthday: userData.birthday,
      jobPreference: userData.jobPreference,
    });
  };

  const handleSave = async () => {
    try {
      await axios.put(`https://syukatu-app-backend.vercel.app/api/users/${user._id}`, {
        userId: user._id,
        username: editedData.username,
        email: editedData.email,
        university: editedData.university,
        graduationYear: editedData.graduationYear,
        location: editedData.location,
        birthday: editedData.birthday,
        jobPreference: editedData.jobPreference,
      });
      setUserData(editedData);
      setEditMode(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setEditedData({
      ...editedData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="mypage-container">
      <div className="mypage-header">
        <div className="header-info">
          <h1 className="mypage-title">マイページ</h1>
          <div className="user-status">
            <span className="status-item">
              <School />
              {userData.university || "未設定"}
            </span>
            <span className="status-item">
              <LocationOn />
              {userData.location || "未設定"}
            </span>
          </div>
        </div>
      </div>

      <div className="mypage-content">
        <div className="profile-section">
          <div className="section-header">
            <h2 className="section-title">
              <Person />
              プロフィール情報
            </h2>
            {!editMode ? (
              <button className="edit-button" onClick={handleEdit}>
                <Edit />
                <span>編集</span>
              </button>
            ) : (
              <div className="edit-actions">
                <button className="save-button" onClick={handleSave}>
                  <Save />
                  <span>保存</span>
                </button>
                <button className="cancel-button" onClick={handleCancel}>
                  <Cancel />
                  <span>キャンセル</span>
                </button>
              </div>
            )}
          </div>

          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">
                <Person /> ユーザー名
              </span>
              {editMode ? (
                <input
                  type="text"
                  name="username"
                  value={editedData.username}
                  onChange={handleChange}
                  className="edit-input"
                />
              ) : (
                <span className="info-value">{userData.username}</span>
              )}
            </div>
            <div className="info-row">
              <span className="info-label">
                <Email /> メールアドレス
              </span>
              {editMode ? (
                <input
                  type="email"
                  name="email"
                  value={editedData.email}
                  onChange={handleChange}
                  className="edit-input"
                />
              ) : (
                <span className="info-value">{userData.email}</span>
              )}
            </div>
            <div className="info-row">
              <span className="info-label">
                <School /> 大学
              </span>
              {editMode ? (
                <input
                  type="text"
                  name="university"
                  value={editedData.university}
                  onChange={handleChange}
                  className="edit-input"
                />
              ) : (
                <span className="info-value">{userData.university || "未設定"}</span>
              )}
            </div>
            <div className="info-row">
              <span className="info-label">
                <School /> 卒業年度
              </span>
              {editMode ? (
                <input
                  type="text"
                  name="graduationYear"
                  value={editedData.graduationYear}
                  onChange={handleChange}
                  className="edit-input"
                />
              ) : (
                <span className="info-value">{userData.graduationYear || "未設定"}</span>
              )}
            </div>
            <div className="info-row">
              <span className="info-label">
                <LocationOn /> 希望勤務地
              </span>
              {editMode ? (
                <input
                  type="text"
                  name="location"
                  value={editedData.location}
                  onChange={handleChange}
                  className="edit-input"
                />
              ) : (
                <span className="info-value">{userData.location || "未設定"}</span>
              )}
            </div>
            <div className="info-row">
              <span className="info-label">
                <Work /> 希望職種
              </span>
              {editMode ? (
                <input
                  type="text"
                  name="jobPreference"
                  value={editedData.jobPreference}
                  onChange={handleChange}
                  className="edit-input"
                />
              ) : (
                <span className="info-value">{userData.jobPreference || "未設定"}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Mypage;