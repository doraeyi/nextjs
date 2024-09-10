'use client'

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { User, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const PersonalInfoCard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('獲取用戶數據失敗');
      }
      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.error('獲取用戶失敗:', error);
      setError('加載用戶數據失敗。請重試。');
    } finally {
      setLoading(false);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('檔案大小不能超過5MB');
      return;
    }
  
    setUploading(true);
    setUploadError(null);
  
    try {
      const base64 = await convertToBase64(file);
      const response = await fetch('/api/upload-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatar: base64 }),
      });
  
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '上傳頭像失敗');
      }
  
      setUser(prevUser => ({...prevUser, avatar: result.avatarUrl}));
    } catch (error) {
      console.error('上傳頭像時出錯:', error);
      setUploadError(`上傳失敗: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-10">載入中...</div>;
  }

  if (error) {
    return (
      <div className="text-center mt-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>錯誤</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <button onClick={fetchUser} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          重試
        </button>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center mt-10">沒有可用的用戶數據</div>;
  }

  return (
    <div className="flex justify-center items-start min-h-screen pt-10">
      <div className="w-full max-w-md rounded-lg shadow-xl overflow-hidden bg-white">
        <div className="h-48 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
        <div className="relative px-6 py-10 -mt-16">
          <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username || '用戶'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={64} className="text-gray-400" />
                </div>
              )}
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
          <div className="text-center mt-20">
            <h2 className="text-2xl font-semibold text-gray-800">{user.username || '未知用戶'}</h2>
            <p className="text-gray-600 mt-2">
              性別: {user.gender || '未設置'}<br />
              帳號: {user.account || '未設置'}<br />
              電子郵件: {user.email || '未設置'}
            </p>
            {uploading && <p className="text-blue-500 mt-2">正在上傳頭像...</p>}
            {uploadError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>上傳錯誤</AlertTitle>
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoCard;