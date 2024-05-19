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
        
        class Ball {
            x: number;
            y: number;
            speed: number;
            diameter: number;
            isvisible: boolean;
            constructor(x: number, y: number, speed: number) {
              this.x = x;
              this.y = y;
              this.speed = speed;
              this.diameter = 30;
              this.isvisible = true;
            }
            display() {
              p5.fill(50, 205, 50)
              p5.ellipse(this.x, this.y, this.diameter, this.diameter);
            }
            move() {
              this.y += this.speed;
              if (this.y > p5.height) {
                this.y = -this.diameter;
                this.x = p5.random (30, p5.width - 30);
              }
              for(let shotBall of shotBalls){
                if(this.hit(shotBall)){
                  this.isvisible = false;
                  score = score + 10;
                }
              }
            }
            hit(shotBall: Shotball){
              return(p5.dist(this.x,this.y,shotBall.x,shotBall.y)<= this.diameter/2 + shotBall.diameter/2);
            }
          }

        class Player {
            x: number;
            y: number;
            speed: number;
            diameter: number;
            health: number;
            constructor(x: number, y: number) {
              this.x = x;
              this.y = y;
              this.speed = 5;
              this.diameter = 30;
              this.health = 3;
            }
            display() {
              p5.fill(255);
              p5.ellipse(this.x, this.y, this.diameter, this.diameter);
            }
            move() {
              if (p5.keyIsDown(65) && this.x - this.diameter / 2 > 0) { //Akey
                this.x -= this.speed;
              }
              if (p5.keyIsDown(68) && this.x - this.diameter / 2 < p5.width) { //Dkey
                this.x += this.speed;
              }
              if (p5.keyIsDown(87) && this.y - this.diameter / 2 > 0) { //Wkey
                this.y -= this.speed;
              }
              if (p5.keyIsDown(83) && this.y - this.diameter / 2 < p5.height) { //Skey
                this.y += this.speed;
              }
            }
            checkCollision(balls: Ball[]) {
              for (let ball of balls) {
                if (ball.isvisible && p5.dist(this.x, this.y, ball.x, ball.y) <= this.diameter / 2 + ball.diameter / 2) {
                ball.isvisible = false;
                this.health--;
                if (this.health <= 0) {
                    this.health = 0;
                    p5.noLoop();
                    p5.fill(139, 0, 0);
                    p5.textSize(70);
                    p5.text(`GAME OVER`, 80, 200);
                  }
                }
              }
            }
          }
        class Shotball {
            x: number;
            y: number;
            diameter: number;
            dx: number;
            dy: number;
            constructor(x: number, y: number) {
              this.x = player.x;
              this.y = player.y;
              this.diameter = 20;
              let _rad = p5.atan2(p5.mouseY - player.y, p5.mouseX - player.x);
              this.dx = 10 * p5.cos(_rad);
              this.dy = 10 * p5.sin(_rad);
            }
            display() {
              p5.fill(255, 215, 0);
              p5.ellipse(this.x, this.y, this.diameter, this.diameter);
            }
            move() {
              this.x += this.dx;
              this.y += this.dy;
            }
          }
          let balls: Ball[] = [];
          let player: Player;
          let shotBalls: Shotball[] = [];
          let cTime = 0;
          let coolDown = 100;
          let score = 0;
          let gameSpeed = 0;
          let shotCount = 0;
          let reroad = false;
          let reroadTime = 3000;
          let bullets = 10;

        p5.setup = () => {
            p5.createCanvas(600, 400);
            for (let i = 0; i < 10; i++) {
                let t_x = p5.random(30, p5.width - 30);
                let t_y = p5.random(-p5.height, 0);
                let t_speed = 2;
                balls.push(new Ball(t_x, t_y, t_speed));
             }
            player = new Player(p5.width / 2, p5.height / 2);
        }

        p5.draw = () => {
            if(p5.frameCount%60 == 0 && balls.length < 10){
                let t_x = p5.random(30, p5.width - 30);
                let t_y = p5.random(-p5.height, 0);
                let t_speed = 2 + gameSpeed;
                balls.push(new Ball(t_x, t_y, t_speed));
              }
              p5.background(30);
              for (let i = balls.length-1;i >= 0; i--) {
                balls[i].display();
                balls[i].move();
                if(!balls[i].isvisible){
                  balls.splice(i,1)
                }
              }
              player.move();
              player.display();
              player.checkCollision(balls);
              let _rad = p5.atan2(p5.mouseY - player.y, p5.mouseX - player.x);
              let _arrow_x = player.x + 30 * p5.cos(_rad);
              let _arrow_y = player.y + 30 * p5.sin(_rad);
              p5.stroke(255);
              p5.line(_arrow_x, _arrow_y, player.x, player.y);
              for (let shotBall of shotBalls) {
                shotBall.move();
                shotBall.display();
              }
              p5.fill(255);
              p5.textSize(25);
              p5.text(`スコア: ${score}`, 10, 30);
              p5.text(`体力: ${player.health}`, 10, 60);
              if (p5.frameCount % 600 == 0) {
                gameSpeed += 0.5;
                for (let ball of balls) {
                  ball.speed += 0.5;
                }
              }
              if(reroad) {
                let remainingCoolTime = p5.max(0, reroadTime - (p5.millis() - cTime));
                p5.textSize(20);
                p5.fill(255, 140, 0);
                p5.text(`クールタイム: ${p5.nf(remainingCoolTime / 1000, 1, 2)}s`, 10, 90);
                if (remainingCoolTime <= 0) {
                  reroad = false;
                  shotCount = 0;
                }
              }
              p5.fill(255, 140, 0);
              p5.textSize(40);
              p5.text(`弾数: ${bullets - shotCount}`, 10, 350);
              p5.fill(65, 105, 225);
              p5.textSize(18);
              p5.text(`you`, player.x - 15, player.y + 6);
            
        }
        p5.mousePressed = () => {
            if (!reroad) {
                let current = p5.millis();
                if (current - cTime >= coolDown) {
                  cTime = current;
                  shotBalls.push(new Shotball(player.x,player.y));
                  shotCount++;
                  if(shotCount >= bullets) {
                    reroad = true;
                    cTime = p5.millis();
                  }
                }
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