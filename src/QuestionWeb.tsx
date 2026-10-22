import { useEffect, useMemo, useRef } from "react";
import { Crosshair, Expand, Minus, Plus } from "lucide-react";
import { questionById, type World } from "./questions";
import { visibleWeb, type WebState } from "./web-state";
import { layoutWeb, WEB_SIZE, webBounds, type Point } from "./web-layout";
import "./question-web.css";

type Camera = { x: number; y: number; zoom: number };
export default function QuestionWeb({ world, state, onSelect, onAnswer, hovered }: {
  world: World; state: WebState; onSelect: (id: string) => void;
  onAnswer: (from: string, choice: number) => void; hovered: number | null;
}) {
  const viewport = useRef<HTMLDivElement>(null), plane = useRef<HTMLDivElement>(null), readout = useRef<HTMLSpanElement>(null);
  const controls = useRef({ fit: () => {}, center: (_id: string) => {}, zoom: (_factor: number) => {} });
  const camera = useRef<Camera>({ x: 0, y: 0, zoom: 1 });
  const graph = useMemo(() => visibleWeb(world, state), [world, state]);
  const positions = useMemo(() => layoutWeb(world), [world]);
  const visibleKey = graph.nodes.slice().sort().join("|");
  const latest = useRef({ state, graph }); latest.current = { state, graph };
  useEffect(() => {
    const container = viewport.current!, content = plane.current!;
    let frame = 0, disposed = false, moved = false;
    const pointers = new Map<number, Point>();
    let previousDistance = 0;
    const render = () => { frame = 0; if (disposed) return; const c = camera.current; content.style.transform = `translate3d(${c.x}px,${c.y}px,0) scale(${c.zoom})`; readout.current!.textContent = `${Math.round(c.zoom * 100)}%`; };
    const update = (c: Camera) => { camera.current = c; if (!frame) frame = requestAnimationFrame(render); };
    const fit = () => {
      const bounds = webBounds(latest.current.graph.nodes, positions);
      const zoom = Math.max(.15, Math.min(1, (container.clientWidth - 40) / bounds.width, (container.clientHeight - 90) / bounds.height));
      update({ x: container.clientWidth / 2 - bounds.x * zoom, y: container.clientHeight / 2 - bounds.y * zoom + 5, zoom });
    };
    const zoomAt = (factor: number, x = container.clientWidth / 2, y = container.clientHeight / 2) => {
      const old = camera.current, zoom = Math.max(.15, Math.min(1.8, old.zoom * factor));
      update({ zoom, x: x - (x - old.x) * zoom / old.zoom, y: y - (y - old.y) * zoom / old.zoom });
    };
    const center = (id: string) => { const p = positions.get(id)!; const zoom = Math.max(.65, camera.current.zoom); update({ zoom, x: container.clientWidth / 2 - p.x * zoom, y: container.clientHeight / 2 - p.y * zoom }); };
    controls.current = { fit, center, zoom: factor => zoomAt(factor) };
    const wheel = (e: WheelEvent) => { e.preventDefault(); const r = container.getBoundingClientRect(); zoomAt(Math.exp(-e.deltaY * .0015), e.clientX - r.left, e.clientY - r.top); };
    const down = (e: PointerEvent) => {
      if (e.button !== 0 || (e.target as Element).closest("button")) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); container.setPointerCapture(e.pointerId); moved = false;
      container.classList.add("is-panning");
      if (pointers.size === 2) { const [a,b] = [...pointers.values()]; previousDistance = Math.hypot(a.x-b.x,a.y-b.y); }
    };
    const move = (e: PointerEvent) => {
      const previous = pointers.get(e.pointerId); if (!previous) return;
      const oldCenter = [...pointers.values()].reduce((s,p) => ({ x:s.x+p.x/pointers.size,y:s.y+p.y/pointers.size }),{x:0,y:0});
      pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if (Math.abs(previous.x-e.clientX)+Math.abs(previous.y-e.clientY)>2) moved = true;
      if (pointers.size === 2) {
        const [a,b] = [...pointers.values()], distance = Math.hypot(a.x-b.x,a.y-b.y), r = container.getBoundingClientRect();
        if (previousDistance > 0) zoomAt(distance / previousDistance, oldCenter.x-r.left,oldCenter.y-r.top);
        previousDistance = distance;
        update({...camera.current,x:camera.current.x+(a.x+b.x)/2-oldCenter.x,y:camera.current.y+(a.y+b.y)/2-oldCenter.y});
      } else update({...camera.current,x:camera.current.x+e.clientX-previous.x,y:camera.current.y+e.clientY-previous.y});
    };
    const up = (e: PointerEvent) => { pointers.delete(e.pointerId); previousDistance=0; if (!pointers.size) container.classList.remove("is-panning"); };
    const click = (e: MouseEvent) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved=false; } };
    const key = (e: KeyboardEvent) => {
      if (e.target !== container) return;
      if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","+","=","-","Home"].includes(e.key)) e.preventDefault();
      if (e.key === "Home") fit();
      else if (e.key === "+" || e.key === "=") zoomAt(1.2);
      else if (e.key === "-") zoomAt(1/1.2);
      else if (e.key.startsWith("Arrow")) update({...camera.current,x:camera.current.x+(e.key==="ArrowLeft"?60:e.key==="ArrowRight"?-60:0),y:camera.current.y+(e.key==="ArrowUp"?60:e.key==="ArrowDown"?-60:0)});
    };
    container.addEventListener("wheel",wheel,{passive:false}); container.addEventListener("pointerdown",down); container.addEventListener("pointermove",move); container.addEventListener("pointerup",up); container.addEventListener("pointercancel",up); container.addEventListener("click",click,true); container.addEventListener("keydown",key);
    const observer = new ResizeObserver(fit);observer.observe(container);fit();
    return () => { disposed=true;cancelAnimationFrame(frame);observer.disconnect();container.removeEventListener("wheel",wheel);container.removeEventListener("pointerdown",down);container.removeEventListener("pointermove",move);container.removeEventListener("pointerup",up);container.removeEventListener("pointercancel",up);container.removeEventListener("click",click,true);container.removeEventListener("keydown",key); };
  }, [positions]);
  useEffect(() => { controls.current.fit(); }, [visibleKey]);

  return <div className="web-map-shell">
    <div className="web-map-top"><span><i/> YOUR GROWING WEB</span><span>{graph.discovered.size} QUESTIONS · {state.edges.length} CONNECTIONS</span></div>
    <div ref={viewport} className="web-viewport" role="region" aria-label="Interactive question web. Drag to pan, scroll or pinch to zoom. Arrow keys pan; plus and minus zoom; Home fits the web." tabIndex={0}>
      <div ref={plane} className="web-plane" style={{width:WEB_SIZE,height:WEB_SIZE}}>
        <svg className="web-connections" width={WEB_SIZE} height={WEB_SIZE} aria-hidden="true">
          <defs><marker id="web-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke="currentColor"/></marker></defs>
          {[270,540,810,1080,1350].map(radius => <circle key={radius} className="web-ring" cx={WEB_SIZE/2} cy={WEB_SIZE/2} r={radius}/>)}
          {graph.edges.map(edge => {
            const a=positions.get(edge.from)!,b=positions.get(edge.to)!;
            const traversed=state.edges.includes(edge.id), active=edge.from===state.selected && (hovered===null||hovered===edge.choice);
            const bend = ((edge.choice-1)*30), mx=(a.x+b.x)/2+bend,my=(a.y+b.y)/2-bend;
            return <g key={edge.id} className={`web-edge ${traversed?'is-traversed':''} ${active?'is-active':''}`} data-edge-id={edge.id}>
              <path d={`M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`}/>
              {active && <g className="web-edge-letter" transform={`translate(${a.x+(b.x-a.x)*.38},${a.y+(b.y-a.y)*.38})`}><circle r="12"/><text textAnchor="middle" dominantBaseline="central">{String.fromCharCode(65+edge.choice)}</text></g>}
            </g>;
          })}
        </svg>
        {graph.nodes.map(id=>{
          const q=questionById.get(id)!, p=positions.get(id)!, known=graph.discovered.has(id), selected=state.selected===id;
          const incoming=graph.edges.find(e=>e.to===id&&e.from===state.selected)||graph.edges.find(e=>e.to===id);
          const answered=state.edges.filter(e=>e.startsWith(`${id}:`)).length;
          return <button key={id} data-node-id={id} className={`web-node ${selected?'is-selected':''} ${known?'is-discovered':'is-preview'} topic-${q.world}`} style={{left:p.x,top:p.y}} aria-pressed={selected} aria-label={known?`Open question: ${q.title}`:`Explore question: ${q.title}`} onFocus={e=>{if(e.currentTarget.matches(':focus-visible'))controls.current.center(id);}} onClick={()=>known?onSelect(id):incoming&&onAnswer(incoming.from,incoming.choice)}>
            <span className="web-node-top"><i/>{id===world?'STARTING QUESTION':known?q.world.toUpperCase():'UNEXPLORED BRANCH'}<span>{selected?'●':known?`${answered}/3`:'+'}</span></span>
            <strong>{q.title}</strong><span className="web-node-bottom">{selected?'YOU ARE HERE':known?'RETURN & BRANCH AGAIN':'CHOOSE THIS DIRECTION'}<span>↗</span></span>
          </button>;
        })}
      </div>
    </div>
    <div className="web-map-bottom"><div className="web-legend"><span><i/> Answered</span><span><i/> Still to explore</span></div><div className="web-camera-controls"><button aria-label="Zoom out" onClick={()=>controls.current.zoom(1/1.2)}><Minus size={15}/></button><span ref={readout} aria-live="off">100%</span><button aria-label="Zoom in" onClick={()=>controls.current.zoom(1.2)}><Plus size={15}/></button><b/><button aria-label="Center selected question" title="Center selected question" onClick={()=>controls.current.center(state.selected)}><Crosshair size={15}/></button><button aria-label="Fit entire web" title="Fit entire web" onClick={()=>controls.current.fit()}><Expand size={15}/></button></div></div>
    <span className="web-gesture-hint">DRAG TO MOVE · SCROLL OR PINCH TO ZOOM</span>
  </div>;
}
