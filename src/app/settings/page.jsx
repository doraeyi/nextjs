"use client"
import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import dynamic from 'next/dynamic';

const FiLoader = dynamic(() => import('react-icons/fi').then(mod => mod.FiLoader), { ssr: false });
const FiUpload = dynamic(() => import('react-icons/fi').then(mod => mod.FiUpload), { ssr: false });
const FiSave = dynamic(() => import('react-icons/fi').then(mod => mod.FiSave), { ssr: false });
const FiSun = dynamic(() => import('react-icons/fi').then(mod => mod.FiSun), { ssr: false });
const FiMoon = dynamic(() => import('react-icons/fi').then(mod => mod.FiMoon), { ssr: false });
const FiLogOut = dynamic(() => import('react-icons/fi').then(mod => mod.FiLogOut), { ssr: false });

const ProfileEdit = () => {
  const [user, setUser] = useState({ username: '', account: '', pic: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [usernameError, setUsernameError] = useState('');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      setAlert({ type: 'error', title: '錯誤', description: '獲取用戶資料失敗' });
    }
  };

  const validateUsername = (username) => {
    const usernameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,20}$/;
    if (!usernameRegex.test(username)) {
      setUsernameError('用戶名必須是 2-20 個字符，可以包含中文、字母、數字和下劃線');
      return false;
    }
    setUsernameError('');
    return true;
  };

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    setUser({ ...user, username: newUsername });
    validateUsername(newUsername);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setAlert({ type: 'error', title: '錯誤', description: '請選擇一個圖片文件' });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        body: formData,  // FormData 自動設置正確的 headers
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(prevUser => ({ ...prevUser, pic: updatedUser.pic }));
        setAlert({ type: 'success', title: '成功', description: '頭像更新成功' });
      } else {
        throw new Error('Failed to update profile picture');
      }
    } catch (error) {
      setAlert({ type: 'error', title: '錯誤', description: '頭像更新失敗' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!validateUsername(user.username)) {
      setAlert({ type: 'error', title: '錯誤', description: '無效的用戶名' });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          newPassword: newPassword,
          pic: user.pic
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setAlert({ type: 'success', title: '成功', description: result.message || '資料更新成功' });
        setNewPassword('');
        fetchUserData();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      setAlert({ type: 'error', title: '錯誤', description: '資料更新失敗' });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) return null;

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">個人資料編輯</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          <Button
            onClick={handleUpload}
            disabled={isUploading || !selectedFile}
            className="w-full"
          >
            {isUploading ? (
              <FiLoader className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <FiUpload className="h-4 w-4 mr-2" />
            )}
            <span>{isUploading ? '上傳中...' : '上傳頭像'}</span>
          </Button>
        </div>

        <div>
          <Input
            type="text"
            placeholder="用戶名"
            value={user.username}
            onChange={handleUsernameChange}
            className={usernameError ? 'border-red-500' : ''}
          />
          {usernameError && <p className="text-red-500 text-sm mt-1">{usernameError}</p>}
        </div>

        <Input
          type="password"
          placeholder="新密碼（如果要更改）"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSave}
          disabled={isSaving || !!usernameError}
          className="w-full"
        >
          {isSaving ? (
            <FiLoader className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <FiSave className="h-4 w-4 mr-2" />
          )}
          <span>{isSaving ? '保存中...' : '保存更改'}</span>
        </Button>
      </CardFooter>
      {alert && (
        <Alert variant={alert.type === 'success' ? 'default' : 'destructive'} className="mt-4">
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>{alert.description}</AlertDescription>
        </Alert>
      )}
    </Card>
  );
};

export default ProfileEdit;
