import { lazy, Suspense, useState } from 'react';
import QuizGame from './QuizGame';
const Expedition=lazy(()=>import('./Expedition'));
export default function PlayGame(props:{world:string;onHome:()=>void;onExplore:()=>void}){
 const [adventure,setAdventure]=useState(()=>new URLSearchParams(window.location.hash.split('?')[1]||'').get('adventure')==='1');
 return adventure?<Suspense fallback={<div className="cinema-loading">WAKING THE WEB</div>}><Expedition {...props}/></Suspense>:<QuizGame {...props} onAdventure={()=>setAdventure(true)}/>;
}
