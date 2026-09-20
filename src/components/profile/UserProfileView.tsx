import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Edit3,
  Key,
  Globe,
  Bell,
  Lock,
  LogOut,
  Users,
  QrCode,
  Mail,
  Phone,
  Calendar,
  Heart,
  MapPin,
  CheckCircle2,
  X,
  ChevronRight,
  ShieldAlert,
  Sliders,
  Check
} from 'lucide-react';
import { AbhaProfile } from '../../types';
import { AbhaCard } from './AbhaCard';

interface UserProfileViewProps {
  profile: AbhaProfile;
  onLogout: () => void;
  onUpdateProfile?: (updatedProfile: AbhaProfile) => void;
}

// Inline Social Icon Components for reliable rendering
const GithubIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GenericDeveloperAvatar: React.FC<{ index: number }> = ({ index }) => {
  const gradientAccents = [
    'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    'linear-gradient(135deg, #059669 0%, #047857 100%)',
    'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    'linear-gradient(135deg, #db2777 0%, #be185d 100%)',
    'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
  ];

  return (
    <div
      className="dev-generic-avatar-box"
      style={{ background: gradientAccents[index % gradientAccents.length] }}
    >
      <User size={32} className="dev-avatar-icon" />
    </div>
  );
};

interface TeamMember {
  id: string;
  name: string;
  role: string;
  githubUrl: string;
  linkedinUrl: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'dheeraj',
    name: 'DHEERAJ',
    role: 'Full Stack Developer',
    linkedinUrl: 'https://www.linkedin.com/in/dheeraj-7a6661303?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    githubUrl: 'https://github.com/Dheeraj-del-cyber'
  },
  {
    id: 'chaturthi',
    name: 'CHATURTHI H V',
    role: 'Full Stack Developer',
    linkedinUrl: 'https://www.linkedin.com/in/chaturthi-h-v-8527b8355?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    githubUrl: 'https://github.com/ChaturthiHV'
  },
  {
    id: 'pooja',
    name: 'POOJA M',
    role: 'AI/ML Developer',
    linkedinUrl: 'https://www.linkedin.com/in/m-poojamaji/',
    githubUrl: 'https://github.com/Pooja-Maji'
  },
  {
    id: 'dhanush',
    name: 'DHANUSH',
    role: 'UI/UX Designer',
    linkedinUrl: 'https://www.linkedin.com/in/dhanush-574418384?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    githubUrl: 'https://github.com/dhanushpoojary078-svg'
  },
  {
    id: 'madhura',
    name: 'MADHURA NAIK',
    role: 'Backend & Security',
    linkedinUrl: 'https://www.linkedin.com/in/madhura-naik-869388380',
    githubUrl: 'https://github.com/naikmadhura2007-ai'
  },
  {
    id: 'gurudev',
    name: 'GURUDEV KINI',
    role: 'Research & Product',
    linkedinUrl: 'https://www.linkedin.com/in/gurudevkini?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    githubUrl: 'https://github.com/Gurudevkini'
  }
];

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  profile,
  onLogout,
  onUpdateProfile
}) => {
  // Local Profile State (supports Edit Profile)
  const [currentProfile, setCurrentProfile] = useState<AbhaProfile>(profile);
  
  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAbhaCardOpen, setIsAbhaCardOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  // Success Notification Banner state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Edit Profile Form State
  const [editName, setEditName] = useState(currentProfile.fullName);
  const [editEmail, setEditEmail] = useState(currentProfile.email || 'user@sugastha.gov.in');
  const [editMobile, setEditMobile] = useState(currentProfile.mobileNumber);
  const [editEmergencyName, setEditEmergencyName] = useState(currentProfile.emergencyContact.name);
  const [editEmergencyRelation, setEditEmergencyRelation] = useState(currentProfile.emergencyContact.relation);
  const [editEmergencyPhone, setEditEmergencyPhone] = useState(currentProfile.emergencyContact.phone);
  const [editAddressLine, setEditAddressLine] = useState(currentProfile.address.line);
  const [editDistrict, setEditDistrict] = useState(currentProfile.address.district);
  const [editState, setEditState] = useState(currentProfile.address.state);
  const [editPincode, setEditPincode] = useState(currentProfile.address.pincode);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AbhaProfile = {
      ...currentProfile,
      fullName: editName,
      email: editEmail,
      mobileNumber: editMobile,
      emergencyContact: {
        name: editEmergencyName,
        relation: editEmergencyRelation,
        phone: editEmergencyPhone
      },
      address: {
        ...currentProfile.address,
        line: editAddressLine,
        district: editDistrict,
        state: editState,
        pincode: editPincode
      }
    };
    setCurrentProfile(updated);
    if (onUpdateProfile) onUpdateProfile(updated);
    setIsEditModalOpen(false);
    showToast('Profile information updated successfully!');
  };

  // Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) {
      setPasswordError('Please enter your current password');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    setPasswordError('');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsPasswordModalOpen(false);
    showToast('Password changed successfully!');
  };

  // Language Preferences State
  const [selectedLanguage, setSelectedLanguage] = useState('English (en-IN)');
  const languages = [
    { code: 'en', name: 'English (en-IN)' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'mr', name: 'मराठी (Marathi)' }
  ];

  // Notification Preferences State
  const [notifSettings, setNotifSettings] = useState({
    emailAlerts: true,
    smsAlerts: true,
    queueUpdates: true,
    abdmConsentReqs: true
  });

  // Privacy & Security Settings State
  const [privacySettings, setPrivacySettings] = useState({
    twoFactor: true,
    abdmSharing: true,
    biometricLogin: false
  });

  return (
    <div className="user-profile-view animate-fade-in">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="toast-notification">
          <CheckCircle2 size={18} className="toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="profile-hero-card">
        <div className="hero-content-row">
          <div className="avatar-large-wrapper">
            {currentProfile.avatarUrl ? (
              <img src={currentProfile.avatarUrl} alt={currentProfile.fullName} className="avatar-large-img" />
            ) : (
              <div className="avatar-large-fallback">
                {currentProfile.fullName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="verified-seal" title="ABDM Verified Citizen">
              <ShieldCheck size={16} />
            </div>
          </div>

          <div className="hero-text-col">
            <div className="hero-name-badge-row">
              <h2 className="hero-user-name">{currentProfile.fullName}</h2>
              <span className="hero-abha-badge">
                <ShieldCheck size={13} />
                <span>ABDM Connected</span>
              </span>
            </div>
            
            <p className="hero-abha-num">
              ABHA ID: <strong>{currentProfile.abhaNumber}</strong> • {currentProfile.abhaAddress}
            </p>

            <div className="hero-quick-meta">
              <span><Mail size={13} /> {currentProfile.email || 'user@sugastha.gov.in'}</span>
              <span><Phone size={13} /> {currentProfile.mobileNumber}</span>
              <span><MapPin size={13} /> {currentProfile.address.district}, {currentProfile.address.state}</span>
            </div>
          </div>

          <div className="hero-actions-col">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="btn btn-outline btn-edit-profile"
            >
              <Edit3 size={15} />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => setIsAbhaCardOpen(!isAbhaCardOpen)}
              className="btn btn-primary btn-view-card"
            >
              <QrCode size={15} />
              <span>{isAbhaCardOpen ? 'Hide ABHA Card' : 'View ABHA Card'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Digital ABHA Card Section */}
      {isAbhaCardOpen && (
        <div className="abha-card-expand-container animate-fade-in">
          <div className="section-head-mini">
            <h3>Digital Ayushman Bharat Health Card</h3>
            <button onClick={() => setIsAbhaCardOpen(false)} className="btn-close-sm">
              <X size={16} />
            </button>
          </div>
          <AbhaCard profile={currentProfile} />
        </div>
      )}

      {/* Two Column Layout for Profile & Settings */}
      <div className="profile-grid-container">
        
        {/* Left Column: Personal Information */}
        <div className="grid-column">
          <div className="profile-card">
            <div className="card-header-bar">
              <div className="card-title-group">
                <User size={18} className="icon-teal" />
                <h3>Personal Information</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="btn-icon-link"
                title="Edit Personal Information"
              >
                <Edit3 size={15} />
                <span>Edit</span>
              </button>
            </div>

            <div className="info-fields-grid">
              <div className="info-field-item">
                <span className="field-label">Full Name</span>
                <p className="field-value">{currentProfile.fullName}</p>
              </div>

              <div className="info-field-item">
                <span className="field-label">ABHA Number</span>
                <p className="field-value font-mono">{currentProfile.abhaNumber}</p>
              </div>

              <div className="info-field-item">
                <span className="field-label">ABHA Address</span>
                <p className="field-value text-teal">{currentProfile.abhaAddress}</p>
              </div>

              <div className="info-field-item">
                <span className="field-label">Date of Birth</span>
                <p className="field-value">
                  <Calendar size={13} className="inline-icon" />
                  {currentProfile.dateOfBirth}
                </p>
              </div>

              <div className="info-field-item">
                <span className="field-label">Gender</span>
                <p className="field-value">{currentProfile.gender}</p>
              </div>

              <div className="info-field-item">
                <span className="field-label">Blood Group</span>
                <p className="field-value blood-highlight">
                  <Heart size={13} className="text-red inline-icon" />
                  {currentProfile.bloodGroup}
                </p>
              </div>

              <div className="info-field-item">
                <span className="field-label">Email Address</span>
                <p className="field-value">{currentProfile.email || 'user@sugastha.gov.in'}</p>
              </div>

              <div className="info-field-item">
                <span className="field-label">Mobile Number</span>
                <p className="field-value">{currentProfile.mobileNumber}</p>
              </div>

              <div className="info-field-item col-span-2">
                <span className="field-label">Emergency Contact</span>
                <p className="field-value">
                  {currentProfile.emergencyContact.name} ({currentProfile.emergencyContact.relation}) — {currentProfile.emergencyContact.phone}
                </p>
              </div>

              <div className="info-field-item col-span-2">
                <span className="field-label">Residential Address</span>
                <p className="field-value">
                  {currentProfile.address.line}, {currentProfile.address.district},{' '}
                  {currentProfile.address.state} - {currentProfile.address.pincode}
                </p>
              </div>
            </div>
          </div>

          {/* Special Feature Card: Meet the Team */}
          <div className="team-highlight-card">
            <div className="team-card-inner">
              <div className="team-icon-box">
                <Users size={22} className="text-primary" />
              </div>
              <div className="team-text-box">
                <h4>Meet the Developers</h4>
                <p>Discover the engineering & design team behind SUGASTHA patient portal.</p>
              </div>
              <button
                onClick={() => setIsTeamModalOpen(true)}
                className="btn btn-outline btn-team"
              >
                <span>Meet the Team</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Account Management & Settings */}
        <div className="grid-column">
          <div className="profile-card">
            <div className="card-header-bar">
              <div className="card-title-group">
                <Sliders size={18} className="icon-teal" />
                <h3>Account & Settings</h3>
              </div>
            </div>

            <div className="settings-menu-list">
              {/* Change Password Option */}
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="setting-menu-item"
              >
                <div className="setting-item-icon bg-blue-subtle">
                  <Key size={17} className="text-blue" />
                </div>
                <div className="setting-item-text">
                  <span className="setting-title">Change Password</span>
                  <span className="setting-desc">Update your security password</span>
                </div>
                <ChevronRight size={17} className="setting-arrow" />
              </button>

              {/* Language Preferences */}
              <button
                onClick={() => setIsLanguageModalOpen(true)}
                className="setting-menu-item"
              >
                <div className="setting-item-icon bg-emerald-subtle">
                  <Globe size={17} className="text-emerald" />
                </div>
                <div className="setting-item-text">
                  <span className="setting-title">Language & Regional</span>
                  <span className="setting-desc">{selectedLanguage}</span>
                </div>
                <ChevronRight size={17} className="setting-arrow" />
              </button>

              {/* Notification Preferences */}
              <button
                onClick={() => setIsNotifModalOpen(true)}
                className="setting-menu-item"
              >
                <div className="setting-item-icon bg-amber-subtle">
                  <Bell size={17} className="text-amber" />
                </div>
                <div className="setting-item-text">
                  <span className="setting-title">Notification Preferences</span>
                  <span className="setting-desc">SMS, Email, queue updates</span>
                </div>
                <ChevronRight size={17} className="setting-arrow" />
              </button>

              {/* Privacy & Security */}
              <button
                onClick={() => setIsPrivacyModalOpen(true)}
                className="setting-menu-item"
              >
                <div className="setting-item-icon bg-purple-subtle">
                  <Lock size={17} className="text-purple" />
                </div>
                <div className="setting-item-text">
                  <span className="setting-title">Privacy & Security</span>
                  <span className="setting-desc">2-Factor auth, ABDM consent locks</span>
                </div>
                <ChevronRight size={17} className="setting-arrow" />
              </button>
            </div>
          </div>

          {/* Account Logout Card */}
          <div className="logout-action-card">
            <div className="logout-text-col">
              <h4>Account Session</h4>
              <p>Logged in as {currentProfile.abhaNumber}</p>
            </div>
            <button onClick={onLogout} className="btn btn-logout">
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>

      </div>

      {/* MODAL 1: Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-card modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Edit3 size={18} className="icon-teal" />
                <h3>Edit Profile Information</h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="btn-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="modal-form-body">
              <div className="form-group-grid">
                <div className="form-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Emergency Contact Name</label>
                  <input
                    type="text"
                    value={editEmergencyName}
                    onChange={(e) => setEditEmergencyName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Emergency Relation</label>
                  <input
                    type="text"
                    value={editEmergencyRelation}
                    onChange={(e) => setEditEmergencyRelation(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Emergency Phone</label>
                  <input
                    type="tel"
                    value={editEmergencyPhone}
                    onChange={(e) => setEditEmergencyPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field col-span-2">
                  <label>Address Line</label>
                  <input
                    type="text"
                    value={editAddressLine}
                    onChange={(e) => setEditAddressLine(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>District</label>
                  <input
                    type="text"
                    value={editDistrict}
                    onChange={(e) => setEditDistrict(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>State</label>
                  <input
                    type="text"
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Pincode</label>
                  <input
                    type="text"
                    value={editPincode}
                    onChange={(e) => setEditPincode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setIsPasswordModalOpen(false)}>
          <div className="modal-card modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Key size={18} className="icon-teal" />
                <h3>Change Account Password</h3>
              </div>
              <button onClick={() => setIsPasswordModalOpen(false)} className="btn-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="modal-form-body">
              {passwordError && (
                <div className="form-error-alert">
                  <ShieldAlert size={16} />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="form-field">
                <label>Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="form-field">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                />
              </div>

              <div className="form-field">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Language Preferences Modal */}
      {isLanguageModalOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setIsLanguageModalOpen(false)}>
          <div className="modal-card modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Globe size={18} className="icon-teal" />
                <h3>Language Preferences</h3>
              </div>
              <button onClick={() => setIsLanguageModalOpen(false)} className="btn-close">
                <X size={18} />
              </button>
            </div>

            <div className="modal-form-body">
              <div className="language-options-list">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setSelectedLanguage(lang.name);
                      setIsLanguageModalOpen(false);
                      showToast(`Language set to ${lang.name}`);
                    }}
                    className={`language-option-btn ${
                      selectedLanguage === lang.name ? 'active' : ''
                    }`}
                  >
                    <span>{lang.name}</span>
                    {selectedLanguage === lang.name && <Check size={16} className="text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Notification Preferences Modal */}
      {isNotifModalOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setIsNotifModalOpen(false)}>
          <div className="modal-card modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Bell size={18} className="icon-teal" />
                <h3>Notification Preferences</h3>
              </div>
              <button onClick={() => setIsNotifModalOpen(false)} className="btn-close">
                <X size={18} />
              </button>
            </div>

            <div className="modal-form-body">
              <div className="toggle-list">
                <label className="toggle-row">
                  <div className="toggle-text">
                    <span className="toggle-label">SMS Notifications</span>
                    <span className="toggle-sub">Receive queue and booking updates via SMS</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifSettings.smsAlerts}
                    onChange={(e) =>
                      setNotifSettings({ ...notifSettings, smsAlerts: e.target.checked })
                    }
                  />
                </label>

                <label className="toggle-row">
                  <div className="toggle-text">
                    <span className="toggle-label">Email Alerts</span>
                    <span className="toggle-sub">Consultation summaries and lab reports</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifSettings.emailAlerts}
                    onChange={(e) =>
                      setNotifSettings({ ...notifSettings, emailAlerts: e.target.checked })
                    }
                  />
                </label>

                <label className="toggle-row">
                  <div className="toggle-text">
                    <span className="toggle-label">Live Queue Tracking</span>
                    <span className="toggle-sub">Real-time alerts when turn is near</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifSettings.queueUpdates}
                    onChange={(e) =>
                      setNotifSettings({ ...notifSettings, queueUpdates: e.target.checked })
                    }
                  />
                </label>

                <label className="toggle-row">
                  <div className="toggle-text">
                    <span className="toggle-label">ABDM Consent Requests</span>
                    <span className="toggle-sub">Alerts when doctors request record access</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifSettings.abdmConsentReqs}
                    onChange={(e) =>
                      setNotifSettings({ ...notifSettings, abdmConsentReqs: e.target.checked })
                    }
                  />
                </label>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setIsNotifModalOpen(false);
                    showToast('Notification preferences saved');
                  }}
                  className="btn btn-primary w-full"
                >
                  Save Notification Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Privacy & Security Modal */}
      {isPrivacyModalOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setIsPrivacyModalOpen(false)}>
          <div className="modal-card modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Lock size={18} className="icon-teal" />
                <h3>Privacy & Security Settings</h3>
              </div>
              <button onClick={() => setIsPrivacyModalOpen(false)} className="btn-close">
                <X size={18} />
              </button>
            </div>

            <div className="modal-form-body">
              <div className="toggle-list">
                <label className="toggle-row">
                  <div className="toggle-text">
                    <span className="toggle-label">Two-Factor Authentication (OTP)</span>
                    <span className="toggle-sub">Require Aadhaar / Mobile OTP on login</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.twoFactor}
                    onChange={(e) =>
                      setPrivacySettings({ ...privacySettings, twoFactor: e.target.checked })
                    }
                  />
                </label>

                <label className="toggle-row">
                  <div className="toggle-text">
                    <span className="toggle-label">ABDM Network Record Sharing</span>
                    <span className="toggle-sub">Allow registered HIPs to sync records</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.abdmSharing}
                    onChange={(e) =>
                      setPrivacySettings({ ...privacySettings, abdmSharing: e.target.checked })
                    }
                  />
                </label>

                <label className="toggle-row">
                  <div className="toggle-text">
                    <span className="toggle-label">Biometric Quick Unlock</span>
                    <span className="toggle-sub">Use device Fingerprint/Face ID</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.biometricLogin}
                    onChange={(e) =>
                      setPrivacySettings({ ...privacySettings, biometricLogin: e.target.checked })
                    }
                  />
                </label>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setIsPrivacyModalOpen(false);
                    showToast('Privacy & security settings saved');
                  }}
                  className="btn btn-primary w-full"
                >
                  Save Privacy Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Meet the Team Modal */}
      {isTeamModalOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setIsTeamModalOpen(false)}>
          <div className="modal-card modal-lg team-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Users size={20} className="icon-teal" />
                <div>
                  <h3>Meet the Team</h3>
                  <p className="sub-text">The engineering & design team behind SUGASTHA</p>
                </div>
              </div>
              <button onClick={() => setIsTeamModalOpen(false)} className="btn-close" aria-label="Close modal">
                <X size={18} />
              </button>
            </div>

            <div className="modal-form-body">
              <div className="team-cards-grid">
                {TEAM_MEMBERS.map((member, idx) => (
                  <div key={member.id} className="dev-card">
                    <GenericDeveloperAvatar index={idx} />
                    
                    <h4 className="dev-name">{member.name}</h4>
                    <span className="dev-role">{member.role}</span>

                    <div className="dev-social-links">
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dev-social-btn linkedin"
                        title={`${member.name}'s LinkedIn Profile`}
                        aria-label={`${member.name}'s LinkedIn`}
                      >
                        <LinkedinIcon size={16} />
                        <span>LinkedIn</span>
                      </a>

                      <a
                        href={member.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dev-social-btn github"
                        title={`${member.name}'s GitHub Profile`}
                        aria-label={`${member.name}'s GitHub`}
                      >
                        <GithubIcon size={16} />
                        <span>GitHub</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setIsTeamModalOpen(false)}
                className="btn btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styled JSX */}
      <style>{`
        .user-profile-view {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          width: 100%;
          position: relative;
        }

        .toast-notification {
          position: fixed;
          top: 80px;
          right: 20px;
          z-index: 200;
          background: #10B981;
          color: #ffffff;
          padding: 0.75rem 1.25rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.35);
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        /* Hero Header Styling */
        .profile-hero-card {
          background: linear-gradient(135deg, #0b3b78 0%, #0369a1 100%);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          color: #ffffff;
          box-shadow: 0 10px 25px rgba(2, 132, 199, 0.2);
        }
        .hero-content-row {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .avatar-large-wrapper {
          position: relative;
          width: 80px;
          height: 80px;
          flex-shrink: 0;
        }
        .avatar-large-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid rgba(255, 255, 255, 0.4);
        }
        .avatar-large-fallback {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          font-weight: 800;
          color: #ffffff;
          border: 3px solid rgba(255, 255, 255, 0.4);
        }
        .verified-seal {
          position: absolute;
          bottom: 2px;
          right: 2px;
          background: #10B981;
          color: #ffffff;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #0369a1;
        }
        .hero-text-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          min-width: 250px;
        }
        .hero-name-badge-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .hero-user-name {
          font-size: 1.45rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
        }
        .hero-abha-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(16, 185, 129, 0.25);
          border: 1px solid rgba(16, 185, 129, 0.5);
          color: #6EE7B7;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          font-size: 0.72rem;
          font-weight: 700;
        }
        .hero-abha-num {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.85);
          margin: 0;
        }
        .hero-quick-meta {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.75);
          flex-wrap: wrap;
          margin-top: 2px;
        }
        .hero-quick-meta span {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .hero-actions-col {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }
        .btn-edit-profile {
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.3);
        }
        .btn-edit-profile:hover {
          background: rgba(255, 255, 255, 0.25);
          color: #ffffff;
        }
        .btn-view-card {
          background: #ffffff;
          color: #0369a1;
          font-weight: 700;
        }
        .btn-view-card:hover {
          background: #f0f9ff;
          color: #0284c7;
        }

        .abha-card-expand-container {
          background: var(--white);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          box-shadow: var(--shadow-md);
        }
        .section-head-mini {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .section-head-mini h3 {
          font-size: 1rem;
          font-weight: 700;
          color: var(--dark-navy-text);
        }
        .btn-close-sm {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--bg-surface-2);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        /* Grid Layout */
        .profile-grid-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        .grid-column {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        /* Card Styling */
        .profile-card {
          background: var(--white);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);
        }
        .card-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 0.85rem;
          margin-bottom: 1rem;
        }
        .card-title-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .card-title-group h3 {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--dark-navy-text);
        }
        .icon-teal {
          color: var(--brand-primary);
        }
        .btn-icon-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--brand-primary);
          background: var(--pastel-light-blue);
          padding: 4px 10px;
          border-radius: var(--radius-full);
          border: none;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .btn-icon-link:hover {
          background: var(--pastel-sky-blue);
        }

        /* Info Fields Grid */
        .info-fields-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .info-field-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .col-span-2 {
          grid-column: span 2;
        }
        .field-label {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--text-muted);
        }
        .field-value {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--dark-navy-text);
          margin: 0;
        }
        .font-mono {
          font-family: monospace;
          letter-spacing: 0.05em;
        }
        .text-teal {
          color: var(--brand-primary);
        }
        .blood-highlight {
          color: #DC2626;
          font-weight: 700;
        }
        .inline-icon {
          margin-right: 4px;
          vertical-align: middle;
        }
        .text-red {
          color: #DC2626;
        }

        /* Settings Menu List */
        .settings-menu-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .setting-menu-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1rem;
          border-radius: var(--radius-md);
          background: var(--bg-surface-2);
          border: 1px solid var(--border-light);
          text-align: left;
          cursor: pointer;
          transition: all var(--transition-fast);
          width: 100%;
        }
        .setting-menu-item:hover {
          background: var(--pastel-light-blue);
          border-color: var(--pastel-sky-blue);
          transform: translateY(-1px);
        }
        .setting-item-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .bg-blue-subtle { background: #E0F2FE; }
        .text-blue { color: #0284C7; }
        .bg-emerald-subtle { background: #D1FAE5; }
        .text-emerald { color: #059669; }
        .bg-amber-subtle { background: #FEF3C7; }
        .text-amber { color: #D97706; }
        .bg-purple-subtle { background: #F3E8FF; }
        .text-purple { color: #9333EA; }

        .setting-item-text {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .setting-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--dark-navy-text);
        }
        .setting-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .setting-arrow {
          color: var(--text-muted);
          transition: transform var(--transition-fast);
        }
        .setting-menu-item:hover .setting-arrow {
          transform: translateX(3px);
          color: var(--brand-primary);
        }

        /* Meet Team Card */
        .team-highlight-card {
          background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
          border: 1px solid var(--pastel-sky-blue);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
        }
        .team-card-inner {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .team-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--white);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(2, 132, 199, 0.12);
          flex-shrink: 0;
        }
        .team-text-box {
          flex: 1;
        }
        .team-text-box h4 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--dark-navy-text);
          margin: 0 0 2px 0;
        }
        .team-text-box p {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin: 0;
        }
        .btn-team {
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          background: var(--white);
          border-color: var(--pastel-sky-blue);
          color: var(--brand-primary);
          font-weight: 700;
        }
        .btn-team:hover {
          background: var(--brand-primary);
          color: var(--white);
        }

        /* Logout Action Card */
        .logout-action-card {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: var(--radius-lg);
          padding: 1.15rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logout-text-col h4 {
          font-size: 0.9rem;
          font-weight: 700;
          color: #991B1B;
          margin: 0 0 2px 0;
        }
        .logout-text-col p {
          font-size: 0.75rem;
          color: #B91C1C;
          margin: 0;
        }
        .btn-logout {
          background: #DC2626;
          color: var(--white);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
        }
        .btn-logout:hover {
          background: #B91C1C;
        }

        /* Modal Core Styles */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          z-index: 250;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .modal-card {
          background: var(--white);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .modal-sm { max-width: 440px; }
        .modal-md { max-width: 600px; }
        .modal-lg { max-width: 820px; }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border-light);
        }
        .modal-title-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .modal-title-group h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--dark-navy-text);
          margin: 0;
        }
        .sub-text {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin: 0;
        }
        .btn-close {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
        }
        .btn-close:hover {
          background: var(--bg-surface-2);
          color: var(--dark-navy-text);
        }

        .modal-form-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .form-group-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .form-field label {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--dark-navy-text);
        }
        .form-field input {
          padding: 0.6rem 0.85rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          font-size: 0.88rem;
          outline: none;
          transition: border-color var(--transition-fast);
        }
        .form-field input:focus {
          border-color: var(--brand-primary);
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
        }
        .form-error-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #FEF2F2;
          color: #DC2626;
          padding: 0.6rem 0.85rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 600;
        }

        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        /* Language & Preferences Styling */
        .language-options-list {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .language-option-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          background: var(--bg-surface-2);
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--dark-navy-text);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .language-option-btn:hover {
          background: var(--pastel-light-blue);
        }
        .language-option-btn.active {
          background: var(--pastel-light-blue);
          border-color: var(--pastel-sky-blue);
          color: var(--brand-primary);
        }

        /* Toggle Options List */
        .toggle-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 0.85rem;
          background: var(--bg-surface-2);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          cursor: pointer;
        }
        .toggle-text {
          display: flex;
          flex-direction: column;
        }
        .toggle-label {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--dark-navy-text);
        }
        .toggle-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .toggle-row input[type='checkbox'] {
          width: 18px;
          height: 18px;
          accent-color: var(--brand-primary);
          cursor: pointer;
        }

        /* Meet Team Developer Cards & Grid */
        .team-modal-card {
          max-width: 920px;
        }
        .team-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }
        .dev-card {
          background: var(--bg-surface-2);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: 1.5rem 1.15rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: all 0.22s ease;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
        }
        .dev-card:hover {
          background: var(--white);
          border-color: var(--pastel-sky-blue);
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(2, 132, 199, 0.12);
        }
        .dev-generic-avatar-box {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          margin-bottom: 0.85rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
          flex-shrink: 0;
        }
        .dev-avatar-icon {
          color: #ffffff;
        }
        .dev-name {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--dark-navy-text);
          letter-spacing: 0.02em;
          margin: 0 0 4px 0;
        }
        .dev-role {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--brand-primary);
          margin-bottom: 1.1rem;
        }
        .dev-social-links {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          width: 100%;
          margin-top: auto;
        }
        .dev-social-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.45rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .dev-social-btn.linkedin {
          background: #E0F2FE;
          color: #0A66C2;
          border: 1px solid #BAE6FD;
        }
        .dev-social-btn.linkedin:hover {
          background: #0A66C2;
          color: #ffffff;
          border-color: #0A66C2;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(10, 102, 194, 0.25);
        }
        .dev-social-btn.github {
          background: #F1F5F9;
          color: #0F172A;
          border: 1px solid #E2E8F0;
        }
        .dev-social-btn.github:hover {
          background: #0F172A;
          color: #ffffff;
          border-color: #0F172A;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.25);
        }

        /* Responsive Breakpoints */
        @media (max-width: 899px) and (min-width: 600px) {
          .team-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 599px) {
          .team-cards-grid {
            grid-template-columns: 1fr;
          }
          .dev-social-links {
            flex-direction: row;
            justify-content: center;
          }
        }
        @media (max-width: 768px) {
          .profile-grid-container {
            grid-template-columns: 1fr;
          }
          .hero-content-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .hero-actions-col {
            width: 100%;
            justify-content: flex-start;
          }
          .info-fields-grid {
            grid-template-columns: 1fr;
          }
          .col-span-2 {
            grid-column: span 1;
          }
          .form-group-grid {
            grid-template-columns: 1fr;
          }
          .team-card-inner {
            flex-direction: column;
            align-items: flex-start;
          }
          .btn-team {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};
