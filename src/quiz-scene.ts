import * as THREE from 'three';

export function createQuizScene(canvas:HTMLCanvasElement,color:string,reduced:boolean){
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0,0);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.set(0,2.3,11);camera.lookAt(0,.5,0);
 scene.add(new THREE.AmbientLight(0x9faaff,2));const key=new THREE.DirectionalLight(0xe9ffff,5);key.position.set(3,6,4);scene.add(key);const rim=new THREE.PointLight(color,45,18);rim.position.set(-3,2,1);scene.add(rim);
 const group=new THREE.Group();scene.add(group);const mats:THREE.Material[]=[];const geos:THREE.BufferGeometry[]=[];
 function material(c:THREE.ColorRepresentation,metalness=.1,roughness=.5){const m=new THREE.MeshStandardMaterial({color:c,metalness,roughness});mats.push(m);return m;}
 const stone=material('#252644',.3,.8),surface=material('#537d85',.25,.7),white=material('#f2e8ff',.1,.3),dark=material('#172039',.1,.3),pink=material('#f2a0cd',.1,.4),accent=material(color,.4,.25);
 function mesh(geometry:THREE.BufferGeometry,mat:THREE.Material,parent:THREE.Object3D=group){geos.push(geometry);const m=new THREE.Mesh(geometry,mat);parent.add(m);return m;}
 const island=mesh(new THREE.ConeGeometry(2.65,2.1,7),stone);island.rotation.z=Math.PI;island.position.y=-1.4;island.rotation.y=.3;
 const land=mesh(new THREE.CylinderGeometry(2.58,2.65,.23,7),surface);land.position.y=-.29;land.rotation.y=.3;
 for(let i=0;i<13;i++){const a=i*2.4,r=1.5+(i%3)*.3;const crystal=mesh(new THREE.ConeGeometry(.12+i%3*.03,.5+i%4*.15,5),accent);crystal.position.set(Math.cos(a)*r,-.1,Math.sin(a)*r);crystal.rotation.z=Math.cos(a)*.2;}
 const bunny=new THREE.Group();bunny.position.set(-.2,-.1,.7);group.add(bunny);
 function ball(x:number,y:number,z:number,sx:number,sy:number,sz:number,mat:THREE.Material){const m=mesh(new THREE.SphereGeometry(1,24,16),mat,bunny);m.position.set(x,y,z);m.scale.set(sx,sy,sz);return m;}
 ball(0,.57,0,.43,.6,.38,white);ball(0,1.25,.1,.58,.53,.49,white);ball(-.29,1.99,.04,.17,.63,.16,white).rotation.z=.17;ball(.29,1.99,.04,.17,.63,.16,white).rotation.z=-.17;
 ball(-.29,2.01,.19,.085,.43,.035,pink).rotation.z=.17;ball(.29,2.01,.19,.085,.43,.035,pink).rotation.z=-.17;
 ball(-.2,1.32,.55,.065,.09,.035,dark);ball(.2,1.32,.55,.065,.09,.035,dark);ball(0,1.17,.59,.055,.04,.035,pink);ball(-.23,.1,.22,.23,.14,.34,white);ball(.23,.1,.22,.23,.14,.34,white);
 const helmetMat=new THREE.MeshPhysicalMaterial({color:'#a2efff',transmission:.85,transparent:true,opacity:.17,roughness:.05,metalness:.1,side:THREE.DoubleSide});mats.push(helmetMat);ball(0,1.3,.08,.75,.69,.67,helmetMat);
 const portal=new THREE.Group();portal.position.set(.65,1.3,-1.4);portal.rotation.y=-.25;group.add(portal);
 const glowMat=new THREE.MeshBasicMaterial({color});mats.push(glowMat);
 const portalRing=mesh(new THREE.TorusGeometry(1.75,.045,12,120),glowMat,portal);const second=mesh(new THREE.TorusGeometry(1.9,.012,8,120),glowMat,portal);second.rotation.z=.3;
 const discMat=new THREE.MeshBasicMaterial({color:'#3b3896',transparent:true,opacity:.3,side:THREE.DoubleSide});mats.push(discMat);mesh(new THREE.CircleGeometry(1.7,80),discMat,portal);
 for(let i=0;i<12;i++){const marker=mesh(new THREE.OctahedronGeometry(.055),glowMat,portal);marker.position.set(Math.cos(i*Math.PI/6)*1.9,Math.sin(i*Math.PI/6)*1.9,0);}
 const floats:THREE.Mesh[]=[];for(let i=0;i<12;i++){const m=mesh(new THREE.IcosahedronGeometry(.09+(i%3)*.07,0),i%2?accent:stone);m.position.set(Math.sin(i*3.3)*4,Math.cos(i*2.5)*2,Math.sin(i*1.7)*2-1);floats.push(m);}
 const particles=new Float32Array(140*3);for(let i=0;i<particles.length;i++)particles[i]=(Math.sin(i*127.1)*43758.5453%1)*13;
 const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(particles,3));geos.push(pg);const pm=new THREE.PointsMaterial({color,size:.025,transparent:true,opacity:.7});mats.push(pm);const points=new THREE.Points(pg,pm);scene.add(points);
 let frame=0,px=0,py=0,active=true,kick=0,hit=0;
 function resize(){const box=canvas.getBoundingClientRect();renderer.setSize(box.width,box.height,false);camera.aspect=box.width/Math.max(1,box.height);camera.updateProjectionMatrix();draw(0);}
 function pointer(e:PointerEvent){const r=canvas.getBoundingClientRect();px=((e.clientX-r.left)/r.width-.5);py=((e.clientY-r.top)/r.height-.5);}
 function draw(t:number){const seconds=t*.001;if(!reduced){group.rotation.y+=(px*.17-group.rotation.y)*.035;group.rotation.x+=(-py*.07-group.rotation.x)*.035;group.position.y=Math.sin(seconds*.75)*.08;bunny.position.y=-.1+Math.max(0,Math.sin(kick))*Math.min(1,kick)*.8;portalRing.rotation.z=seconds*.08;points.rotation.y=seconds*.012;floats.forEach((m,i)=>{m.rotation.x=seconds*.15+i;m.rotation.y=seconds*.1;m.position.y+=Math.sin(seconds+i)*.001;});kick=Math.max(0,kick-.075);hit=Math.max(0,hit-.035);group.position.x=Math.sin(seconds*70)*hit*.07;}renderer.render(scene,camera);}
 function loop(t:number){if(active&&!reduced)draw(t);frame=requestAnimationFrame(loop);}const observer=new ResizeObserver(resize);observer.observe(canvas);canvas.addEventListener('pointermove',pointer);const visibility=()=>{active=!document.hidden;};document.addEventListener('visibilitychange',visibility);resize();frame=requestAnimationFrame(loop);
 return{celebrate(){kick=Math.PI;rim.intensity=65;},wrong(){hit=1;},dispose(){cancelAnimationFrame(frame);observer.disconnect();canvas.removeEventListener('pointermove',pointer);document.removeEventListener('visibilitychange',visibility);geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());renderer.dispose();}};
}
