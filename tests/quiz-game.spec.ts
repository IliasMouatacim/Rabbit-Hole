import { test, expect } from '@playwright/test';
import { levelQuestions, quizPool, quizWorlds } from '../src/quiz-data';

test('every world has five complete levels of distinct factual questions',()=>{
 for(const world of quizWorlds){const prompts=new Set<string>();for(let level=0;level<5;level++){const questions=levelQuestions(world.id,level);expect(questions).toHaveLength(3);for(const q of questions){expect(new Set(q.answers).size).toBe(4);expect(q.answers).toContain(q.correct);expect(q.fact.length).toBeGreaterThan(20);prompts.add(q.prompt);}}expect(prompts.size).toBe(15);}
});

async function shownQuestion(page: import('@playwright/test').Page, world: string) {
 const heading = page.locator('.quiz-play-card h2');
 await expect(heading).toHaveText(new RegExp(quizPool(world).map(q => q.prompt.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')));
 const prompt = await heading.textContent();
 return quizPool(world).find(q => q.prompt === prompt)!;
}
test('answers unlock five progressively harder levels and persist completed results',async({page})=>{
 test.setTimeout(90000);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/#play/ocean');
 await expect(page.getByRole('button',{name:/Level 2:.*locked/})).toBeDisabled();
 await page.getByRole('button',{name:'Play level 1',exact:true}).click();
 for(let level=0;level<5;level++){
  const prompts=new Set<string>();
  for(let index=0;index<3;index++){
   const q=await shownQuestion(page,'ocean');expect(prompts.has(q.prompt)).toBe(false);prompts.add(q.prompt);
   await expect(page.getByRole('heading',{name:q.prompt,exact:true})).toBeVisible();
   await page.getByRole('button',{name:new RegExp(q.correct.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))}).click();
   await expect(page.getByRole('status')).toContainText(q.fact);
   await page.keyboard.press('1');
   await page.getByRole('button',{name:/Next question|See your result/}).click();
  }
  await expect(page.getByLabel('3 out of 3 correct')).toBeVisible();
  if(level<4)await page.getByRole('button',{name:'Play next level',exact:true}).click();
 }
 await expect(page.getByRole('heading',{name:'World mastered.'})).toBeVisible();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('rh-quiz-progress')||'{}').ocean.bests)).toEqual([450,450,450,450,450]);
 await page.reload();await expect(page.getByRole('button',{name:/Level 5: The final guardian/})).toBeEnabled();expect(errors).toEqual([]);
});

test('wrong answers teach, reduce hearts, and cannot unlock the next level',async({page})=>{
 await page.goto('/#play/football');await page.getByRole('button',{name:'Play level 1',exact:true}).click();
 for(let index=0;index<3;index++){const q=await shownQuestion(page,'football');await page.getByRole('button',{name:new RegExp(q.answers[1].replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))}).click();await expect(page.locator('.quiz-answers .correct')).toContainText(q.correct);await page.getByRole('button',{name:/Next question|See your result/}).click();}
 await expect(page.getByRole('heading',{name:'One more adventure?'})).toBeVisible();await expect(page.getByRole('button',{name:/Level 2:.*locked/})).toBeDisabled();await page.getByRole('button',{name:'Play again',exact:true}).click();await expect(page.getByLabel('3 hearts remaining')).toBeVisible();
});

test('mobile quiz remains usable without WebGL or browser storage',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>{const context=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type:string,...args:unknown[]){if(type.startsWith('webgl'))return null;return context.apply(this,[type,...args] as never);} as typeof context;Storage.prototype.setItem=()=>{throw new Error('storage unavailable');};});
 await page.goto('/#play/music');await expect(page.locator('.quiz-scene-fallback')).toBeVisible();await page.getByRole('button',{name:'Play level 1',exact:true}).click();
 for(let index=0;index<3;index++){const q=await shownQuestion(page,'music');await page.getByRole('button',{name:new RegExp(q.correct.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))}).click();await page.getByRole('button',{name:/Next question|See your result/}).click();}
 await expect(page.getByRole('status')).toContainText('Browser storage is unavailable');await page.getByRole('button',{name:'Play next level',exact:true}).click();await shownQuestion(page,'music');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
