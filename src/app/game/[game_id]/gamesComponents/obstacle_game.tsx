"use client"

import SketchComponent from "@/components/SketchComponent";
import { P5CanvasInstance } from "@p5-wrapper/react";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { UserInfo, UserScoreInfo } from "@/types/user";
import { getDatabase, limitToFirst, onChildAdded, onValue, orderByChild, query, ref, update } from "firebase/database";

export default function ObstacleGame({kind,scoreUserInfo,setScoreUserInfo,scoreInfo,setScoreInfo}:{kind:number,scoreUserInfo:UserScoreInfo|null,setScoreUserInfo:Dispatch<SetStateAction<UserScoreInfo|null>>,scoreInfo:Array<UserScoreInfo>,setScoreInfo:Dispatch<SetStateAction<Array<UserScoreInfo>>>}){
    const user = useAuth();
    const router = useRouter();
    const [uinf,setUinf] = useState<UserInfo|undefined|null>(undefined);
    const handleSetUserInfo = async() => {
        if(!user)return;
        const db = getDatabase();
        const userInfoRef = ref(db,`userInfo/${user.id}`);
        await onValue(userInfoRef,(snap) => {
            if(!snap.val()){
                setUinf(null);
            }else{
                setUinf({game:snap.val().game,coins:snap.val().coins});
            }
        },{onlyOnce:true})
    }
    useEffect(() => {
        if(user === null){
            router.push('/');
        }
        if(!user)return;
        handleSetUserInfo();
        
    },[user]);
    useEffect(() => {
        if(!user)return;
        if(uinf === null){
            router.push('/game');
        }
    },[uinf])
    
    
    const sketch = (p5: P5CanvasInstance) => {
        if(!user || !uinf)return;
        const GAMEOVER = async(reward:number) => {
            const db = getDatabase();
            const userInfoRef = ref(db,`userInfo/${user.id}`);
            await update(userInfoRef,{
                coins:reward
            });
        }
        const SCOREBOARD = async(score:number) => {
            const db = getDatabase();
            const gameScoreRef = ref(db,`gameScore/${kind}/${user.id}`);
            const findex = scoreInfo.findIndex((v) => (v.UID == user.id));
            const UPDATE = () => {
                update(gameScoreRef,{
                    name:user.name,
                    score:score
                });
            }
            if( scoreUserInfo === null ){
                await UPDATE();
            }else{
                if(scoreUserInfo.score < score){
                    await UPDATE();
                }
            }
            
        }
        class Player {
            x:number;
            y:number;
            vy:number;
            r:number;
            constructor() {
                this.x = p5.width / 2;
                this.y = p5.height - 20;
                this.vy = 0;
                this.r = 40;
            }
            
            update() {
                this.x = p5.mouseX;
                this.x = p5.constrain(this.x, this.r+40, p5.width - this.r-40);
                this.y += this.vy;
                this.vy += 0.3;
                if(this.y >=  p5.height - this.r){
                    this.y =  p5.height - this.r;
                    this.vy = 0;
                    count = 0;
                }
            }
            
            display() {
                p5.fill(0, 0, 255);
                p5.noStroke();
                p5.ellipse(this.x, this.y, this.r * 2);
                p5.translate(this.x-this.r-20,this.y-this.r-40);
                if(p5.mouseX - preMX > 0){
                    if(!gameover)direction = 1;
                }
                if(p5.mouseX - preMX < 0){
                    if(!gameover)direction = -1;
                }
                if(direction == -1){
                    p5.translate(120,0);
                    p5.scale(-1,1);
                }
                if(player.vy == 0){
                    p5.image(pM,0,0, 120, 120);
                }else if(player.vy < 0){
                    p5.image(pU,0,0, 120, 120);
                }else{
                    p5.image(pD,0,0, 120, 120);
                }
                if(direction == -1){
                    p5.scale(-1,1);
                    p5.translate(-120,0);
                }
                p5.translate(-this.x+this.r+20,-this.y+this.r+40);
                preMX = p5.mouseX;

            }
        }

        class Obstacle {
            x:number;
            y:number;
            r:number;
            speed:number;
            already_over:boolean;
            type:number;
            constructor(speed:number,type:number) {
                this.type = type;
                this.x = 0;
                this.y = 0;
                this.r = 0;
                if(type == 0 || type == 1){
                    this.x = p5.random(60,p5.width-60);
                    this.y = 0;
                    this.r = 20;
                }else if(type == 2){
                    this.x = 0;
                    this.y = p5.height-25;
                    this.r = 25;
                }else if(type == 3){
                    this.x = p5.width;
                    this.y = p5.height-25;
                    this.r = 25;
                }
                this.already_over = false;
                this.speed = speed;
            }
            
            update() {
                if(this.type == 0 || this.type == 1)this.y += this.speed;
                else this.x += this.speed;
                if(count > 0 && this.y - this.r > player.y && !this.already_over && this.x-this.r <= player.x && player.x <=this.x+this.r){
                    this.already_over = true;
                    score ++;
                }
            }
            
            display() {
                if(this.type == 0){
                    p5.fill(255, 0, 0);
                }else if(this.type == 1){
                    p5.fill(255, 0, 200);
                }else {
                    p5.fill(0, 255, 0);
                }
                p5.noStroke();
                p5.ellipse(this.x, this.y, this.r * 2);
            }
            
            offscreen() {
                return (this.y > p5.height + this.r);
            }
            
            hits(player:Player) {
                let d = p5.dist(this.x, this.y, player.x, player.y);
                return (d < this.r + player.r);
            }
        }
        let player:Player;
        let obstacles:Obstacle[] = [];
        let score = 0;
        let time = 0;
        let playerImageM = p5.loadImage('../../image/test.png');
        let pM = p5.loadImage('../../image/PM.png');
        let pU = p5.loadImage('../../image/PU.png');
        let pD = p5.loadImage('../../image/PD.png');
        let direction = 1;
        let gameover = false;
        p5.setup = () => {
            p5.createCanvas(640, 800);
            player = new Player();
            p5.frameRate(60);
        }
        let count = 0;
        p5.mouseReleased = () => {
            if(gameover)return;
            if(count ==  0){
                player.vy += -10;
                player.y += player.vy;
                count ++;
            }else if(count ==  1){
                player.vy = 0;
                player.vy += -10;
                player.y += player.vy;
                count ++;
            }
        }
        let preMX = 0;
        p5.draw = () => {
            //p5.background(220);
            p5.noStroke();
            p5.fill(200,200,200,200);
            p5.rect(0,0,p5.width,p5.height);
            p5.stroke(120);
            p5.strokeWeight(3);
            const add_y = + 30*Math.sin(p5.radians(p5.frameCount));
            for(let i = -60; i < p5.height+60; i += 30 ){
                p5.line(40,i+add_y,40,i+15+add_y);
            }
            for(let i = -60; i < p5.height+60; i += 30 ){
                p5.line(p5.width-40,i-add_y,p5.width-40,i+15-add_y);
            }
            if(!gameover)player.update();
            player.display();
            if(!gameover){
                let T = Math.floor(300-120*(1/(1+Math.exp(-(time/1000)))));
                if(time >= 60*30){
                    T -= -30 + 60*(1/(1+Math.exp(-((time-60*30)/10000))));
                }
                T = Math.floor(T);
                if (p5.frameCount % (T) == 0) {
                    obstacles.push(new Obstacle(-1 + 4*(1/(1+Math.exp(-((time)/1000)))),0));
                }
                if(time >= 60 * 30){
                    if (p5.frameCount % Math.floor(T*1.8) == 0) {
                        obstacles.push(new Obstacle(-1 + 12*(1/(1+Math.exp(-((time)/3000)))),1));
                    }
                }

                if(time >= 60 * 60){
                    if (p5.frameCount % Math.floor(T*2.1) == 0) {
                        if(Math.random() < 0.5){
                            obstacles.push(new Obstacle(5,2));
                        }else{
                            obstacles.push(new Obstacle(-5,3));
                        }
                    }
                }
            }
            
            for (let i = obstacles.length - 1; i >= 0; i--) {
                if(!gameover)obstacles[i].update();
                obstacles[i].display();
                if (obstacles[i].hits(player)) {
                    if(!gameover){
                        const reward =  uinf.coins + Math.floor(score*3);
                        GAMEOVER(reward);
                        SCOREBOARD(score);
                    }
                    gameover = true;
                }
                
                if (obstacles[i].offscreen()) {
                    obstacles.splice(i, 1);
                    score+=3;
                }
            }
            p5.fill(0);
            if(gameover){   
                p5.textSize(45);
                p5.fill(0);
                p5.textAlign("center","center");
                p5.text('Game Over', p5.width / 2, p5.height / 2);

                p5.fill(255,255,0);
                p5.textSize(25);
                p5.textAlign("center","center");
                p5.text('GameCoins +'+Math.floor(score*3), p5.width / 2, p5.height / 2+35);
            }
            p5.textSize(24);
            p5.fill(0);
            p5.textAlign("left","top");
            p5.text(`Score: ${score}`, 50, 10);
            time ++;
        }
    };

    if(user){
        return(        
            <div style={{display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column"}}>
                <p>ゲーム画面</p>
                <SketchComponent sketch={sketch}></SketchComponent>
                <button onClick={() => {router.push('/game')}}>ゲームを終わる</button>
            </div>
        );
    }
}