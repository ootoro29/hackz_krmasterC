"use client"
import dynamic from "next/dynamic";
import React from "react";
import { P5WrapperProps } from "@p5-wrapper/react";
//import sketch from "@/components/modules/sketch";
import { P5CanvasInstance } from "@p5-wrapper/react";
import { useRouter } from "next/navigation";

const ReactP5Wrapper = dynamic(
  () => import("@p5-wrapper/react").then((mod) => mod.ReactP5Wrapper as any),
  {
    ssr: false,
  }
) as unknown as React.NamedExoticComponent<P5WrapperProps>;

export default function SketchComponent() {
    const router = useRouter();
    const handleButton = () => {
        router.push("/hogehoge");
    }
    const sketch = (p5: P5CanvasInstance) => {
        p5.setup = () => {
            p5.createCanvas(400, 400);
            p5.background(255,200,200);
        };
        p5.mouseReleased = () => {
            if(40 <= p5.mouseX && p5.mouseX <= 140 && 40 <= p5.mouseY && p5.mouseY <= 80){    
                handleButton();
            }
        };
        let x = 0;
        p5.draw = () => {
            p5.background(255,200,200);
            x ++;
            //p5.circle(p5.mouseX, p5.mouseY, 20);
            p5.rect(40,40,100,40);
            p5.ellipse(x,100+50*Math.sin((x/180.0)*2*Math.PI),50,50);
            if(x > 450)x = -50;
        };
    };

    return (
        <>
        <ReactP5Wrapper sketch={sketch} />
        </>
    );
}