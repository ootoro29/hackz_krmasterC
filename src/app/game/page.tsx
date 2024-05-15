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
        class Rectangle {
            // クラスの型宣言
            x: number
            y: number
            w: number
            h: number
            // constructorの引数に型宣言
            constructor(x: number,y: number,w: number,h: number) {
                this.x = x;
                this.y = y;
                this.w = w;
                this.h = h;
            }
            // クラスのメソッド(関数)に型宣言
            display_figure(): void {
                p5.rect(this.x,this.y,this.w,this.h,3);   
            }
            onMouse():boolean{
                return this.x <= p5.mouseX && p5.mouseX <= this.x + this.w && this.y <= p5.mouseY && p5.mouseY <= this.y + this.h;
            }
        }
        let button:Rectangle;
        let back_button:Rectangle;
        let control:number = 0;
        let Time:number[] = new Array(5);
        let Gy2 = 0;
        let Gy = 0;
        let GameCoins = 0;
        let rotate = 0;
        let GameKind = 0;
        p5.setup = () => {
            GameCoins = 1000;
            p5.createCanvas(1200, 720);
            button =  new Rectangle(p5.width/2-200,500,400,90);
            back_button = new Rectangle(p5.width/2-240,600,480,80);
        };
        p5.mouseReleased = () => {
            if(button.onMouse()){
                if(control == 0 && GameCoins >= 150){
                    GameCoins -= 150;
                    control = 1;
                    Time[0] = 0;
                    Gy2 = 0;
                    Gy = 0;
                    GameKind = Math.floor(p5.random(0,10));
                }
            }
            if(back_button.onMouse()){
                if(control == 2){
                    control = 0;
                }
            }
        };
        p5.draw = () => {
            p5.background(255,200,200);
            if(control == 0){
                p5.strokeWeight(5);
                p5.stroke(0);
                if(button.onMouse()){
                    p5.fill(120,200,250);
                }else{
                    p5.fill(100,160,220);
                }
                button.display_figure();
                p5.textSize(70);
                p5.fill(0);
                p5.noStroke();
                p5.text("ガチャる",button.x+(50),button.y+button.h-20);
                p5.textSize(35);
                p5.text("ゲームコイン:"+GameCoins,0,40);
            }else if(control == 1){
                p5.strokeWeight(5);
                p5.stroke(0);
                p5.fill(190,90,110);
                if(Time[1] < -40)p5.translate(0,-100*Math.pow(Math.sin(p5.radians(60+Time[1])*10),2));
                p5.translate(p5.width/2,Gy);
                p5.rotate(rotate);
                p5.arc(0,Gy2,200,200,0,Math.PI);
                p5.fill(255,0,0);
                p5.arc(0,-Gy2,200,200,Math.PI,0);
                p5.line(-100,+Gy2,100,+Gy2);
                p5.line(-100,-Gy2,100,-Gy2);
                p5.rotate(-rotate);
                p5.translate(-p5.width/2,-Gy);
                if(Time[1] < -40)p5.translate(0,+100*Math.pow(Math.sin(p5.radians(60+Time[1])*10),2));
                if(Gy < 500){    
                    Gy += 8+40/(1+Math.exp(-Time[0]/10));
                    if(Gy >= 500){
                        Time[1] = -60;
                    }
                }else{
                    if(Time[1] >= 0){
                        Gy2 += 5 - 5/(1+Math.exp(-Time[1]/10));
                        p5.fill(255,255,255,Time[1]*8);
                        p5.noStroke();
                        p5.rect(0,0,p5.width,p5.height);
                        if(Time[1] >= 45){
                            Time[2] = -25;
                            control = 2;
                        }
                    }else if(Time[1] >= -40){
                        rotate = p5.radians(45*Math.sin(p5.radians(40+Time[1])*18)) * Math.exp((-40-Time[1])/20);
                    }
                }
            }else if(control == 2){
                p5.textSize(200);
                p5.fill(0);
                p5.textAlign("center");
                p5.text(GameKind,p5.width/2,300);
                p5.textAlign("left");
                if(Time[2] < 0){
                    p5.fill(255,255,255,255-(25+Time[2])*8);
                    p5.noStroke();
                    p5.rect(0,0,p5.width,p5.height);
                }
                if(Time[2] > 30){
                    p5.strokeWeight(5);
                    p5.stroke(0);
                    if(back_button.onMouse()){
                        p5.fill(120,200,250);
                    }else{
                        p5.fill(100,160,220);
                    }
                    back_button.display_figure();
                    p5.fill(0);
                    p5.noStroke();
                    p5.textSize(60);
                    p5.text("ゲームスタート",back_button.x+(25),back_button.y+back_button.h-15);
                }
            }
            for(let i = 0; i < Time.length; i++){
                Time[i] ++;
            }
        };
    };

    if(user){
        return(        
            <div style={{display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column"}}>
                <p>ゲーム画面</p>
                <SketchComponent sketch={sketch}></SketchComponent>
            </div>
        );
    }
}