"use client"

import SketchComponent from "@/components/SketchComponent";
import { P5CanvasInstance } from "@p5-wrapper/react";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getEdgePolyfilledModules } from "next/dist/build/webpack/plugins/middleware-plugin";
import { log } from "console";


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
        class Player{
            whitch:string;
            y:number;
            the_num:number;
            constructor(){
                this.whitch=LEFT;
                this.y=525;
                this.the_num=10;
            }
            draw(){
                p5.fill(0,255,0,255);
                let x;
                if (this.whitch==LEFT)x = p5.width/4;
                else x = p5.width*3/4;
                p5.circle(x,this.y,Math.log(this.the_num)*10)
            }
            move(){
                if (p5.keyIsPressed){
                    if      (p5.key=="ArrowLeft")   this.whitch=LEFT;
                    else if (p5.key=="ArrowRight")  this.whitch=RIGHT;
                }
            }
        }
        class Wall{
            effect:["+"|"-"|"×"|"÷",number];
            whitch:string;
            h:number;
            y:number;
            constructor(effect:["+"|"-"|"×"|"÷",number],whitch:string){
                this.effect=effect;
                this.whitch=whitch;
                this.h=100;
                this.y=-this.h;
            }
            draw(){
                p5.stroke(0,0,0,255);
                p5.strokeWeight(5);
                let eff_a=COLOR_BY_EFFECT[this.effect[0]];
                p5.fill(eff_a[0],eff_a[1],eff_a[2]);
                let x;
                if (this.whitch == LEFT)x = 0;
                else x=p5.width/2;
                p5.rect(x,this.y,p5.width/2,this.h);
                p5.textSize(100);
                p5.text(this.effect[0]+this.effect[1],x,this.y,x+p5.width/2);
            }
            update(){
                // moving
                this.y+=1+/* Math.log */(Math.log(difficulty));
                
                // hit
                if (player.whitch==this.whitch && player.y<=this.y+this.h){
                    this.affect();
                    return true;
                }
                
                return (this.y>=p5.height);
            }
            affect(){
                if (this.effect[0]==PLUS)       player.the_num+=this.effect[1];
                if (this.effect[0]==MINUS)      player.the_num-=this.effect[1];
                if (this.effect[0]==MULTIPLY)   player.the_num*=this.effect[1];
                if (this.effect[0]==DIVIDE)     player.the_num/=this.effect[1];
            }
        }
        // variables
        // scenes
        const EXPLAINING = "explaining";
        const PLAYING = "playing";
        const RESULT = "result";

        // effects
        const PLUS="+";
        const MINUS="-";
        const MULTIPLY="×";
        const DIVIDE="÷";
        const EFFECT_TYPES:("+"|"-"|"×"|"÷")[]=[PLUS,MINUS,MULTIPLY,DIVIDE];
        const COLOR_BY_EFFECT={"+":[255,255,0],
                               "-":[0,255,255],
                               "×":[255,0,0],
                               "÷":[0,0,255]};
        
        const LEFT="left";
        const RIGHT = "right";
        const FPS=60;
        let scene = EXPLAINING;
        let clock = 0;
        let score = 0;
        let walles:Wall[]=[];
        let player=new Player();
        let difficulty = player.the_num;
        let rest_time_of_game = 30

        function randint(min:number,max:number){
            return Math.round(p5.random(min,max));
        }


        p5.setup = () => {
            p5.createCanvas(800, 600);
            p5.stroke(0,0,0);
            p5.strokeWeight(5);
            player.y=p5.height*7/8;
        }

        p5.draw = () => {
            clock++
            if (scene==EXPLAINING){
                scene_explaining();
            } else if (scene == PLAYING){
                scene_playing();
            } else if (scene == RESULT){
                scene_result();
            }
        }

        function scene_explaining(){
            // process
            if (clock >= FPS*5){
                scene=PLAYING
                clock=0
            };
            
            // drawing
            p5.background(220);
            p5.textSize(60);
            p5.text(`${rest_time_of_game}秒間,0にならないように\n左右キーで選び続けろ！`,50,p5.height/2);
        } 

        function scene_playing(){
            //// game process
            // difficulty
            if (difficulty < player.the_num) difficulty = player.the_num;

            // player
            player.move();

            // walles
            // generate
            if (walles.length==0){
                for (let i=0; i<2;i++ ){
                    let effect_type=EFFECT_TYPES[randint(0,EFFECT_TYPES.length-1)];
                    let effect_power=randint(1,Math.log(player.the_num));
                    if (effect_type==MINUS||effect_type==DIVIDE) effect_power*=5;
                    let whitch=[LEFT,RIGHT][i];
                    walles.push(new Wall([effect_type,effect_power],whitch))
                }
            }
            // update
            for (let i=0; i<walles.length; i++){
                let is_dead = walles[i].update();
                if (is_dead){
                    walles.splice(i,1);
                    i--
                }
            }

            // 残り時間計算
            if (clock%FPS==0)rest_time_of_game--;

            // 終了判定
            if (player.the_num<=0||rest_time_of_game<=0){
                scene=RESULT;
                score=Math.round(100*Math.log(player.the_num));
                if (score<0||isNaN(score))score=0;
            };

            //// drawing
            p5.background(220);
            for (let i=0; i<walles.length; i++) walles[i].draw();
            player.draw();

            // 残り時間
            p5.fill(0,0,0,50);
            p5.stroke(0,0,0,50);
            p5.textSize(500);
            p5.text(rest_time_of_game,100,p5.height-50);
            
            
        }

        function scene_result() {
            // drawing
            p5.background(220);
            p5.textSize(100);
            p5.fill(255,212,0,255);
            p5.stroke(0,0,0,255);
            p5.text(`END!\nScore: ${score}`,50,p5.height/2);
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