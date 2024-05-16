"use client"

import SketchComponent from "@/components/SketchComponent";
import { P5CanvasInstance } from "@p5-wrapper/react";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TestGame3(){
    const user = useAuth();
    const router = useRouter();
    useEffect(() => {
        if(user === null){
            router.push('/');
        }
    },[user]);
    
    const sketch = (p5: P5CanvasInstance) => {
        class Player {
            x:number;
            y:number;
            r:number;
            constructor() {
                this.x = p5.width / 2;
                this.y = p5.height - 20;
                this.r = 20;
            }
            
            update() {
                this.x = p5.mouseX;
                this.x = p5.constrain(this.x, this.r, p5.width - this.r);
            }
            
            display() {
                p5.fill(0, 0, 255);
                p5.noStroke();
                p5.ellipse(this.x, this.y, this.r * 2);
            }
        }

        class Obstacle {
            x:number;
            y:number;
            r:number;
            speed:number;
            constructor() {
                this.x = p5.random(p5.width);
                this.y = 0;
                this.r = 20;
                this.speed = 5;
            }
            
            update() {
                this.y += this.speed;
            }
            
            display() {
                p5.fill(255, 0, 0);
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

        p5.setup = () => {
            p5.createCanvas(400, 600);
            player = new Player();
            p5.frameRate(60);
        }

        p5.draw = () => {
            p5.background(220);
            
            player.update();
            player.display();
            
            if (p5.frameCount % 60 == 0) {
                obstacles.push(new Obstacle());
            }
            
            for (let i = obstacles.length - 1; i >= 0; i--) {
                obstacles[i].update();
                obstacles[i].display();
                
                if (obstacles[i].hits(player)) {
                    p5.noLoop();
                    p5.textSize(32);
                    p5.fill(0);
                    p5.textAlign("center","center");
                    p5.text('Game Over', p5.width / 2, p5.height / 2);
                }
                
                if (obstacles[i].offscreen()) {
                    obstacles.splice(i, 1);
                    score++;
                }
            }
            
            p5.textSize(24);
            p5.fill(0);
            p5.textAlign("left","top");
            p5.text(`Score: ${score}`, 10, 10);
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