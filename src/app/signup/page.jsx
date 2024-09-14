'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const SignupPage = () => {
    const [username, setUsername] = useState('');
    const [gender, setGender] = useState('');
    const [account, setAccount] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter()

    const handleSubmit = async (event) => {
      event.preventDefault();
      console.log('開始提交表單');
      try {
          console.log('發送數據:', { username, gender, account, email, password });
          const response = await fetch('/api/signup', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                  username, 
                  gender, 
                  account, 
                  email, 
                  password 
              }),
          });
          console.log('收到響應:', response.status);
          const data = await response.json();
          console.log('響應數據:', data);
  
          if (response.ok) {
              console.log('註冊成功');
              router.push('/login');
          } else {
              console.error('註冊失敗:', data.msg);
              // 這裡可以添加一些錯誤處理，比如顯示錯誤消息
          }
      } catch (error) {
          console.error('發生錯誤:', error);
      }
    };

    return (
        <div className='flex justify-center items-center min-h-screen w-full bg-gray-100 dark:bg-gray-900'>
            <div className='mx-auto max-w-md p-8 bg-white dark:bg-gray-800 shadow-md rounded-lg transition-colors duration-200'>
                <form onSubmit={handleSubmit}>
                    <h2 className='text-2xl font-bold mb-6 text-gray-800 dark:text-white'>註冊</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">姓名</Label>
                            <Input 
                                id="username" 
                                placeholder="姓名" 
                                required 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="sex" className="text-gray-700 dark:text-gray-300">性別</Label>
                            <Select onValueChange={(value) => setGender(value)}>
                                <SelectTrigger className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                    <SelectValue placeholder="性別" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-700">
                                    <SelectGroup>
                                        <SelectLabel className="text-gray-700 dark:text-gray-300">---</SelectLabel>
                                        <SelectItem value="male" className="text-gray-900 dark:text-white">男性</SelectItem>
                                        <SelectItem value="female" className="text-gray-900 dark:text-white">女性</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-2 mb-4">
                        <Label htmlFor="account" className="text-gray-700 dark:text-gray-300">帳號</Label>
                        <Input 
                            type="text" 
                            className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                            placeholder="帳號" 
                            value={account}
                            onChange={(e) => setAccount(e.target.value)}
                        />
                    </div>
                    
                    <div className="grid gap-2 mb-4">
                        <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">密碼</Label>
                        <Input 
                            type="password" 
                            className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                            placeholder="密碼" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2 mb-6">
                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                        <Input 
                            type="email" 
                            className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                            placeholder="Email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">註冊</Button>
                        <Button variant="outline" className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
                            使用 Google 登入
                        </Button>
                    </div>
                    <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        已經有帳號了？{" "}
                        <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">登入</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignupPage;