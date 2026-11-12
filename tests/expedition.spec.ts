import { test, expect, type Page } from '@playwright/test';
import { ability, activeLinks, bargain, dailySeed, makeChart, moveCost, newExpedition, nextThreat, resolveEncounter, travel, type Chart, type Expedition } from '../src/expedition-engine';

function route(chart:Chart, run:Expedition, target:number):number[] {
  const queue = [{node:run.node,path:[] as number[],cost:0}], visited=new Set<number>();
  while(queue.length){queue.sort((a,b)=>a.cost-b.cost);const item=queue.shift()!;if(item.node===target)return item.path;if(visited.has(item.node))continue;visited.add(item.node);for(const [a,b] of activeLinks(chart,run)){const n=a===item.node?b:b===item.node?a:-1;if(n>=0&&!visited.has(n))queue.push({node:n,path:[...item.path,n],cost:item.cost+moveCost(chart,run,n)+(n===run.threat?4:0)});}}
  throw new Error('No route');
}
function winningTrail(seed:string,hard=false):{run:Expedition;steps:{target:number;shield:boolean;collect:boolean;scan:boolean;reroute:boolean}[]} {
  const chart=makeChart(seed), [a,b,c]=chart.fragments;
  for(const order of [[a,b,c],[a,c,b],[b,a,c],[b,c,a],[c,a,b],[c,b,a]]){
    let run=newExpedition('challenge','scout',hard);const steps:{target:number;shield:boolean;collect:boolean;scan:boolean;reroute:boolean}[]=[];
    for(const target of [...order,18]){
      if(run.status!=='playing')break;
      const reroute=target===18;
      if(reroute)run=ability(chart,run,'reroute');
      const path=route(chart,run,target);
      for(const n of path){
        const shield=(chart.nodes[n].kind==='hazard'||n===run.threat||run.moves%3===2&&n===nextThreat(chart,run))&&run.shield>0&&!run.armed;
        if(shield)run=ability(chart,run,'shield');
        run=travel(chart,run,n);let collect=false,scan=false;
        if(run.event!==null)run=bargain(run,'leave');
        if(run.encounter!==null){collect=true;run=resolveEncounter(run,chart,'Test discovery');if(run.fragments.length===1){run=ability(chart,run,'scan');scan=true;}}
        steps.push({target:n,shield,collect,scan,reroute:reroute&&n===path[0]});
        if(run.status!=='playing')break;
      }
    }
    if(run.status==='won')return {run,steps};
  }
  throw new Error(`No planned winning route for ${seed}, hard=${hard}`);
}

test('seeded pieces are reproducible, varied and offer a winning expedition across sampled charts',()=>{
  expect(makeChart('REPLAY-42')).toEqual(makeChart('REPLAY-42'));
  expect(makeChart('REPLAY-42').links).not.toEqual(makeChart('OTHER-43').links);
  for(let i=0;i<75;i++){expect(winningTrail(`VERIFY-${i}`).run.status).toBe('won');expect(winningTrail(`VERIFY-${i}`,true).run.status).toBe('won');}
});

test('abilities, threat prediction, failure and challenge dates have explicit rules',()=>{
  const chart=makeChart('RULES');let run=newExpedition('challenge','scout');
  const scanned=ability(chart,run,'scan');expect(scanned.revealed).toContain(14);expect(scanned.scan).toBe(2);expect(scanned.energy).toBe(run.energy);
  expect(ability(chart,scanned,'scan').energy).toBe(scanned.energy);
  run={...run,node:2,energy:4};const shielded=ability(chart,run,'shield');expect(travel(chart,shielded,3).energy).toBe(3);expect(travel(chart,run,3).energy).toBe(1);
  const doomed=travel(chart,{...run,energy:2},3);expect(doomed.status).toBe('lost');expect(doomed.cause).toContain('needed 3 energy');
  const awake={...newExpedition('challenge','scout'),node:0,threat:10,moves:2};const predicted=nextThreat(chart,awake);expect(travel(chart,awake,1).threat).toBe(predicted);
  expect(dailySeed(new Date('2026-11-12T23:30:00Z'))).toBe('DAILY-2026-11-13');
});

async function solveEncounter(page:Page,stage:number,seed:string){
  const dialog=page.getByRole('dialog');
  if(stage===0){await page.getByLabel('Habitat depth').fill('2800');await page.getByLabel('Vent flow').fill('55');await page.getByRole('button',{name:'Connect chemical energy'}).click();await page.getByRole('button',{name:'Stabilise habitat'}).click();}
  if(stage===1){const first=(seed.charCodeAt(0)+stage)%4;for(const n of [0,2,1,3].map(v=>(first+v)%4))await page.getByRole('button',{name:`Signal ${n+1}`,exact:true}).click();}
  if(stage===2){await page.getByRole('button',{name:'2 CLOSED'}).click();await page.getByRole('button',{name:'3 CLOSED'}).click();await page.getByRole('button',{name:'Test oxygen route'}).click();}
  await expect(dialog).toContainText('KNOWLEDGE FRAGMENT RECOVERED');await expect(dialog.getByRole('link',{name:'Read the source'})).toHaveAttribute('href',/^https:/);
  await page.getByRole('button',{name:'Take the fragment'}).click();
}

test('a full Ocean expedition connects challenges, discoveries, abilities, finale and a saved record',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  const seed='ABYSS-001',plan=winningTrail(seed);await page.goto(`/#play/ocean?seed=${seed}`);await page.getByRole('button',{name:'Begin expedition'}).click();
  let collected=0;
  for(const step of plan.steps){
    if(step.reroute)await page.getByRole('button',{name:/Reroute ability/}).click();
    if(step.shield)await page.getByRole('button',{name:/Shield ability/}).click();
    await page.getByRole('button',{name:new RegExp(`, node ${step.target}$`)}).click();
    if(await page.locator('.exp-bargain-options').isVisible())await page.getByRole('button',{name:/Leave it alone/}).click();
    if(step.collect)await solveEncounter(page,collected++,seed);
    if(step.scan)await page.getByRole('button',{name:/Scan ability/}).click();
  }
  await expect(page.getByRole('heading',{name:'You brought the light back.'})).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('rh-expedition-records')||'[]'));expect(saved.at(-1).won).toBe(true);expect(saved.at(-1).fragments).toBe(3);
  await page.getByRole('button',{name:'Change route / kit'}).click();await expect(page.getByLabel('Starting kit').locator('option[value=guardian]')).toBeEnabled();
  await page.reload();await expect(page.locator('.exp-mastery')).toContainText('1 successful expeditions');expect(errors).toEqual([]);
});

test('practice undo restores energy, challenge sharing keeps rules, mobile panels fit',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/#play/ocean?seed=MOBILE-42&mode=practice&hard=1&kit=guardian');
  await expect(page.getByLabel('Challenge code')).toHaveValue('MOBILE-42');await expect(page.getByLabel('Starting kit')).toHaveValue('guardian');await page.getByRole('button',{name:'Begin expedition'}).click();
  await page.getByRole('button',{name:/Drift junction.*node 1$/}).click();if(await page.locator('.exp-bargain-options').isVisible())await page.getByRole('button',{name:/Leave it alone/}).click();await page.getByRole('button',{name:'Undo',exact:true}).click();
  await expect(page.getByRole('button',{name:/The bell, your position/})).toBeVisible();
  await page.getByRole('button',{name:/Scan ability/}).click();await expect(page.getByRole('button',{name:/Uncharted signal/})).toBeVisible();
  await expect(page).toHaveURL(/seed=MOBILE-42&hard=1&kit=guardian&mode=practice/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('world encounters have distinct playable objectives',async({page})=>{
  for(const world of ['forest','dreams','football','music']){
    const chart=makeChart('WORLD-42');await page.goto(`/#play/${world}?seed=WORLD-42`);await page.getByRole('button',{name:'Begin expedition'}).click();
    const path=route(chart,newExpedition('challenge','scout'),chart.fragments[0]);for(const node of path){await page.getByRole('button',{name:new RegExp(`, node ${node}$`)}).click();if(await page.locator('.exp-bargain-options').isVisible())await page.getByRole('button',{name:/Leave it alone/}).click();}
    if(world==='forest'){for(const i of [1,2,3])await page.getByRole('button',{name:`Toggle link ${i}`}).click();await page.getByRole('button',{name:'Test the network'}).click();}
    if(world==='football'){for(const i of [1,2,3])await page.getByLabel(`Receiver ${i} position`).fill('25');await page.getByRole('button',{name:'Play the pass'}).click();}
    if(world==='dreams'||world==='music'){const first='WORLD-42'.charCodeAt(0)%4;for(const n of [0,2,1].map(v=>(first+v)%4))await page.getByRole('button',{name:`Signal ${n+1}`,exact:true}).click();}
    await expect(page.getByRole('dialog')).toContainText('KNOWLEDGE FRAGMENT RECOVERED');
    await page.goto('about:blank');
  }
});

test('failure explains the fatal move; challenge retries and practice can undo it',async({page})=>{
  for(const mode of ['challenge','practice']){
    await page.goto('about:blank');await page.goto(`/#play/ocean?seed=FAILURE-42&mode=${mode}`);await page.getByRole('button',{name:'Begin expedition'}).click();
    for(let i=0;i<16;i++){
      if(await page.getByRole('heading',{name:'The deep keeps its secrets.'}).isVisible())break;
      const node=i%2===0?3:0;await page.getByRole('button',{name:new RegExp(`, node ${node}$`)}).click();
    }
    await expect(page.getByRole('heading',{name:'The deep keeps its secrets.'})).toBeVisible();await expect(page.getByRole('dialog')).toContainText('exhausted your energy');
    if(mode==='practice'){await page.getByRole('button',{name:'Undo fatal move'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.getByRole('button',{name:/your position, node/})).toBeVisible();}
    else{await expect(page.getByRole('button',{name:'Undo fatal move'})).toHaveCount(0);await page.getByRole('button',{name:'Retry this expedition'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);}
  }
});
