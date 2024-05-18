"use client"
import SketchComponent from "@/components/SketchComponent";
import { P5CanvasInstance } from "@p5-wrapper/react";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { get, getDatabase, onValue, ref, remove, update } from "firebase/database";
import TestGame1 from "./gamesComponents/test_game1";
import TestGame2 from "./gamesComponents/test_game2";
import TestGame3 from "./gamesComponents/test_game3";
import TestGame4 from "./gamesComponents/test_game4";
import TestGame5 from "./gamesComponents/test_game5";
import ObstacleGame from "./gamesComponents/obstacle_game";

export default function Game({params}:{params:{game_id:string}}){
    const user = useAuth();
    const router = useRouter();
    const [Game,SetGame] = useState<number|null>(null);
    useEffect(() => {
        if(user === null){
            router.push('/');
            return;
        }
        if(Game)return;
        if(!user)return;
        const db = getDatabase();
        const userInfo = ref(db,`userInfo/${user.id}`);
        return onValue(userInfo,async(snap) => {
            if(Game)return;
            if(!snap.val()){
                router.push('/game');
                return;
            }
            if(snap.val().game != params.game_id){
                router.push('/game');
                return;
            }
            const gameRef = ref(db,`userGame/${snap.val().game}`);
            await get(gameRef).then(async(game) => {
                if(!game){
                    router.push('/game');
                    return;
                }
                if(game.val().user != user.id){
                    router.push('/game');
                    return;
                }
                SetGame(game.val().kind);
            })
            await remove(gameRef);
            await update(userInfo,{
                game:""
            });
        },{onlyOnce:true});
    },[user]);
    if(user && Game !== null){
        const sketch = (p5: P5CanvasInstance) => {

            p5.setup = () => {
                p5.createCanvas(400,400);
            }
    
            p5.draw = () => {
                p5.text(Game,100,100);
            }

        };
        return(        
            <div style={{display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column"}}>
                <p>ゲーム画面</p>
                {
                    (Game == 0)&&
                    <ObstacleGame/>
                }
                {
                    (Game == 1)&&
                    <TestGame2/>
                }
                {
                    (Game == 2)&&
                    <TestGame3/>
                }
                {
                    (Game == 3)&&
                    <TestGame4/>
                }
                {
                    (Game == 4)&&
                    <TestGame5/>
                }
            </div>
        );
    }
}