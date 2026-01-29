import { useState, useEffect } from 'react';

/**
 * 自定义 Hook: 使用 localStorage 持久化状态
 * @param {string} key - localStorage 键名
 * @param {any} initialValue - 初始值
 * @returns {[any, Function]} - [值, 设置函数]
 */
export function useLocalStorage(key, initialValue) {
    // 初始化状态
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // 当值变化时保存到 localStorage
    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error(`Error saving to localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
}

/**
 * 获取存储的发送方档案列表
 */
export function getSenderProfiles() {
    try {
        const profiles = window.localStorage.getItem('senderProfiles');
        return profiles ? JSON.parse(profiles) : [];
    } catch (error) {
        console.error('Error reading sender profiles:', error);
        return [];
    }
}

/**
 * 保存发送方档案
 */
export function saveSenderProfile(profile) {
    try {
        const profiles = getSenderProfiles();
        const existingIndex = profiles.findIndex(p => p.id === profile.id);

        if (existingIndex >= 0) {
            profiles[existingIndex] = profile;
        } else {
            profiles.push({ ...profile, id: Date.now().toString() });
        }

        window.localStorage.setItem('senderProfiles', JSON.stringify(profiles));
        return profiles;
    } catch (error) {
        console.error('Error saving sender profile:', error);
        return [];
    }
}

/**
 * 删除发送方档案
 */
export function deleteSenderProfile(profileId) {
    try {
        const profiles = getSenderProfiles().filter(p => p.id !== profileId);
        window.localStorage.setItem('senderProfiles', JSON.stringify(profiles));
        return profiles;
    } catch (error) {
        console.error('Error deleting sender profile:', error);
        return [];
    }
}

/**
 * 获取存储的收件方档案列表
 */
export function getRecipientProfiles() {
    try {
        const profiles = window.localStorage.getItem('recipientProfiles');
        return profiles ? JSON.parse(profiles) : [];
    } catch (error) {
        console.error('Error reading recipient profiles:', error);
        return [];
    }
}

/**
 * 保存收件方档案
 */
export function saveRecipientProfile(profile) {
    try {
        const profiles = getRecipientProfiles();
        const existingIndex = profiles.findIndex(p => p.id === profile.id);

        if (existingIndex >= 0) {
            profiles[existingIndex] = profile;
        } else {
            profiles.push({ ...profile, id: Date.now().toString() });
        }

        window.localStorage.setItem('recipientProfiles', JSON.stringify(profiles));
        return profiles;
    } catch (error) {
        console.error('Error saving recipient profile:', error);
        return [];
    }
}

/**
 * 删除收件方档案
 */
export function deleteRecipientProfile(profileId) {
    try {
        const profiles = getRecipientProfiles().filter(p => p.id !== profileId);
        window.localStorage.setItem('recipientProfiles', JSON.stringify(profiles));
        return profiles;
    } catch (error) {
        console.error('Error deleting recipient profile:', error);
        return [];
    }
}
