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
        let paddle:Paddle;
        let ball:Ball;
        let bricks:Brick[] = [];
        let rows = 5;
        let cols = 8;
        let score = 0;

        p5.setup = () => {
            p5.createCanvas(400, 600);
            paddle = new Paddle();
            ball = new Ball();
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    bricks.push(new Brick(j * 50 + 25, i * 20 + 30));
                }
            }
        }

        p5.draw = () => {
            p5.background(220);
            
            paddle.update();
            paddle.display();
            
            ball.update();
            ball.display();
            
            ball.checkPaddle(paddle);
            
            for (let i = bricks.length - 1; i >= 0; i--) {
                bricks[i].display();
                if (ball.hits(bricks[i])) {
                    ball.reverse('y');
                    bricks.splice(i, 1);
                    score++;
                }
            }
            
            if (ball.offscreen()) {
                p5.noLoop();
                p5.textSize(32);
                p5.fill(0);
                p5.textAlign("center","center");
                p5.text('Game Over', p5.width / 2, p5.height / 2);
            }
            
            p5.textSize(24);
            p5.fill(0);
            p5.textAlign("left","top");
            p5.text(`Score: ${score}`, 10, 10);
        }

        class Paddle {
            w:number;
            h:number;
            x:number;
            y:number;
            constructor() {
                this.w = 100;
                this.h = 20;
                this.x = p5.width / 2 - this.w / 2;
                this.y = p5.height - this.h - 10;
            }
            
            update() {
                this.x = p5.mouseX - this.w / 2;
                this.x = p5.constrain(this.x, 0, p5.width - this.w);
            }
            
            display() {
                p5.fill(0, 0, 255);
                p5.noStroke();
                p5.rect(this.x, this.y, this.w, this.h);
            }
        }

        class Ball {
            x:number;
            y:number;
            r:number;
            xspeed:number;
            yspeed:number;
            constructor() {
                this.x = p5.width / 2;
                this.y = p5.height / 2;
                this.r = 10;
                this.xspeed = 5;
                this.yspeed = 5;
            }
            
            update() {
                this.x += this.xspeed;
                this.y += this.yspeed;
                
                if (this.x < 0 || this.x > p5.width) {
                    this.reverse('x');
                }
                
                if (this.y < 0) {
                    this.reverse('y');
                }
            }
            
            display() {
                p5.fill(255, 0, 0);
                p5.noStroke();
                p5.ellipse(this.x, this.y, this.r * 2);
            }
            
            reverse(coord:string) {
                if (coord === 'x') {
                    this.xspeed *= -1;
                } else if (coord === 'y') {
                    this.yspeed *= -1;
                }
            }
            
            hits(brick:Brick) {
                let distance = p5.dist(this.x, this.y, brick.x, brick.y);
                return (distance < this.r + brick.r);
            }
            
            checkPaddle(paddle:Paddle) {
                if (this.y + this.r > paddle.y &&
                    this.x > paddle.x && 
                    this.x < paddle.x + paddle.w) {
                    this.reverse('y');
                    this.y = paddle.y - this.r; // 反射時の位置調整
                }
            }
            
            offscreen() {
                return (this.y > p5.height);
            }
        }

        class Brick {
            x:number;
            y:number;
            r:number;
            w:number;
            h:number;
            constructor(x:number, y:number) {
                this.x = x;
                this.y = y;
                this.r = 25; // 四角形のブロックを丸の当たり判定に
                this.w = 50;
                this.h = 20;
            }
            
            display() {
                p5.fill(0, 255, 0);
                p5.noStroke();
                p5.rect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
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