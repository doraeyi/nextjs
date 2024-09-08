
import Image from "next/image";
import { cookies } from "next/headers"
import { signJwtAccessToken, verifyJwt } from '@/lib/jwt'
import * as React from "react"
import { redirect } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
const HomePage = () => {
  // const accessToken = cookies().get("token")?.value || ""
  // console.log("gg",!verifyJwt(accessToken))
  // if (!verifyJwt(accessToken)) {
  //   redirect("/login")
  // }
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  return (
    <div className="">
      首頁
    
    <Calendar
    mode="single"
    selected={date}
    onSelect={setDate}
    className="rounded-md border"
  /></div>
  );
}

export default HomePage