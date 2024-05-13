"use client"
import { useAuth } from "@/context/auth";
import { login,logout } from "@/lib/auth";
import { useState } from "react";
import SketchComponent from "@/components/SketchComponent";
import { useRouter } from "next/navigation";

export default function Home() {
  const user = useAuth();
  const[waiting,setWaiting] = useState<boolean>(false);
  const router = useRouter();
  const signIn = () => {
    setWaiting(true);
    login()
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setWaiting(false);
      });
  };
  return (
    <div>
      <p>トップページ</p>
      {user === null && !waiting && <button onClick={signIn}>ログイン</button>}
      {user &&
          <div>
            <p>{user.name}</p>
            <button onClick={() => {router.push("/game")}}>入場</button>
            <button onClick={logout}>ログアウト</button>
          </div>
      }
    </div>
  );
}//<SketchComponent />
