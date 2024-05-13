"use client"

import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function Game(){
    const user = useAuth();
    const router = useRouter();
    useEffect(() => {
        if(user === null){
            router.push('/');
        }
    },[user]);
    if(user){
        return(        
            <div>
                <p>ゲーム画面</p>
            </div>
        );
    }
}