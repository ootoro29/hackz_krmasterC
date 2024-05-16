"use client"

import SketchComponent from "@/components/SketchComponent";
import { P5CanvasInstance } from "@p5-wrapper/react";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TestGame5(){
    const user = useAuth();
    const router = useRouter();
    useEffect(() => {
        if(user === null){
            router.push('/');
        }
    },[user]);
    
    const sketch = (p5: P5CanvasInstance) => {
        let score = 0;
        let autoClickerCount = 0;
        let autoClickerPrice = 50;
        let autoClickerIncrement = 1;

        p5.setup = () => {
            p5.createCanvas(400, 400);
            let clickButton = p5.createButton('Click Me');
            clickButton.position(p5.width / 2 - 50, p5.height / 2 + 50);
            clickButton.mousePressed(increaseScore);
            
            let autoClickerButton = p5.createButton('Buy Auto-Clicker');
            autoClickerButton.position(p5.width / 2 - 60, p5.height / 2 + 100);
            autoClickerButton.mousePressed(buyAutoClicker);
        }

        p5.draw = () => {
            p5.background(220);
            p5.textAlign("center", "center");
            p5.textSize(32);
            p5.fill(0);
            p5.text(`Score: ${score}`, p5.width / 2, p5.height / 2 - 50);
            p5.textSize(24);
            p5.text(`Auto-Clickers: ${autoClickerCount}`, p5.width / 2, p5.height / 2);
            p5.text(`Price: ${autoClickerPrice}`, p5.width / 2, p5.height / 2 + 25);
            
            if (autoClickerCount > 0 && p5.frameCount % 60 == 0) {
                score += autoClickerCount * autoClickerIncrement;
            }
        }

        function increaseScore() {
            score++;
        }

        function buyAutoClicker() {
            if (score >= autoClickerPrice) {
                score -= autoClickerPrice;
                autoClickerCount++;
                autoClickerPrice = p5.floor(autoClickerPrice * 1.15);
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