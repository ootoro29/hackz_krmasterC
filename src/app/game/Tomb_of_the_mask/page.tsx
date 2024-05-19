"use client"

import SketchComponent from "@/components/SketchComponent";
import { P5CanvasInstance } from "@p5-wrapper/react";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { promises as fs } from "promises";
import type { NextApiRequest, NextApiResponse } from "next"

type ResponseData = {
    StateMat: number[]
}

export async function handler(
    idx: number,
) {
    const data = await fs.readFile("/ToM_Stages/Stage" + String(idx) + ".json");
    console.log(data);
    return data.toJSON();
}



export default function Game() {
    const user = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (user === null) {
            router.push('/');
        }
    }, [user]);

    const sketch = (p5: P5CanvasInstance) => {
        let ROW = 30;
        let COL = 21;
        let SqSize = 50;
        let bIsInTransition = false;
        let Dist = 0;
        let Score = 0;
        let EditMode = true;
        let bIsPlayerStartSet = false;
        let bIsExitSet = false;
        let GameEnd = false;
        const FontSize = 20;

        class Field {
            row: number;
            col: number;
            SqSize: number;
            EditSqSize: number;
            State: number[][];
            constructor(row:number, col:number, sqSize:number) {
                this.row = row; // number of square
                this.col = col;
                this.SqSize = sqSize;
                this.EditSqSize = Math.min(p5.width / col, p5.height / row);
                this.State = [];
                for (let i = 0; i < this.row; ++i) {
                    this.State[i] = [];
                    for (let j = 0; j < this.col; ++j) {
                        this.State[i][j] = -1;
                    }
                }
            }

            SetColor(stateCode:number, xIndex:number, yIndex:number) {
                if (stateCode == -1) {
                    p5.stroke(50);
                    p5.strokeWeight(3);
                    p5.fill(100);
                }
                else {
                    p5.noStroke();
                    if ((xIndex + yIndex) % 2 == 0) {
                        p5.fill(150, 0, 0);
                    }
                    else {
                        p5.fill(100, 50, 0);
                    }
                }
            }

            Display(playerX:number, playerY:number) {
                for (let i = 0; i < this.row; ++i) {
                    for (let j = 0; j < this.col; ++j) {
                        let x = Math.floor(p5.width / 2) + this.SqSize * (j - playerX);
                        let y = Math.floor(p5.height / 2) + this.SqSize * (i - playerY);
                        this.SetColor(this.State[i][j], i, j);
                        p5.square(x, y, this.SqSize);

                        if (this.State[i][j] == 1) {
                            p5.stroke(150, 125, 0);
                            p5.fill(200, 150, 0);
                            p5.circle(x, y, Math.floor(this.SqSize * 0.8));
                        }
                        else if (this.State[i][j] == 3) {
                            this.SetState(j, i, 0);
                        }
                    }
                }
            }

            Display_Edit() {
                for (let i = 0; i < this.row; ++i) {
                    for (let j = 0; j < this.col; ++j) {
                        let x = this.EditSqSize * j + this.EditSqSize / 2;
                        let y = this.EditSqSize * i + this.EditSqSize / 2;
                        if (this.State[i][j] == 0 || this.State[i][j] == 1) {
                            p5.fill(255);
                        }
                        else if (this.State[i][j] == -1) {
                            p5.fill(150);
                        }
                        else if (this.State[i][j] == 3) {
                            p5.fill(255, 0, 0);
                        }
                        else if (this.State[i][j] == 4) {
                            p5.fill(0, 255, 0);
                        }
                        p5.square(x, y, this.EditSqSize);
                    }
                }
            }

            TraceField(dir:number, xIdx:number, yIdx:number) {
                if (dir == 3) {
                    for (let i = yIdx; i > -1; --i) {
                        if (this.State[i][xIdx] == -1) {
                            return yIdx - i - 1;
                        }
                        else if (this.State[i][xIdx] == 4) {
                            return yIdx - i;
                        }
                    }
                }
                else if (dir == 1) {
                    for (let i = yIdx; i < this.row; ++i) {
                        if (this.State[i][xIdx] == -1) {
                            return i - yIdx - 1;
                        }
                        else if (this.State[i][xIdx] == 4) {
                            return i - yIdx;
                        }
                    }
                }
                else if (dir == 2) {
                    for (let i = xIdx; i > -1; --i) {
                        if (this.State[yIdx][i] == -1) {
                            return xIdx - i - 1;
                        }
                        else if (this.State[yIdx][i] == 4) {
                            return xIdx - i;
                        }
                    }
                }
                else if (dir == 0) {
                    for (let i = xIdx; i < this.col; ++i) {
                        if (this.State[yIdx][i] == -1) {
                            return i - xIdx - 1;
                        }
                        else if (this.State[yIdx][i] == 4) {
                            return i - xIdx;
                        }
                    }
                }

                return 0;
            }

            BlockFrame() {
                for (let i = 0; i < Math.max(this.row, this.col); ++i) {
                    if (i < this.row) {
                        this.State[i][0] = -1;
                        this.State[i][this.col - 1] = -1;
                    }
                    if (i < this.col) {
                        this.State[0][i] = -1;
                        this.State[this.row - 1][i] = -1;
                    }
                }
            }

            SaveStage() {
                if (EditMode == true) {
                    let StageObj = {};
                    p5.saveJSON(StageObj, "assets/stages/stage.json");
                }
            }

            LoadStage() {
                if (EditMode == true) {
                    let StageObj = {};
                    StageObj = handler(0);
                    this.row = this.State.length;
                    this.col = this.State[0].length;
                }
            }

            SetState(xIdx:number, yIdx:number, state:number) {
                this.State[yIdx][xIdx] = state;
            }

            GetState(xIdx:number, yIdx:number) {
                return this.State[yIdx][xIdx];
            }

            GetSqSize() {
                return this.SqSize;
            }

            GetEditSqSize() {
                return this.EditSqSize;
            }

            GetSize() {
                return p5.createVector(this.col, this.row);
            }
        }

        class Player {
            x: number;
            y: number;
            Direction: number;
            m_Field: Field;
            constructor(xIdx:number, yIdx:number, dir:number, field:Field) {
                this.x = xIdx;
                this.y = yIdx;
                this.Direction = dir;
                this.m_Field = field;
            }

            DrawPlayer() {
                let PlayerRadius = this.m_Field.GetSqSize() / 2;
                p5.push();
                p5.translate(p5.width / 2, p5.height / 2);
                p5.rotate(p5.HALF_PI * this.Direction);
                let v1 = p5.createVector(PlayerRadius, 0);
                let v2 = p5.createVector(-PlayerRadius, -PlayerRadius);
                let v3 = p5.createVector(-PlayerRadius, PlayerRadius);
                p5.noStroke();
                p5.fill(255);
                p5.triangle(v1.x, v1.y, v2.x, v2.y, v3.x, v3.y);
                p5.pop();
            }
        }

        let Fd : Field;
        let Pl : Player;

        p5.preload = () => {
            // let StageObj = loadJSON("assets\stages\stage.json");
            // ROW = StageObj.StateMat.length;
            // COL = StageObj.StateMat[0].length;
            // Fd = new Field(ROW + 2, COL + 2, SqSize);
        }

        p5.setup = () => {
            p5.createCanvas(500, 500);
            Fd = new Field(ROW + 2, COL + 2, SqSize);
            p5.textSize(FontSize);
            p5.textAlign(p5.RIGHT, p5.CENTER);
            p5.rectMode(p5.CENTER);
        }

        p5.draw = () => {
            p5.background(10);

            /* stroke(255);
            strokeWeight(5);
            let ULX = width / 2 - PlayerX * SqSize - SqSize * 0.5;
            let ULY = height / 2 - PlayerY * SqSize - SqSize * 0.5;
            let BRX = width / 2 + (col - PlayerX) * SqSize + SqSize * 0.5;
            let BRY = height / 2 + (row - PlayerY) * SqSize + SqSize * 0.5;
            line(ULX, ULY, ULX, BRY);
            line(ULX, ULY, BRX, ULY);
            line(BRX, ULY, BRX, BRY);
            line(ULX, BRY, BRX, BRY); */

            if (EditMode && !GameEnd) {
                Fd.Display_Edit();
            }
            else if (!GameEnd) {
                if (bIsInTransition) {
                    if (Dist > 0) {
                        if (Pl.Direction == 3) {
                            --Pl.y;
                            --Dist;
                        }
                        else if (Pl.Direction == 1) {
                            ++Pl.y;
                            --Dist;
                        }
                        else if (Pl.Direction == 2) {
                            --Pl.x;
                            --Dist;
                        }
                        else if (Pl.Direction == 0) {
                            ++Pl.x;
                            --Dist;
                        }

                        if (Fd.GetState(Pl.x, Pl.y) == 1) {
                            ++Score;
                            Fd.SetState(Pl.x, Pl.y, 0);
                        }
                        else if (Fd.GetState(Pl.x, Pl.y) == 4) {
                            GameEnd = true;
                        }
                    }
                    else {
                        bIsInTransition = false;
                        Pl.Direction = (Pl.Direction + 2) % 4;
                    }
                }

                Fd.Display(Pl.x, Pl.y);

                Pl.DrawPlayer();

                let ScoreX = p5.width * 7 / 8;
                let ScoreY = p5.height * 7 / 8;
                p5.noStroke();
                p5.fill(255);
                p5.text(p5.str(Score), ScoreX, ScoreY);
            }
            else // Game has finished
            {
                p5.textSize(80);
                p5.textAlign(p5.CENTER);
                p5.text("Congrats!", p5.width / 2, p5.height / 3);
                let Result = "Score : ";
                p5.text(Result + p5.str(Score), p5.width / 2, p5.height * 2 / 3);
            }
        }

        p5.keyPressed = () => {
            if (p5.keyIsPressed && !bIsInTransition) {
                if (!EditMode) {
                    let dir = -1;
                    if (p5.key == 'w' || p5.key == 'W') {
                        dir = 3;
                    }
                    else if (p5.key == 's' || p5.key == 'S') {
                        dir = 1;
                    }
                    else if (p5.key == 'a' || p5.key == 'A') {
                        dir = 2;
                    }
                    else if (p5.key == 'd' || p5.key == 'D') {
                        dir = 0;
                    }

                    Dist = Fd.TraceField(dir, Pl.x, Pl.y);
                    if (Dist != 0) {
                        Pl.Direction = dir;
                        bIsInTransition = true;
                    }
                    else if (dir != -1) {
                        Pl.Direction = (dir + 2) % 4;
                    }
                }
                else
                {
                    if (p5.keyCode == p5.ENTER && bIsExitSet && bIsPlayerStartSet) {
                        EditMode = false;
                    }
                    else if ((p5.key == 's' || p5.key == 'S')
                        && bIsExitSet && bIsPlayerStartSet) {
                        Fd.SaveStage();
                    }
                    else if ((p5.key == 'l' || p5.key == 'L')) {
                        Fd.LoadStage();
                        bIsExitSet = true;
                        bIsPlayerStartSet = true;
                    }
                }
            }
        }

        p5.mousePressed = () => {
            if (!EditMode) {
                return;
            }

            if (p5.mouseButton == p5.LEFT) {
                let Idx_X = p5.floor(p5.mouseX / Fd.GetEditSqSize());
                let Idx_Y = p5.floor(p5.mouseY / Fd.GetEditSqSize());
                Fd.SetState(Idx_X, Idx_Y, -Fd.GetState(Idx_X, Idx_Y));

                if (Idx_X <= 0 || Idx_X >= Fd.GetSize().x - 1
                    || Idx_Y <= 0 || Idx_Y >= Fd.GetSize().y - 1) {
                    Fd.BlockFrame();
                    Fd.SetState(Idx_X, Idx_Y, 4); // stage exit
                    bIsExitSet = true;
                }
            }
            else if (p5.mouseButton == p5.RIGHT) {
                let Idx_X = p5.floor(p5.mouseX / Fd.GetEditSqSize());
                let Idx_Y = p5.floor(p5.mouseY / Fd.GetEditSqSize());
                if (Fd.GetState(Idx_X, Idx_Y) != -1 && !bIsPlayerStartSet) {
                    Pl = new Player(Idx_X, Idx_Y, 0, Fd);
                    bIsPlayerStartSet = true;
                    Fd.SetState(Idx_X, Idx_Y, 3);
                }
                else if (bIsPlayerStartSet) {
                    Fd.SetState(Pl.x, Pl.y, 1);
                    Pl.x = Idx_X;
                    Pl.y = Idx_Y;
                    Fd.SetState(Idx_X, Idx_Y, 3);
                }
            }
        }
    };

    if (user) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                <p>ゲーム画面</p>
                <SketchComponent sketch={sketch}></SketchComponent>
            </div>
        );
    }
}