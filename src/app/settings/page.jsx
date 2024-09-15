"use client"
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { FiLoader, FiUpload, FiSave } from "react-icons/fi";

const ProfileEdit = () => {
  const [user, setUser] = useState({ username: '', account: '', pic: '' });
  const [imageUrl, setImageUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setImageUrl(userData.pic || '');
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      setAlert({ type: 'error', title: '錯誤', description: '獲取用戶資料失敗' });
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pic: imageUrl }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(prevUser => ({ ...prevUser, pic: updatedUser.pic }));
        setAlert({ type: 'success', title: '成功', description: '頭像更新成功' });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile picture');
      }
    } catch (error) {
      setAlert({ type: 'error', title: '錯誤', description: error.message || '頭像更新失敗' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
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
        fetchUserData(); // 重新獲取用戶資料以確保顯示最新信息
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      setAlert({ type: 'error', title: '錯誤', description: error.message || '資料更新失敗' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="輸入圖片URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="flex-grow"
        />
        <Button
          onClick={handleUpload}
          disabled={isUploading || !imageUrl}
          className="flex items-center space-x-2"
        >
          {isUploading ? (
            <FiLoader className="h-4 w-4 animate-spin" />
          ) : (
            <FiUpload className="h-4 w-4" />
          )}
          <span>{isUploading ? '上傳中...' : '上傳'}</span>
        </Button>
      </div>

      <Input
        type="text"
        placeholder="用戶名"
        value={user.username}
        onChange={(e) => setUser({ ...user, username: e.target.value })}
      />

      <Input
        type="password"
        placeholder="新密碼（如果要更改）"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center space-x-2"
      >
        {isSaving ? (
          <FiLoader className="h-4 w-4 animate-spin" />
        ) : (
          <FiSave className="h-4 w-4" />
        )}
        <span>{isSaving ? '保存中...' : '保存更改'}</span>
      </Button>

      {alert && (
        <Alert variant={alert.type === 'success' ? 'default' : 'destructive'}>
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>{alert.description}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ProfileEdit;