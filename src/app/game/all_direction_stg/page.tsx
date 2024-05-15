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
        let player:Player;
        let bullets:Bullet[] = [];
        let enemies:Enemy[] = [];
        let score = 0;

        p5.setup = () => {
            p5.createCanvas(800, 600);
            player = new Player();
        }

        p5.draw = () => {
            p5.background(0);

            player.update();
            player.display();

            for (let i = bullets.length - 1; i >= 0; i--) {
                bullets[i].update();
                bullets[i].display();
                if (bullets[i].offscreen()) {
                    bullets.splice(i, 1);
                }
            }

            if (p5.frameCount % 60 === 0) {
                enemies.push(new Enemy());
            }

            for (let i = enemies.length - 1; i >= 0; i--) {
                enemies[i].update();
                enemies[i].display();
                if (enemies[i].hits(player)) {
                    p5.noLoop();
                    p5.textSize(32);
                    p5.fill(255);
                    p5.textAlign("center","center");
                    p5.text('Game Over', p5.width / 2, p5.height / 2);
                }
            }

            for (let i = bullets.length - 1; i >= 0; i--) {
                for (let j = enemies.length - 1; j >= 0; j--) {
                    if (bullets[i] && bullets[i].hits(enemies[j])) {
                        bullets.splice(i, 1);
                        enemies.splice(j, 1);
                        score++;
                        break;
                    }
                }
            }

            p5.textSize(24);
            p5.fill(255);
            p5.textAlign("left","top");
            p5.text(`Score: ${score}`, 10, 10);
        }

        p5.keyPressed = () => {
            if (p5.keyCode === p5.UP_ARROW) {
                player.setDir(0, -1);
            } else if (p5.keyCode === p5.DOWN_ARROW) {
                player.setDir(0, 1);
            } else if (p5.keyCode === p5.LEFT_ARROW) {
                player.setDir(-1, 0);
            } else if (p5.keyCode === p5.RIGHT_ARROW) {
                player.setDir(1, 0);
            } else if (p5.key === ' ') {
                bullets.push(new Bullet(player.pos.x, player.pos.y, player.dir.x, player.dir.y));
            }
        }

        p5.keyReleased = () => {
            player.setDir(0, 0);
        }

        class Player {
            pos = p5.createVector(0,0);
            r:number;
            dir = p5.createVector(0,0);
            constructor() {
                this.pos = p5.createVector(p5.width / 2, p5.height / 2);
                this.r = 20;
                this.dir = p5.createVector(0, 0);
            }

            update() {
                this.pos.add(this.dir.copy().mult(5));
                this.pos.x = p5.constrain(this.pos.x, this.r, p5.width - this.r);
                this.pos.y = p5.constrain(this.pos.y, this.r, p5.height - this.r);
            }

            display() {
                p5.fill(0, 0, 255);
                p5.noStroke();
                p5.ellipse(this.pos.x, this.pos.y, this.r * 2);
            }

            setDir(x:number, y:number) {
                this.dir.set(x, y);
            }
        }

        class Bullet {
            pos = p5.createVector(0,0);
            vel = p5.createVector(0,0);
            r:number;
            constructor(x:number, y:number, dirX:number, dirY:number) {
                this.pos = p5.createVector(x, y);
                this.vel = p5.createVector(dirX, dirY).mult(10);
                this.r = 8;
            }

            update() {
                this.pos.add(this.vel);
            }

            display() {
                p5.fill(255, 0, 0);
                p5.noStroke();
                p5.ellipse(this.pos.x, this.pos.y, this.r * 2);
            }

            offscreen() {
                return (this.pos.x < 0 || this.pos.x > p5.width || this.pos.y < 0 || this.pos.y > p5.height);
            }

            hits(enemy:Enemy) {
                let d = p5.dist(this.pos.x, this.pos.y, enemy.pos.x, enemy.pos.y);
                return d < this.r + enemy.r;
            }
        }

        class Enemy {
            pos = p5.createVector(0,0);
            r:number;
            vel = p5.createVector(0,0);
            constructor() {
                this.pos = p5.createVector(p5.random(p5.width), p5.random(p5.height));
                while (p5.dist(this.pos.x, this.pos.y, p5.width / 2, p5.height / 2) < 100) {
                    this.pos = p5.createVector(p5.random(p5.width), p5.random(p5.height));
                }
                this.r = 30;
                this.vel = p5.createVector(p5.width / 2 - this.pos.x, p5.height / 2 - this.pos.y).setMag(2);
            }

            update() {
                this.pos.add(this.vel);
            }

            display() {
                p5.fill(0, 255, 0);
                p5.noStroke();
                p5.ellipse(this.pos.x, this.pos.y, this.r * 2);
            }

            hits(player:Player) {
                let d = p5.dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);
                return d < this.r + player.r;
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