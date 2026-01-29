import { useState, useEffect } from 'react';
import {
    getSenderProfiles,
    saveSenderProfile,
    deleteSenderProfile
} from '../../hooks/useLocalStorage';

export default function SenderForm({ data, onChange }) {
    const [profiles, setProfiles] = useState([]);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [profileName, setProfileName] = useState('');

    useEffect(() => {
        setProfiles(getSenderProfiles());
    }, []);

    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    const handleSaveProfile = () => {
        if (!data.companyName) return;
        const newProfiles = saveSenderProfile({
            ...data,
            name: profileName || data.companyName
        });
        setProfiles(newProfiles);
        setShowSaveModal(false);
        setProfileName('');
    };

    const handleLoadProfile = (profile) => {
        onChange({
            companyName: profile.companyName || '',
            address: profile.address || '',
            phone: profile.phone || '',
            email: profile.email || ''
        });
    };

    const handleDeleteProfile = (e, profileId) => {
        e.stopPropagation();
        const newProfiles = deleteSenderProfile(profileId);
        setProfiles(newProfiles);
    };

    return (
        <div className="card fade-in">
            <div className="card-header">
                <h3 className="card-title">📤 发送方信息</h3>
                <p className="card-subtitle">您的公司信息（可保存为档案）</p>
            </div>

            {profiles.length > 0 && (
                <div className="profiles-section">
                    <div className="profiles-header">
                        <span className="profiles-title">已保存的档案</span>
                    </div>
                    <div className="profiles-list">
                        {profiles.map((profile) => (
                            <div
                                key={profile.id}
                                className="profile-chip"
                                onClick={() => handleLoadProfile(profile)}
                            >
                                <span>{profile.name || profile.companyName}</span>
                                <span
                                    className="profile-chip-delete"
                                    onClick={(e) => handleDeleteProfile(e, profile.id)}
                                >
                                    ×
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="form-group">
                <label className="form-label required">公司名称</label>
                <input
                    type="text"
                    className="form-input"
                    placeholder="例如: ABC Trading Co."
                    value={data.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                />
            </div>

            <div className="form-group">
                <label className="form-label">地址</label>
                <textarea
                    className="form-textarea"
                    placeholder="例如: 123 Main Street, Suite 100&#10;Los Angeles, CA 90001"
                    value={data.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    rows={3}
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">电话</label>
                    <input
                        type="tel"
                        className="form-input"
                        placeholder="(555) 123-4567"
                        value={data.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">邮箱</label>
                    <input
                        type="email"
                        className="form-input"
                        placeholder="contact@company.com"
                        value={data.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                    />
                </div>
            </div>

            <div className="btn-group">
                <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowSaveModal(true)}
                    disabled={!data.companyName}
                >
                    💾 保存为档案
                </button>
            </div>

            {showSaveModal && (
                <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h4 className="modal-title">保存发送方档案</h4>
                            <button className="modal-close" onClick={() => setShowSaveModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">档案名称</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder={data.companyName}
                                    value={profileName}
                                    onChange={(e) => setProfileName(e.target.value)}
                                />
                                <p className="form-helper">留空将使用公司名称作为档案名称</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowSaveModal(false)}>
                                取消
                            </button>
                            <button className="btn btn-primary" onClick={handleSaveProfile}>
                                保存
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
