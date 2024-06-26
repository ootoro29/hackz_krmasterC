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
        p5.setup = () => {
            p5.createCanvas(1200, 720);
            player = new Player();
        }
        let screen = 0;
        let player:Player;
        let Bullets:Bullet[] = [];
        let Enemys:Enemy[] = [];
        let score = 0;
        p5.mousePressed = () => {
            if(p5.mouseButton === p5.LEFT){
                mouseLeft = true;
            }
        }
        p5.mouseReleased = () => {
            if(p5.mouseButton === p5.LEFT){
                mouseLeft = false;
            }
            if(screen == 0){
                screen = 1;
            }
        }
        let W_Key = false;
        let A_Key = false;
        let S_Key = false;
        let D_Key = false;
        let mouseLeft = false;
        p5.keyPressed = () =>{
            if(p5.key == 'w'){    
                W_Key = true;
            }
            if(p5.key == 'a'){    
                A_Key = true;
            }
            if(p5.key == 's'){    
                S_Key = true;
            }
            if(p5.key == 'd'){    
                D_Key = true;
            }
        }
        p5.keyReleased = () =>{
            if(p5.key == 'w'){    
                W_Key = false;
            }
            if(p5.key == 'a'){    
                A_Key = false;
            }
            if(p5.key == 's'){    
                S_Key = false;
            }
            if(p5.key == 'd'){    
                D_Key = false;
            }
        }
        let gameTime = 0;
        let game_over = false;
        let pre_theta = 0;
        const game = () => {
            if(!game_over)score += 0.001;
            let T = 400 -240*(1+(1+Math.exp(-gameTime/3000 - 1)));
            T = Math.floor(T);
            if(p5.frameCount % T == 0){
                if(!game_over)Enemys.push(new Enemy(Math.min(3+Math.floor(gameTime/1200),7),-2+10*(1+(1+Math.exp(-gameTime/1000)))));
            }
            gameTime++;
            p5.background(60,10,125);   
            if(!game_over)player.update();
            player.display();
            p5.noStroke();
            for (let i = Bullets.length - 1; i >= 0; i--) {
                if(!game_over)Bullets[i].update();
                Bullets[i].display();
                
                /*
                if (obstacles[i].hits(player)) {
                    gameover = true;
                }
                */
                
                if (Bullets[i].offscreen()) {
                    Bullets.splice(i, 1);
                    //score+=3;
                }
            }
            for (let i = Enemys.length - 1; i >= 0; i--) {
                if(!game_over)Enemys[i].update();
                Enemys[i].display();
                
                /*
                if (obstacles[i].hits(player)) {
                    gameover = true;
                }
                */
                if (Enemys[i].hit(player)) {
                    game_over = true;
                    //score+=3;
                }
                
                if (Enemys[i].offscreen()) {
                    Enemys.splice(i, 1);
                    score+=3;
                }
            }
            p5.textAlign("left","top");
            p5.textSize(40);
            p5.fill(255);
            p5.text("SCORE:"+Math.round(score*100)/100,0,50);
            if(game_over){
                p5.textSize(120);
                p5.textAlign("center","center");
                p5.fill(0);
                p5.stroke(255);
                p5.strokeWeight(3);
                p5.text("Game Over",p5.width/2,p5.height/2);
                p5.textSize(40);
                p5.noStroke();
                p5.fill(255,255,0);
                p5.text("GameCoins +"+Math.floor(score/5),p5.width/2,p5.height/2+80);
            }
        }
        p5.draw = () => {
            if(screen == 0){
                p5.background(120);   
            }else if(screen == 1){
                game();
            }
        }
        class Bullet {
            x:number;
            y:number;
            r:number;
            speed:number;
            theta:number;
            is_delete = false;
            constructor(x:number, y:number,theta:number) {
                this.x = x;
                this.y = y;
                this.r = 10;
                this.theta = theta;
                this.speed = 20;
            }
            
            update() {
                this.x += this.speed * Math.cos((this.theta));
                this.y += this.speed * Math.sin((this.theta));
                for(let i = 0; i < Enemys.length; i++){
                    if(Enemys[i].disBul(this) < this.r+Enemys[i].r/2 && Enemys[i].time > 0){
                        Enemys[i].hp -= 1;
                        this.is_delete = true;
                    }
                }
            }
            
            display() {
                p5.fill(255, 0, 0);
                p5.noStroke();
                p5.ellipse(this.x, this.y, this.r * 2);
            }
            
            offscreen() {
                return (this.x < -100 || this.x > p5.width+100 || this.y < -100 || this.y > p5.height+100) || this.is_delete;
            }
            
            /*
            hits(enemy:Enemy) {
                let d = p5.dist(this.x, this.y, enemy.x, enemy.y);
                return (d < this.r + enemy.r);
            }
            */
        }

        class Player{
            x:number;
            y:number;
            vx:number;
            vy:number;
            r:number;
            constructor(){
                this.x = p5.width/2;
                this.y = p5.height/2;
                this.r = 15;
                this.vx = 0;
                this.vy = 0;
            }
            update() {
                const a = 0.5;
                if(W_Key){
                    this.vy -= a;
                }
                if(S_Key){
                    this.vy += a;
                }
                if(A_Key){
                    this.vx -= a;
                }
                if(D_Key){
                    this.vx += a;
                }
                this.x += this.vx;
                this.y += this.vy;
                this.x = p5.constrain(this.x, this.r, p5.width-this.r);
                this.y = p5.constrain(this.y, this.r, p5.height-this.r);
                this.vx *= 0.96;
                this.vy *= 0.96;
                if(mouseLeft && p5.frameCount % 8 == 0){
                    const theta = Math.atan2(p5.mouseY-this.y,p5.mouseX-this.x);
                    Bullets.push(new Bullet(this.x+20*Math.cos(theta+p5.radians(25)),this.y+20*Math.sin(theta+p5.radians(25)),theta))
                    Bullets.push(new Bullet(this.x+20*Math.cos(theta+p5.radians(-25)),this.y+20*Math.sin(theta+p5.radians(-25)),theta))
                }
            }
            display(){
                p5.noStroke();
                p5.fill(255,0,0);
                p5.ellipse(this.x,this.y,this.r*2,this.r*2);
                p5.noFill();
                p5.stroke(255,255,0);
                p5.strokeWeight(5);
                p5.ellipse(this.x,this.y,this.r*8,this.r*8);
                p5.fill(255,255,0);
                p5.translate(this.x,this.y);
                const theta = Math.atan2(p5.mouseY-this.y,p5.mouseX-this.x);
                if(!game_over)pre_theta = theta;
                p5.rotate(pre_theta);
                const triangle_l = 25;
                p5.translate(60+triangle_l/2*Math.sqrt(3),0);
                p5.triangle(triangle_l*Math.cos(p5.radians(150)),triangle_l*Math.sin(p5.radians(150)),triangle_l*Math.cos(p5.radians(210)),triangle_l*Math.sin(p5.radians(210)),0,0);
                p5.translate(-60-triangle_l/2*Math.sqrt(3),0);
                p5.rotate(-pre_theta);
                p5.translate(-this.x,-this.y);
            }
        }

        class Enemy{
            x:number;
            y:number;
            vx:number;
            vy:number;
            r:number;
            time:number;
            theta:number;
            hp:number;
            limit_v:number;
            hp_max:number;
            constructor(hp:number,lv:number){
                this.limit_v = lv;
                this.hp_max = hp;
                this.hp = this.hp_max;
                this.x = p5.random(30,p5.width-30);
                this.y = p5.random(30,p5.height-30);
                this.r = 20;
                this.theta = p5.radians(p5.random(0,360));
                this.vx = 8*Math.cos(this.theta);
                this.vy = 8*Math.sin(this.theta);
                this.time = -45;
            }
            update() {
                this.time++;
                if(this.time < 0)return;
                
                this.x += this.vx;
                this.y += this.vy;
                const theta_player = Math.atan2(player.y-this.y,player.x-this.x);
                const k = Math.max(Math.cos(Math.abs(theta_player-this.theta))*0.3,0.1);
                this.vx += Math.cos(theta_player)*k;
                this.vy += Math.sin(theta_player)*k;
                this.vx *= 0.98;
                this.vy *= 0.98;
                if(p5.dist(0,0,this.vx,this.vy) > this.limit_v){
                    this.vx *= this.limit_v/p5.dist(0,0,this.vx,this.vy);
                    this.vy *= this.limit_v/p5.dist(0,0,this.vx,this.vy);
                }
                let n = 0;
                let nx = 0,ny = 0;
                for(let i = 0; i < Enemys.length; i++){
                    const d = this.distance(Enemys[i]);
                    if(d < 200 &&d != 0){
                        n ++;
                        nx += (Enemys[i].x-this.x)*(1-d/200);
                        ny += (Enemys[i].y-this.y)*(1-d/200);
                    }
                }
                if(n!= 0){
                    nx /= n;
                    ny /= n;
                    const r = Math.sqrt(nx*nx+ny*ny);
                    const theta = Math.atan2(ny,nx);
                    this.vx += r*Math.cos(theta+p5.radians(90))*0.005;
                    this.vy += r*Math.sin(theta+p5.radians(90))*0.005;
                }
                this.theta = Math.atan2(this.vy,this.vx);
                
            }
            display(){
                p5.noStroke();
                if(this.time < 0 ){
                    p5.fill(255,255,255,150);
                }else{
                    p5.fill(255,255,255);
                }
                p5.translate(this.x,this.y);
                p5.rotate(this.theta);
                p5.triangle(this.r*Math.sqrt(3)/2,0,-this.r*Math.sqrt(3)/2,this.r*0.8,-this.r*Math.sqrt(3)/2,-this.r*0.8);
                if(this.hp != this.hp_max){
                    p5.stroke(0);
                    p5.strokeWeight(2);
                    p5.fill(255,0,0);
                    p5.rect(-this.r*Math.sqrt(3)/2-15,-this.r*0.8,12,this.r*1.6);
                    p5.fill(0,255,0);
                    p5.rect(-this.r*Math.sqrt(3)/2-15,-this.r*0.8,12,this.r*1.6*(this.hp/this.hp_max));
                }
                p5.rotate(-this.theta);
                p5.translate(-this.x,-this.y);
            }
            offscreen(){
                return (this.hp <= 0);
            }
            distance(enemy:Enemy){
                return (p5.dist(this.x,this.y,enemy.x,enemy.y));
            }
            hit(p:Player){
                return(p5.dist((this.r*Math.sqrt(3)/2)*Math.cos(this.theta)+this.x,(this.r*Math.sqrt(3)/2)*Math.sin(this.theta)+this.y,p.x,p.y) < p.r) && (this.time > 0);
            }
            disBul(bullet:Bullet){
                return (p5.dist(this.x,this.y,bullet.x,bullet.y));
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