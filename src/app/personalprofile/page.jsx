"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const userData = await response.json();
          console.log('Fetched user data:', userData); // 調試日誌
          setUser(userData);
        } else {
          setError('Failed to fetch user data');
        }
      } catch (error) {
        setError('Error fetching user data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) return <div className="text-center mt-8 text-gray-700 dark:text-gray-300">Loading...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;
  if (!user) return <div className="text-center mt-8 text-gray-700 dark:text-gray-300">No user data available</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-xl rounded-lg overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          <CardContent className="relative">
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-700 shadow-lg overflow-hidden">
                {user.pic ? (
                  <Image
                    src={user.pic}
                    alt={user.username}
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      console.error('Image failed to load:', e);
                      e.target.src = '/api/placeholder/128/128'; // 備用圖片
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <span className="text-4xl text-gray-500 dark:text-gray-300">
                      {user.username[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="pt-16 text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {user.username}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">
                {user.account}
              </p>
            </div>
            {/* 其他用戶信息... */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;