import Image from "next/image";
import { cookies } from "next/headers"
import { signJwtAccessToken, verifyJwt } from '@/lib/jwt'

import { redirect } from "next/navigation"

const HomePage = () => {
  // const accessToken = cookies().get("token")?.value || ""
  // console.log("gg",!verifyJwt(accessToken))
  // if (!verifyJwt(accessToken)) {
  //   redirect("/login")
  // }

  return (
    <div className="">
      首頁
    </div>
  );
}

export default HomePage