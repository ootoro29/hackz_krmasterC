"use client"

import SketchComponent from "@/components/SketchComponent";
import { P5CanvasInstance } from "@p5-wrapper/react";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TestGame4(){
    const user = useAuth();
    const router = useRouter();
    useEffect(() => {
        if(user === null){
            router.push('/');
        }
    },[user]);
    
    const sketch = (p5: P5CanvasInstance) => {
        let ship:Ship;
        let bullets:Bullet[] = [];
        let enemies:Enemy[] = [];
        let score = 0;

        p5.setup = () => {
            p5.createCanvas(400, 600);
            ship = new Ship();
            for (let i = 0; i < 6; i++) {
                enemies.push(new Enemy(i * 60 + 60, 40));
            }
        }

        p5.draw = () => {
            p5.background(0);
            
            ship.update();
            ship.display();
            
            for (let i = bullets.length - 1; i >= 0; i--) {
                bullets[i].update();
                bullets[i].display();
                if (bullets[i].offscreen()) {
                    bullets.splice(i, 1);
                } else {
                    for (let j = enemies.length - 1; j >= 0; j--) {
                        if (bullets[i] && bullets[i].hits(enemies[j])) {
                            enemies.splice(j, 1);
                            bullets.splice(i, 1);
                            score++;
                            break;
                        }
                    }
                }
            }
            
            for (let i = enemies.length - 1; i >= 0; i--) {
                enemies[i].update();
                enemies[i].display();
                if (enemies[i].hits(ship)) {
                    p5.noLoop();
                    p5.textSize(32);
                    p5.fill(255);
                    p5.textAlign("center","center");
                    p5.text('Game Over', p5.width / 2, p5.height / 2);
                }
            }
            
            p5.textSize(24);
            p5.fill(255);
            p5.textAlign("left","top");
            p5.text(`Score: ${score}`, 10, 10);
        }

        p5.keyPressed = () => {
            if (p5.key === ' ') {
                bullets.push(new Bullet(ship.x, ship.y));
            }
        }

        class Ship {
            x:number;
            y:number;
            w:number;
            h:number;
            constructor() {
                this.x = p5.width / 2;
                this.y = p5.height - 20;
                this.w = 20;
                this.h = 20;
            }
            
            update() {
                this.x = p5.mouseX;
                this.x = p5.constrain(this.x, 0, p5.width);
            }
            
            display() {
                p5.fill(0, 0, 255);
                p5.noStroke();
                p5.rect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
            }
        }

        class Bullet {
            x:number;
            y:number;
            r:number;
            speed:number;
            constructor(x:number, y:number) {
                this.x = x;
                this.y = y;
                this.r = 5;
                this.speed = 7;
            }
            
            update() {
                this.y -= this.speed;
            }
            
            display() {
                p5.fill(255, 0, 0);
                p5.noStroke();
                p5.ellipse(this.x, this.y, this.r * 2);
            }
            
            offscreen() {
                return (this.y < 0);
            }
            
            hits(enemy:Enemy) {
                let d = p5.dist(this.x, this.y, enemy.x, enemy.y);
                return (d < this.r + enemy.r);
            }
        }

        class Enemy {
            x:number;
            y:number;
            r:number;
            speed:number;
            constructor(x:number, y:number) {
                this.x = x;
                this.y = y;
                this.r = 20;
                this.speed = 2;
            }
            
            update() {
                this.y += this.speed;
            }
            
            display() {
                p5.fill(0, 255, 0);
                p5.noStroke();
                p5.ellipse(this.x, this.y, this.r * 2);
            }
            
            hits(ship:Ship) {
                let d = p5.dist(this.x, this.y, ship.x, ship.y);
                return (d < this.r + ship.w / 2);
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