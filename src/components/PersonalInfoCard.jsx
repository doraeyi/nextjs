"use client";

import React, { useState, useEffect } from 'react';

const fetchUserProfile = async () => {
  const response = await fetch('/api/user');
  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }
  return response.json();
};

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userData = await fetchUserProfile();
        setUser(userData);
      } catch (err) {
        setError("无法加载用户资料");
        console.error("Error loading user profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  if (loading) {
    return <div>加载中...</div>;
  }

  if (error) {
    return <div>错误: {error}</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 w-96">
      <h2 className="text-2xl font-bold mb-4">用户资料</h2>
      <div className="flex flex-col items-center">
        <img
          src={user.pic}
          alt={user.username}
          className="w-24 h-24 rounded-full mb-4"
        />
        <p className="text-xl mb-2">{user.username}</p>
        <p className="text-gray-600 mb-1">邮箱: {user.email}</p>
        <p className="text-gray-600 mb-1">性别: {user.gender}</p>
        <p className="text-gray-600 mb-1">创建时间: {user.createdAt}</p>
        <p className="text-gray-600 mb-1">更新时间: {user.updatedAt}</p>
      </div>
    </div>
  );
};

export default UserProfile;