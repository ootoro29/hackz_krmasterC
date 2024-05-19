"use client"
import SketchComponent from "@/components/SketchComponent";
import { P5CanvasInstance } from "@p5-wrapper/react";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db as DB } from "@/lib/firebase";
import { get, getDatabase, limitToFirst, onChildAdded, onValue, orderByChild, query, ref, remove, update } from "firebase/database";
import TestGame1 from "./gamesComponents/test_game1";
import TestGame2 from "./gamesComponents/test_game2";
import TestGame3 from "./gamesComponents/test_game3";
import TestGame4 from "./gamesComponents/test_game4";
import TestGame5 from "./gamesComponents/test_game5";
import ObstacleGame from "./gamesComponents/obstacle_game";
import AllDirectionsSTG from "./gamesComponents/all_directions_stg";
import FourOpeGame from "./gamesComponents/four_operator";
import SakeCheese from "./gamesComponents/sake_cheese";
import { User, UserScoreInfo } from "@/types/user";
import { doc, getDoc } from "firebase/firestore";
import SakeGame from "./gamesComponents/sakegame";
import TaihoGame from "./gamesComponents/taihou";

export default function Game({params}:{params:{game_id:string}}){
    const user = useAuth();
    const router = useRouter();
    const [Game,SetGame] = useState<number|null>(null);
    const [scoreInfo,setScoreInfo] = useState<UserScoreInfo[]>([]);

    const handleGetUser = async(user_id:string) =>{
        const ref = doc(DB,`users/${user_id}`);
        const snap = await getDoc(ref);
        if(snap.exists()){
            const appUser = (await getDoc(ref)).data() as User;
            return appUser;
        }
        return {id:"",name:""};
    }
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
                if(!game.val()){
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
    
    const [scoreUserInfo,setScoreUserInfo] = useState<UserScoreInfo|null>(null);
    useEffect(() => {
        if(!user)return;
        if(!Game&& Game!=0)return;
        const db = getDatabase();
        const gameScoreRef = query(ref(db,`gameScore/${Game}/`), limitToFirst(100),orderByChild('/score'))
        
        return onChildAdded(gameScoreRef,(snap) => {
            if(!snap.val() || !snap.key)return;
            const uid:string = snap.key;
            
            const orderFunc = (a:UserScoreInfo,b:UserScoreInfo) => {
                if(a.score > b.score){
                    return -1;
                }
                if(a.score < b.score){
                    return 1;
                }
                return 0;
            }
            
            setScoreInfo((prev) => {
                const findex = prev.findIndex((v) => v.UID == uid);
                if(findex == -1){
                    return [...prev,{gameKind:Game,UID:uid,name:snap.val().name,score:snap.val().score}].sort(orderFunc)
                }else{
                    return [...prev.slice(0,findex),{gameKind:Game,UID:uid,name:snap.val().name,score:snap.val().score},...prev.slice(findex+1,prev.length)].sort(orderFunc)
                }
            })
        });
    },[Game])
    useEffect(() => {
        if(!user)return;
        if(!Game && Game!=0)return;
        const db = getDatabase();
        const gameUserScoreRef = ref(db,`gameScore/${Game}/${user.id}`);
        return onValue(gameUserScoreRef,async(snap) => {
            if(!snap.val() || !snap.key){
                await update(gameUserScoreRef,{
                    name:user.name,
                    score:0
                });
                setScoreUserInfo({gameKind:Game,UID:user.id,name:user.name,score:0});
                return;
            }
            const uid:string = user.id;
            setScoreUserInfo({gameKind:Game,UID:uid,name:snap.val().name,score:snap.val().score});
        },{onlyOnce:true})
    },[Game])
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
            <div>
                {
                    (Game == 0)&&
                    <ObstacleGame kind = {Game} scoreUserInfo={scoreUserInfo} setScoreUserInfo={setScoreUserInfo} scoreInfo={scoreInfo} setScoreInfo={setScoreInfo} />
                }
                {
                    (Game == 1)&&
                    <AllDirectionsSTG kind = {Game} scoreUserInfo={scoreUserInfo} setScoreUserInfo={setScoreUserInfo} scoreInfo={scoreInfo} setScoreInfo={setScoreInfo}/>
                }
                {
                    (Game == 2)&&
                    <FourOpeGame kind = {Game} scoreUserInfo={scoreUserInfo} setScoreUserInfo={setScoreUserInfo} scoreInfo={scoreInfo} setScoreInfo={setScoreInfo}/>
                }
                {
                    (Game == 3)&&
                    <SakeCheese kind = {Game} scoreUserInfo={scoreUserInfo} setScoreUserInfo={setScoreUserInfo} scoreInfo={scoreInfo} setScoreInfo={setScoreInfo}/>
                }
                {
                    (Game == 4)&&
                    <SakeGame kind = {Game} scoreUserInfo={scoreUserInfo} setScoreUserInfo={setScoreUserInfo} scoreInfo={scoreInfo} setScoreInfo={setScoreInfo}/>
                }
                {
                    (Game == 5)&&
                    <TaihoGame kind = {Game} scoreUserInfo={scoreUserInfo} setScoreUserInfo={setScoreUserInfo} scoreInfo={scoreInfo} setScoreInfo={setScoreInfo}/>
                }
                <div style={{position:"absolute",right:20,top:0,background:"FF0000"}}>
                    {
                        scoreInfo.map((info,i) => {
                            let cnt = 0;
                            if(info.UID == user.id){
                                return (
                                    <div key={i}>
                                        <p>{info.name}</p>
                                        <p>{info.score}</p>
                                    </div>
                                );
                            }else{
                                cnt++;
                                return (
                                    <div key={i}>
                                        <p>{`ユーザー${cnt}`}</p>
                                        <p>{info.score}</p>
                                    </div>
                                );
                            }
                        })
                    }
                </div>
            </div>
        );
    }
}