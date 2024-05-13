"use client"

import SketchComponent from "@/components/SketchComponent";
import { P5CanvasInstance } from "@p5-wrapper/react";
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

    const handleButton = () => {
        router.push("/hogehoge");
    }
    const sketch = (p5: P5CanvasInstance) => {
        if(!user)return;
        p5.setup = () => {
            p5.createCanvas(400, 400);
            p5.background(255,200,200);
        };
        p5.mouseReleased = () => {
            if(40 <= p5.mouseX && p5.mouseX <= 140 && 40 <= p5.mouseY && p5.mouseY <= 80){    
                handleButton();
            }
        };
        let x = 0;
        let y = 0;
        let W_key:boolean = false;
        let A_key:boolean = false;
        let S_key:boolean = false;
        let D_key:boolean = false;
        p5.keyPressed = () => {
            if(p5.key == 'w')W_key = true;
            if(p5.key == 'a')A_key = true;
            if(p5.key == 's')S_key = true;
            if(p5.key == 'd')D_key = true;
        }
        p5.keyReleased = () => {
            if(p5.key == 'w')W_key = false;
            if(p5.key == 'a')A_key = false;
            if(p5.key == 's')S_key = false;
            if(p5.key == 'd')D_key = false;
        }
        p5.draw = () => {
            p5.background(255,200,200);
            p5.fill(255);
            p5.ellipse(x,y,50,50);
            p5.text(user.name,0,50);
            if(W_key) y -= 3;
            if(S_key) y += 3;
            if(A_key) x -= 3;
            if(D_key) x += 3;
            if(x < 25)x = 25;
            if(x > p5.width-25)x = p5.width-25;
            if(y < 25)y = 25;
            if(y > p5.height-25)y = p5.height-25;
        };
    };

    if(user){
        return(        
            <div>
                <p>ゲーム画面</p>
                <SketchComponent sketch={sketch}></SketchComponent>
            </div>
        );
    }
}