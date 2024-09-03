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
        <div className='flex justify-center items-center h-screen w-full'>
            <div className='mx-auto max-w-md p-6 bg-white shadow-md rounded-lg'>
                <form onSubmit={handleSubmit}>
                    <div className='text-2xl'>註冊</div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username">姓名</Label>
                            <Input 
                                id="username" 
                                placeholder="姓名" 
                                required 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="sex">性別</Label>
                            <Select onValueChange={(value) => setGender(value)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="性別" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>---</SelectLabel>
                                        <SelectItem value="male">男性</SelectItem>
                                        <SelectItem value="female">女性</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-2 mt-4">
                        <Label htmlFor="account">帳號</Label>
                        <Input 
                            type="text" 
                            className="w-full" 
                            placeholder="帳號" 
                            value={account}
                            onChange={(e) => setAccount(e.target.value)}
                        />
                    </div>
                    
                    <div className="grid gap-2 mt-4">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                            type="password" 
                            className="w-full" 
                            placeholder="密碼" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2 mt-4">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            type="email" 
                            className="w-full" 
                            placeholder="Email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                        <Button type="submit" className="w-full">註冊</Button>
                        <Button variant="outline" className="w-full">使用 Google 登入</Button>
                    </div>
                    <div className="mt-4 text-center text-sm ">
                        已經有帳號了？{" "}
                        <Link href="/login" className="underline">登入</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignupPage;