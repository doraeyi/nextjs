'use client'
import React, { use, useState } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
import {useRouter} from 'next/navigation'
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
  


 
const SignupPage=()=>{
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter()

  // function handleSubmit(event) {
  //   event.preventDefault();
  //   axios.post('http://localhost:8081/login', { email, password })
  //     .then(res => {
  //       if(res.data.message==='success'){
  //           router.push('/')
  //       }
  //     })
  //     .catch(err => console.log(err));
  // }

  return (
    <div className='flex justify-center items-center h-screen w-full'>
    <div className='mx-auto max-w-md p-6 bg-white shadow-md rounded-lg'>  
       <div className='text-2xl'>註冊</div>
       <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="grid gap-2">
              <Label htmlFor="username">姓名</Label>
              <Input id="username" placeholder="姓名" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sex">性別</Label>
              <Select>
                <SelectTrigger className="w-[180px]">
                 <SelectValue placeholder="性別" />
                </SelectTrigger>
                <SelectContent>
                 <SelectGroup>
                     <SelectLabel>---</SelectLabel>
                     <SelectItem value="boy">男性</SelectItem>
                     <SelectItem value="girl">女性</SelectItem>
                 </SelectGroup>
                 </SelectContent>
                </Select>

            </div>
          </div>

    <div className="grid gap-2 mt-4">
      <Label htmlFor="account">帳號</Label>
      <Input type="account" className="w-30" placeholder="帳號" />
    </div>

    <div className="grid gap-2 mt-4">
      <Label htmlFor="email">Email</Label>
      <Input type="email" className="w-30" placeholder="Email" />
    </div>

    <div className="grid gap-2 mt-4">
      <Label htmlFor="password">Password</Label>
      <Input type="password" className="w-30" placeholder="密碼" />
    </div>
    <div className="mt-4 flex flex-col gap-2">
      <Button type="submit" className="w-full">Login</Button>
      <Button variant="outline" className="w-full">Login with Google</Button>
    </div>
    <div className="mt-4 text-center text-sm ">Already have an account?{" "}
        <Link href="/login" className="underline">Sign in</Link>
    </div>    
    </div>  
    </div>
  );
}

export default SignupPage;
