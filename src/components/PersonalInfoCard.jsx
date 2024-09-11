"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { User, AlertCircle, Edit2, Loader2, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const PersonalInfoCard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [updateUsernameError, setUpdateUsernameError] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [imageError, setImageError] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const pathname = usePathname();

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    setImageError(false);
    setDebugInfo('Fetching user data...');
    try {
      const res = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('請先登入');
        }
        throw new Error('獲取用戶數據失敗');
      }
      const data = await res.json();
      console.log('Fetched user data:', data);
      setDebugInfo(prev => `${prev}\nUser data fetched successfully.\nUser pic URL: ${data.pic || 'Not set'}`);
      setUser(data);
      setNewUsername(data.username || '');
      setAvatarUrl(data.pic || '');
    } catch (error) {
      console.error('獲取用戶失敗:', error);
      setError(error.message || '加載用戶數據失敗。請重試。');
      setDebugInfo(prev => `${prev}\nError fetching user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser, pathname]);

  useEffect(() => {
    if (user && user.pic) {
      setDebugInfo(prev => `${prev}\nTesting image URL: ${user.pic}`);
      fetch(user.pic, { method: 'HEAD' })
        .then(res => {
          setDebugInfo(prev => `${prev}\nImage URL response: ${res.status}, ${res.ok}`);
          if (!res.ok) setImageError(true);
        })
        .catch(err => {
          console.error('Error testing image URL:', err);
          setDebugInfo(prev => `${prev}\nError testing image URL: ${err.message}`);
          setImageError(true);
        });
    }
  }, [user]);

  const handleAvatarUrlChange = (event) => {
    setAvatarUrl(event.target.value);
  };

  const handleAvatarUpdate = async () => {
    setUploadError(null);
    setSuccessMessage('');
    setIsUpdating(true);
    setDebugInfo(prev => `${prev}\nUpdating avatar...`);
    try {
      const response = await fetch('/api/update-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ avatarUrl }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        setDebugInfo(prev => `${prev}\nServer error response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Avatar update result:', result);
      setDebugInfo(prev => `${prev}\nAvatar updated successfully.`);

      setUser(prevUser => ({...prevUser, pic: avatarUrl}));
      setSuccessMessage('頭像更新成功');
      setImageError(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('更新頭像時出錯:', error);
      setUploadError(`更新失敗: ${error.message}`);
      setDebugInfo(prev => `${prev}\nAvatar update error: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUsernameUpdate = async () => {
    if (!newUsername.trim()) {
      setUpdateUsernameError('用戶名不能為空');
      return;
    }
  
    setUpdateUsernameError(null);
    setSuccessMessage('');
    setIsUpdating(true);
    setDebugInfo(prev => `${prev}\nUpdating username...`);
    try {
      const response = await fetch('/api/update-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          username: newUsername,
          userId: user.id
        }),
        credentials: 'include'
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server response:', errorData);
        setDebugInfo(prev => `${prev}\nServer error response: ${JSON.stringify(errorData)}`);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log('Username update result:', result);
      setDebugInfo(prev => `${prev}\nUsername updated successfully.`);
  
      setUser(prevUser => ({...prevUser, username: newUsername}));
      setEditingUsername(false);
      setSuccessMessage('用戶名更新成功');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('更新用戶名時出錯:', error);
      setUpdateUsernameError(`更新失敗: ${error.message}`);
      setDebugInfo(prev => `${prev}\nUsername update error: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderAvatar = () => {
    if (!user.pic || imageError) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <User size={64} className="text-gray-400" />
        </div>
      );
    }
    return (
      <>
        <Image
          src={user.pic}
          alt={user.username || '用戶'}
          width={128}
          height={128}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Next.js Image 加載失敗:', e);
            setImageError(true);
            setDebugInfo(prev => `${prev}\nNext.js Image load failed.`);
          }}
          unoptimized
        />
        <img
          src={user.pic}
          alt={user.username || '用戶'}
          className="hidden"
          onError={(e) => {
            console.error('普通 img 標籤加載失敗:', e);
            setDebugInfo(prev => `${prev}\nRegular img tag load failed.`);
            setImageError(true);
          }}
        />
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">載入中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>錯誤</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          {error !== '請先登入' && (
            <Button onClick={fetchUser} className="mt-4">
              重試
            </Button>
          )}
        </Alert>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Alert variant="warning" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>注意</AlertTitle>
          <AlertDescription>沒有可用的用戶數據</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start min-h-screen pt-10">
      <div className="w-full max-w-md rounded-lg shadow-xl overflow-hidden bg-white">
        <div className="h-48 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
        <div className="relative px-6 py-10 -mt-16">
          <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
              {renderAvatar()}
            </div>
          </div>
          <div className="text-center mt-20">
            <p className="text-sm text-gray-500 mb-2">調試信息: 圖片 URL = {user.pic || '未設置'}</p>
            {imageError && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>圖片加載錯誤</AlertTitle>
                <AlertDescription>
                  無法加載用戶頭像。請檢查 URL 是否正確。
                  <br />
                  URL: {user.pic}
                </AlertDescription>
              </Alert>
            )}
            {editingUsername ? (
              <div className="flex items-center justify-center space-x-2">
                <Input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-48"
                  disabled={isUpdating}
                />
                <Button onClick={handleUsernameUpdate} disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : '保存'}
                </Button>
                <Button variant="outline" onClick={() => setEditingUsername(false)} disabled={isUpdating}>取消</Button>
              </div>
            ) : (
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center justify-center">
                {user.username || '未知用戶'}
                <Edit2 
                  className="ml-2 h-5 w-5 text-gray-500 cursor-pointer" 
                  onClick={() => setEditingUsername(true)}
                />
              </h2>
            )}
            {updateUsernameError && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>更新錯誤</AlertTitle>
                <AlertDescription>{updateUsernameError}</AlertDescription>
              </Alert>
            )}
            <p className="text-gray-600 mt-2">
              性別: {user.gender || '未設置'}<br />
              帳號: {user.account || '未設置'}<br />
              電子郵件: {user.email || '未設置'}
            </p>
            <div className="mt-4">
              <Input
                type="text"
                value={avatarUrl}
                onChange={handleAvatarUrlChange}
                placeholder="輸入頭像圖片URL"
                className="w-full mb-2"
                disabled={isUpdating}
              />
              <Button onClick={handleAvatarUpdate} disabled={isUpdating}>
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : '更新頭像'}
              </Button>
            </div>
            {uploadError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>上傳錯誤</AlertTitle>
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}
            {successMessage && (
              <Alert variant="success" className="mt-4">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>成功</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
            <div className="mt-4 text-left bg-gray-100 p-2 rounded">
              <h3 className="font-semibold">調試信息:</h3>
              <pre className="text-xs whitespace-pre-wrap">{debugInfo}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoCard;