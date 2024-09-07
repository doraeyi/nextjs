import { cookies } from "next/headers"
import { verifyJwt } from '@/lib/jwt'
import { redirect } from "next/navigation"

export default function questionBank() {
  const accessToken = cookies().get("token")?.value || ""
  
  if (!verifyJwt(accessToken)) {
    redirect("/login")
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">題庫</h1>
      <p>新增題目</p>
    </div>
  );
}