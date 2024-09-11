"use client"

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const updateUserPic = async (url) => {
    try {
      const response = await fetch('/api/update-user-pic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: url }),
      });
  
      const text = await response.text();
      console.log('Raw response:', text);
  
      let data;
      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error('Failed to parse response:', error);
        throw new Error(`Invalid JSON response: ${error.message}`);
      }
  
      if (!response.ok) {
        console.error('Server error:', data);
        throw new Error(data?.message || `HTTP error! status: ${response.status}`);
      }
  
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  };
const ImageUrlUpload = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleUpload = async () => {
    setIsUploading(true);
    setAlert(null);

    try {
      const result = await updateUserPic(imageUrl);
      setAlert({
        type: 'success',
        title: '上傳成功',
        description: result.message || '圖片URL已成功上傳到user.pic'
      });
      setImageUrl(''); // 清空輸入框
    } catch (error) {
      console.error('Upload error:', error);
      setAlert({
        type: 'error',
        title: '上傳失敗',
        description: `錯誤: ${error.message}. 請檢查控制台以獲取更多信息。`
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="輸入圖片URL"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      <Button onClick={handleUpload} disabled={isUploading || !imageUrl}>
        {isUploading ? '上傳中...' : '上傳'}
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

export default ImageUrlUpload;