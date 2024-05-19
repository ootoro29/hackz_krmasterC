"use client"

import SketchComponent from "@/components/SketchComponent";
import { P5CanvasInstance } from "@p5-wrapper/react";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { getEdgePolyfilledModules } from "next/dist/build/webpack/plugins/middleware-plugin";
import { log } from "console";
import { abort } from "process";
import { UserInfo, UserScoreInfo } from "@/types/user";
import { getDatabase, onValue, ref, update } from "firebase/database";


export default function SakeGame({kind,scoreUserInfo,setScoreUserInfo,scoreInfo,setScoreInfo}:{kind:number,scoreUserInfo:UserScoreInfo|null,setScoreUserInfo:Dispatch<SetStateAction<UserScoreInfo|null>>,scoreInfo:Array<UserScoreInfo>,setScoreInfo:Dispatch<SetStateAction<Array<UserScoreInfo>>>}){
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
        let game_over = false;
        const GAMEFINISH = async(reward:number) => {
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
            const UPDATE = async() => {
                await update(gameScoreRef,{
                    name:user.name,
                    score:score
                });
            }
            if( scoreUserInfo === null ){
                UPDATE();
            }else{
                if(scoreUserInfo.score < score){
                    if(findex!=-1){
                        scoreInfo.sort((a:UserScoreInfo,b:UserScoreInfo) => {
                            if(a.score > b.score){
                                return -1;
                            }
                            if(a.score < b.score){
                                return 1;
                            }
                            return 0;
                        });
                    }
                    UPDATE();
                }
            }
            
        }
        //// init
        class Player{
            x:number;
            y:number;
            hp:number;
            max_hp:number;
            speed:number;
            constructor(x:number,y:number,hp:number,speed:number){
                this.x=x;
                this.y=y;
                this.hp=hp;
                this.max_hp=hp;
                this.speed=speed;
            }
            draw(){
                p5.fill(0,255,0,255);
                p5.circle(this.x,this.y,30);
            }
            update(){
                // move
                if (p5.keyIsPressed){
                    if      (d_key) this.x+=this.speed;
                    else if (a_key) this.x-=this.speed;
                    if      (s_key) this.y+=this.speed;
                    else if (w_key) this.y-=this.speed;
                }
                this.make_in_box();

                // be dameged
                for (let i=0; i<balles.length; i++){
                    if (p5.dist(this.x,this.y,balles[i].x,balles[i].y)<=30){
                        player.hp--;
                        break;
                    }
                }
            }
            make_in_box(){
                let a_border=p5.width/2+box_size/2;
                if (this.x>a_border) this.x=a_border;
                a_border=p5.width/2-box_size/2;
                if (this.x<a_border) this.x=a_border;
                a_border=p5.height/2+box_size/2;
                if (this.y>a_border) this.y=a_border;
                a_border=p5.height/2-box_size/2;
                if (this.y<a_border) this.y=a_border;
            }
        }
        class Ball{
            x:number;
            y:number;
            x_power:number;
            y_power:number;
            gravity_direction:"x"|"y";
            gravity_power:number;
            bound_count_down:number;
            flag_dead:boolean;
            flag_during_throwing:boolean;
            constructor(x:number,y:number,x_vector:number,y_vector:number,gravity_direction:"x"|"y",gravity_power:number){
                this.x=x;
                this.y=y;
                this.x_power=x_vector;
                this.y_power=y_vector;
                this.gravity_direction=gravity_direction;
                this.gravity_power=gravity_power;
                this.bound_count_down=5;
                this.flag_dead=false;
                this.flag_during_throwing=true;
            }
            draw(){
                p5.fill(255,0,0,255);
                p5.circle(this.x,this.y,30);
            }
            update(){
                // simply moving
                this.x+=this.x_power;
                this.y+=this.y_power;

                // gravity
                if (this.gravity_direction=="x") this.x_power+=this.gravity_power;
                else this.y_power+=this.gravity_power;

                // deceleration
                this.x_power*=deceleration;
                this.y_power*=deceleration;

                // during throwing
                let left_border = p5.width/2-box_size/2
                let right_border = p5.width/2+box_size/2
                let up_border = p5.height/2-box_size/2
                let down_border = p5.height/2+box_size/2
                if (left_border<this.x&&this.x<right_border&&up_border<this.y&&this.y<down_border) this.flag_during_throwing=false;

                if (this.bound_count_down<=0){
                    // kill
                    if (!(0<this.x&&this.x<p5.width)) this.flag_dead=true;
                    else if (!(0<this.y&&this.y<p5.height)) this.flag_dead=true;
                } else if (!this.flag_during_throwing) this.bound();// bound
            }
            bound(){
                // right
                let a_border=p5.width/2+box_size/2;
                if (a_border<this.x){
                    this.x-=2*(this.x-a_border);
                    this.x_power=-this.x_power
                    if (this.gravity_direction=="x"&&this.gravity_power>0) this.bound_count_down--;
                }
                // left
                a_border=p5.width/2-box_size/2;
                if (this.x<a_border){
                    this.x+=2*(a_border-this.x);
                    this.x_power=-this.x_power
                    if (this.gravity_direction=="x"&&this.gravity_power<0) this.bound_count_down--;
                }
                // down
                a_border=p5.height/2+box_size/2;
                if (a_border<this.y){
                    this.y-=2*(this.y-a_border);
                    this.y_power=-this.y_power
                    if (this.gravity_direction=="y"&&this.gravity_power>0) this.bound_count_down--;
                }
                // up
                a_border=p5.height/2-box_size/2;
                if (this.y<a_border){
                    this.y+=2*(a_border-this.y);
                    this.y_power=-this.y_power
                    if (this.gravity_direction=="y"&&this.gravity_power<0) this.bound_count_down--;
                }
            }
        }
        // variables
        // scenes
        const EXPLAINING = "explaining";
        const PLAYING = "playing";
        const CLEAR = "clear";
        const GAMEOVER = "gameover";

        const FPS=60;
        let scene = EXPLAINING;
        let clock = 0;
        let score = 0;
        let player=new Player(p5.width/2,p5.height/2,100,10);
        let rest_time_of_game = 30
        let w_key = false;
        let a_key = false;
        let s_key = false;
        let d_key = false;
        let box_size=400
        let deceleration=1-1/100;
        let balles:Ball[]=[];

        function randint(min:number,max:number){
            return Math.round(p5.random(min,max));
        }
        p5.setup = () => {
            p5.createCanvas(800, 600);
            p5.stroke(255,255,255,255);
            p5.strokeWeight(5);
            player.x=p5.width/2;
            player.y=p5.height/2;
        }
        p5.draw = () => {
            clock++
            if (scene==EXPLAINING){
                scene_explaining();
            } else if (scene == PLAYING){
                scene_playing();
            } else if (scene == CLEAR){
                scene_clear();
            } else if (scene == GAMEOVER){
                scene_gameover();
            }
        }
        function scene_explaining(){
            // process
            if (clock >= FPS*5){
                scene=PLAYING
                clock=0
            };
            
            // drawing
            p5.background(0);
            p5.fill(255,255,255,255);
            p5.textSize(50);
            p5.text(`${rest_time_of_game}秒間,hpが0にならないように\nWASDキーでよけ続けろ！`,20,p5.height/2);
        } 
        function scene_playing(){
            //// game process
            // player
            player.update();

            // ball
            // generate
            if (clock%(1*FPS)==0){
                let xy:("x"|"y")[]=["x","y"];// <- typescript君用
                balles.push(new Ball(p5.width*7/8,p5.height/2,
                                    p5.random(-25,-20), p5.random(-10,10),
                                    xy[randint(0,1)],[-1,1][randint(0,1)]));
            }
            // update
            for (let i=0; i<balles.length; i++){
                balles[i].update();
                if (balles[i].flag_dead){
                    balles.splice(i,1);
                    i--;
                }
            }
            // 残り時間計算
            if (clock%FPS==0)rest_time_of_game--;

            // クリア判定
            if (rest_time_of_game<=0){
                scene=CLEAR;
                score=player.hp;
            };
            // ゲームオーバー判定
            if (player.hp<=0) scene=GAMEOVER;

            //// drawing
            p5.background(0);

            // thrower
            draw_thrower(p5.width*7/8,p5.height/2,(clock%(1*FPS)<0.5*FPS));

            // balles
            for (let i=0; i<balles.length; i++) balles[i].draw();

            // player
            player.draw();

            // box
            p5.noFill();
            p5.stroke(255,255,255,255);
            p5.square(p5.width/2-box_size/2,p5.height/2-box_size/2,box_size)

            // hp bar
            p5.noStroke();
            p5.fill(255,0,0,255);
            p5.rect(p5.width/2-box_size/2,p5.height*14/16,box_size,p5.height*1/16);
            p5.fill(255,255,0,255);
            p5.rect(p5.width/2-box_size/2,p5.height*14/16,box_size*player.hp/player.max_hp,p5.height*1/16);

            // rest_time_of_game
            p5.fill(255,255,255,50);
            p5.stroke(0,0,0,50);
            p5.textSize(500);
            p5.text(rest_time_of_game,100,p5.height-50);
        }
        function scene_clear() {
            if(!uinf)return;
            if(!game_over){
                const reward =  uinf.coins + Math.floor(score*6);
                GAMEFINISH(reward);
                SCOREBOARD(score);
                game_over = true;
            }
            // drawing
            p5.background(0);
            p5.textSize(100);
            p5.fill(255,212,0,255);
            p5.stroke(255,255,255,255);
            p5.text(`GAME CLEAR!\nScore: ${score}`,50,p5.height/2);
            p5.fill(255,255,0);
            p5.textSize(45);
            p5.text(`GameCoins +${Math.floor(score*6)}`,50,p5.height/2+190);
        }
        function scene_gameover() {
            if(!uinf)return;
            if(!game_over){
                const reward =  uinf.coins + Math.floor(score*3);
                GAMEFINISH(reward);
                SCOREBOARD(score);
                game_over = true;
            }
            // drawing
            p5.background(0);
            p5.textSize(100);
            p5.fill(255,0,0,255);
            p5.stroke(255,0,0,255);
            p5.text(`GAME OVER`,50,p5.height/2);
            p5.fill(255,255,0);
            p5.textSize(45);
            p5.noStroke();
            p5.text(`GameCoins +${Math.floor(score*3)}`,50,p5.height/2+60);

        }
        function draw_thrower(x:number,y:number,throwed:boolean){
            p5.stroke(255,255,255,255);
            // let siri:[number,number]=[neck[0],neck[1]+50];
            let siri:[number,number]=[x-30,y+90];
            let neck=[0,0]
            if (throwed){
                neck=[siri[0]-30,siri[1]-20];
                p5.line(neck[0],neck[1],neck[0]-30,neck[1]+10);//right arm
                p5.noFill();
                p5.circle(neck[0]-15,neck[1]-15,20);//head
                p5.line(neck[0],neck[1],neck[0]+10,neck[1]+30);//left arm
            } else {
                p5.fill(255,0,0,255);
                p5.circle(x,y,30);
                neck=[siri[0],siri[1]-50];
                p5.line(neck[0],neck[1],x+20,y+10);//right arm
                p5.noFill();
                p5.circle(neck[0],neck[1]-20,20);//head
                p5.line(neck[0],neck[1],neck[0]-10,neck[1]+40);//left arm
            }
            p5.line(neck[0],neck[1],siri[0],siri[1]);//sesuji
            p5.line(siri[0],siri[1],siri[0]+20,siri[1]+20)//right leg
            p5.line(siri[0],siri[1],siri[0]-20,siri[1]+20)//left leg
        }
        p5.keyPressed = () =>{
            if(p5.key == 'w'){    
                w_key = true;
            }
            if(p5.key == 'a'){    
                a_key = true;
            }
            if(p5.key == 's'){    
                s_key = true;
            }
            if(p5.key == 'd'){    
                d_key = true;
            }
        }
        p5.keyReleased = () =>{
            if(p5.key == 'w'){    
                w_key = false;
            }
            if(p5.key == 'a'){    
                a_key = false;
            }
            if(p5.key == 's'){    
                s_key = false;
            }
            if(p5.key == 'd'){    
                d_key = false;
            }
        }

    
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