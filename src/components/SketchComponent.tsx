"use client"
import dynamic from "next/dynamic";
import React from "react";
import { P5WrapperProps, Sketch, SketchProps } from "@p5-wrapper/react";

const ReactP5Wrapper = dynamic(
  () => import("@p5-wrapper/react").then((mod) => mod.ReactP5Wrapper as any),
  {
    ssr: false,
  }
) as unknown as React.NamedExoticComponent<P5WrapperProps>;

export default function SketchComponent({sketch}:{sketch:Sketch<SketchProps>}) {    
  
    return (
        <>
        <ReactP5Wrapper sketch={sketch} />
        </>
    );
}
