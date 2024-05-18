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
    
    const sketch = (p5: P5CanvasInstance) => {
        //// init
        class Cheeze{
            x:number;
            y:number;
            w:number;
            h:number;
            acceleration:number;
            speed_x:number;
            speed_y:number;
            max_speed:number;
            constructor(x:number,y:number,w:number=100,h:number=100,speed:number=10){
                this.x=x;
                this.y=y;
                this.w=w;
                this.h=h;
                this.acceleration=speed;
                this.speed_x=0;
                this.speed_y=0;
                this.max_speed=14;
            }

            draw(){
                p5.fill(255,212,0,255);
                p5.stroke(0,0,0,255);
                // 側面の平行四辺形
                p5.quad(this.x,         this.y+this.h/4,
                        this.x+this.w,  this.y+this.h/2,
                        this.x+this.w,  this.y+this.h/2+this.h/2,
                        this.x,         this.y+this.h/4+this.h/2);

                // 上面
                p5.triangle(this.x,         this.y+this.h/4,
                            this.x+this.w,  this.y,
                            this.x+this.w,  this.y+this.h/2);
            }

            run_away(player_x:number,player_y:number){
                if (Math.abs(this.speed_x)<=this.max_speed){
                    if (player_x<this.x){
                        this.speed_x+=this.acceleration;
                    } else {
                        this.speed_x-=this.acceleration;
                    }
                }
                if (Math.abs(this.speed_y)<=this.max_speed){
                    if (player_y<this.y){
                        this.speed_y+=this.acceleration;
                    } else {
                        this.speed_y-=this.acceleration;
                    }
                }
                this.move_in_speed();
            }
            move_in_speed(){
                this.x+=this.speed_x;
                this.y+=this.speed_y;
                let deceleration = 1-1/100;
                this.speed_x*=deceleration;
                this.speed_y*=deceleration;
            }
            make_in_screen(){
                if (this.x > p5.width){
                    this.x=-this.w;
                }
                if (this.x < -this.w){
                    this.x=p5.width;
                }
                if (this.y > p5.height){
                    this.y=-this.h;
                }
                if (this.y < -this.h){
                    this.y=p5.height;
                }
            }
            is_torn(player_x:number,player_y:number,is_clicked:boolean){
                if (!is_clicked)return false;
                if (!(this.x<=player_x&&player_x<=this.x+this.w))return false;
                if (!(this.y<=player_y&&player_y<=this.y+this.h))return false;
                return true;
            }
        }

        class Player{
            x:number;
            y:number;
            rest_time_to_transform_player:number;
            constructor(){
                this.x=0;
                this.y=0;
                this.rest_time_to_transform_player=0;
            }
            update(){
                this.x=p5.mouseX;
                this.y=p5.mouseY;
                if (p5.mouseIsPressed) this.rest_time_to_transform_player=0.1*FPS;
                if (this.rest_time_to_transform_player != 0)this.rest_time_to_transform_player--;    
            }
            draw(){
                p5.fill(255,0,0,100);
                if (this.rest_time_to_transform_player==0){
                    p5.noStroke();
                    p5.circle(this.x,this.y,20)
                } else {
                    p5.stroke(255,0,0,255);
                    let size=50;
                    p5.line(this.x-size,this.y-size,this.x+size,this.y+size);// \
                    p5.line(this.x-size,this.y+size,this.x+size,this.y-size);// /
                }
            }
        }

        // variables
        // scenes
        const EXPLAINING = "explaining";
        const ALIVE = "alive";
        const CLEAR = "clear";
        const GAMEOVER = "gameover";

        const FPS=60;
        let scene = EXPLAINING;
        let cheeze=new Cheeze(400,400,100,100,/* Math.round *//* (p5.random(1,3)) */10);
        let player=new Player();
        let game_time_length_s = 10;
        let clock = 0;
        let rest_time_of_game = game_time_length_s;
        let score = 0;


        p5.setup = () => {
            p5.createCanvas(800, 600);
            p5.stroke(0,0,0);
            p5.strokeWeight(5);
        }

        p5.draw = () => {
            clock++
            if (scene==EXPLAINING){
                scene_explaining();
            } else if (scene == ALIVE){
                scene_cheeze_is_alive();
            } else if (scene == CLEAR){
                scene_clear();
            } else if (scene == GAMEOVER){
                scene_gameover();
            }
        }

        function scene_explaining(){
            // process
            if (clock >= FPS*5){
                scene=ALIVE
                clock=0
            };
            
            // drawing
            p5.background(220);
            p5.textSize(60);
            p5.text(`「避けるチーズ」\n${game_time_length_s}秒以内にチーズを裂け！`,50,p5.height/2);
        } 

        function scene_cheeze_is_alive(){
            //// game process
            // チーズ
            cheeze.run_away(p5.mouseX,p5.mouseY);
            cheeze.make_in_screen();

            // 自機
            player.update();
            
            // 残り時間計算
            if (clock%FPS==0)rest_time_of_game--;
            
            // クリア判定
            if (cheeze.is_torn(p5.mouseX,p5.mouseY,p5.mouseIsPressed)){
                scene=CLEAR;
                score=rest_time_of_game*100;
            }
            
            // ゲームオーバー判定
            if (rest_time_of_game == 0)scene=GAMEOVER;
            
            //// drawing
            p5.background(220);

            // cheeze
            cheeze.draw();
            
            // 自機
            player.draw();

            // 残り時間
            p5.fill(0,0,0,50);
            p5.stroke(0,0,0,50);
            p5.textSize(500);
            p5.text(rest_time_of_game,100,p5.height-50);
            
        }

        function scene_clear() {
            // drawing
            p5.background(220);
            cheeze.draw();
            player.draw();
            p5.textSize(100);
            p5.fill(255,212,0,255);
            p5.stroke(0,0,0,255);
            p5.text(`GAME CLEAR!\nScore: ${score}`,50,p5.height/2);
        }

        function scene_gameover() {
            // drawing
            p5.background(0);
            p5.fill(255,255,255);
            p5.stroke(255,255,255);
            p5.textSize(100);
            p5.text("GAMEOVER",50,p5.height/2);
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