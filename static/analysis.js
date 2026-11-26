const ARROW={real:{c:'#993700',d:'',w:.13,label:'Jugada de la partida'},alt:{c:'#29b077',d:'.15 .09',w:.17,label:'Alternativa'},rival:{c:'#55606e',d:'.04 .1',w:.15,label:'Idea del rival'},ghost:{c:'#8b98a7',d:'.04 .1',w:.11,label:'Tu jugada (para comparar)'}};
let lastArrows=[];
function sqXY(s){return ['abcdefgh'.indexOf(s[0])+.5,8-Number(s[1])+.5];}
function arrowsSvg(list){if(!list.length)return '';let defs='',body='';
 for(const t of Object.keys(ARROW)){const a=ARROW[t],mk=a.w*2.6;defs+=`<marker id="ah-${t}" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="${mk}" markerHeight="${mk}" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${a.c}"/></marker>`;}
 for(const [f,t,k] of list){const a=ARROW[k],[x1,y1]=sqXY(f),[x2,y2]=sqXY(t),dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len,sh=a.w*2.6*.9+(k==='real'?.27:0);
  body+=`<line x1="${x1+ux*.18}" y1="${y1+uy*.18}" x2="${x2-ux*sh}" y2="${y2-uy*sh}" stroke="${a.c}" stroke-width="${a.w}" stroke-linecap="round" ${a.d?`stroke-dasharray="${a.d}"`:''} opacity="${k==='real'?1:k==='ghost'?.75:.92}" marker-end="url(#ah-${k})"/>`;}
 return `<svg class="board-arrows" viewBox="0 0 8 8" aria-hidden="true"><defs>${defs}</defs>${body}</svg>`;}
function renderLegend(){const el=$('arrow-legend');if(!el)return;const types=[...new Set(lastArrows.map(a=>a[2]))];
 el.innerHTML=types.map(t=>{const a=ARROW[t];return `<span><svg viewBox="0 0 30 10"><line x1="2" y1="5" x2="23" y2="5" stroke="${a.c}" stroke-width="3" stroke-linecap="round" ${a.d?`stroke-dasharray="${a.d.split(' ').map(v=>v*18).join(' ')}"`:''}/><path d="M22,1 L29,5 L22,9 z" fill="${a.c}"/></svg>${a.label}</span>`;}).join('');}
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const spanish = san => san.replace(/[KQRBN]/g,c=>({K:'R',Q:'D',R:'T',B:'A',N:'C'}[c]));
const gameId = new URLSearchParams(location.search).get('game') || 'roni';
const gameQuery = '?game=' + encodeURIComponent(gameId);
const symbols = {K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'♙',k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'};
const titles = {
 summary:['Errores','Jugadas de tu lado que perdieron ventaja según Stockfish'],
 node:['Nodo de análisis','Define qué quieres entender de esta decisión y corrige el objetivo del tutor.'],
 chain:['Cadena de análisis','Explicación del tutor local basada en la posición y las variantes del motor.'],
 learn:['Aprende','Vuelve a la posición anterior y prueba qué habrías jugado.'],
 advice:['Consejos','Orientación del tutor para la jugada seleccionada'],
 resources:['Referencias','Recursos para estudiar ajedrez']
};
let game, report, reportError='', ply=1, view='summary', origin='', trial=null, promotion='q', practiceMessage='', practiceVersion=0;
const notes = new Map();
const variations = new Map();
function trialVerdict(result){
 return spanish(result.san)+' · '+result.kind+'. Alternativa del motor: '+spanish(result.best.san[0])+'.';
}
function variationKey(at,move){return at+'-'+move;}
function variationList(at){
 const entries=variations.get(at);
 if(!entries)return '';
 return '<div class="branch-wrap">'+Array.from(entries.values(),result=>{
  const active=view==='learn' && ply===at && trial?.move===result.move;
  return '<button class="tree-move" aria-pressed="'+active+'" data-variation="'+variationKey(at,result.move)+'">↳ '+notation(spanish(result.san),at-1,[result.move])+' <small>Variante</small></button>';
 }).join('')+'</div>';
}
function saveVariation(){
 if(!trial || trial.move===game.moves[ply-1])return;
 if(!variations.has(ply))variations.set(ply,new Map());
 variations.get(ply).set(trial.move,trial);
 render();
}
function reopenVariation(key){
 const [at,move]=key.split('-');
 const saved=variations.get(Number(at))?.get(move);
 if(!saved)return;
 clearPreview();practiceVersion++;origin='';view='learn';ply=Number(at);trial=saved;
 practiceMessage=trialVerdict(saved);
 render();animateMove(move,game.positions[ply-1]);
}

function note() {
 if (!notes.has(ply)) notes.set(ply,{goal:'',proposal:null,chain:null,advice:null,questions:[]});
 return notes.get(ply);
}
const label = n => n ? Math.ceil(n/2)+(n%2?'. ':'… ')+spanish(game.sans[n-1]) : 'Posición inicial';
const selectedRow = () => report?.rows.find(r=>r.ply===ply);
const badRows = () => report?.ranking.filter(r=>r.grade !== 'neutral') || [];
const btn = (action,text) => '<button type="button" class="small-button" data-action="'+action+'">'+esc(text)+'</button>';
async function api(path,body) {
 const options = body === undefined ? {} : {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)};
 const response = await fetch('/api/'+path,options);
 const data = await response.json();
 if (!response.ok) throw Error(typeof data.detail==='string'?data.detail:'No se pudo completar la operación.');
 return data;
}
async function analyze() {
 reportError='';
 try { report=await api('review/analyze'+gameQuery,{}); }
 catch(error){reportError=error.message;}
 render();
}
let boardMarkup='';
function animateMove(move, before){
 if(!move || matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const from=move.slice(0,2), to=move.slice(2,4);
 function slide(start,end){
  const source=$('board').querySelector('[data-square="'+start+'"]');
  const target=$('board').querySelector('[data-square="'+end+'"]');
  const piece=target.querySelector('.piece');
  if(!piece)return;
  const a=source.getBoundingClientRect(), b=target.getBoundingClientRect();
  piece.animate([
   {transform:'translate('+(a.left-b.left)+'px,'+(a.top-b.top)+'px)',zIndex:3},
   {transform:'translate(0,0)',zIndex:3}
  ],{duration:190,easing:'cubic-bezier(.2,.75,.3,1)'});
 }
 slide(from,to);
 if(before?.pieces[from]?.toLowerCase()==='k' && Math.abs(from.charCodeAt(0)-to.charCodeAt(0))===2){
  const short=to[0]==='g', rank=from[1];
  slide((short?'h':'a')+rank,(short?'f':'d')+rank);
 }
}
let preview=null, hoverTarget=null;
function notation(text,base,moves){
 return '<span class="notation" data-base="'+base+'" data-line="'+esc(moves.join(' '))+'">'+esc(text)+'</span>';
}
function gameNotation(n){return notation(label(n),n-1,[game.moves[n-1]]);}
function lineNotation(line,base,firstOnly=false){
 const count=firstOnly?1:line.pv.length;
 return line.san.slice(0,count).map((san,i)=>notation(spanish(san),base,line.pv.slice(0,i+1))).join(' ');
}
function clearPreview(){
 hoverTarget=null;
 if(preview){preview=null;board();}
}
function legalTutorMove(position, token){
 const san=token.replace(/[+#]+$/,'').replace(/0/g,'O');
 if(/^O-O(?:-O)?$/.test(san)){
  const rank=position.turn==='blancas'?'1':'8';
  const castle='e'+rank+(san==='O-O'?'g':'c')+rank;
  return position.legal.includes(castle)?castle:null;
 }
 const parts=san.match(/^([KQRBNTDAC]?)([a-h]?)([1-8]?)(x?)([a-h][1-8])(?:=([QRBNTDAC]))?$/);
 if(!parts)return null;
 const [,piece,file,rank,capture,to,promotion]=parts;
 function candidates(language){
  const type=(language[piece]||piece||'P').toLowerCase();
  return position.legal.filter(move=>{
   const from=move.slice(0,2);
   const takes=Boolean(position.pieces[to]) || (type==='p' && from[0]!==to[0]);
   return move.slice(2,4)===to && position.pieces[from]?.toLowerCase()===type &&
    (!file||from[0]===file) && (!rank||from[1]===rank) && takes===Boolean(capture) &&
    move.slice(4)===(language[promotion]||promotion||'').toLowerCase();
  });
 }
 const spanishMoves=candidates({R:'K',D:'Q',T:'R',A:'B',C:'N'});
 const choices=spanishMoves.length?spanishMoves:candidates({});
 return choices.length===1?choices[0]:null;
}
async function tutorLine(el,base){
 let pos=game.positions[base];
 const moves=[];
 for(const token of el.dataset.sans.split(' ')){
  const move=legalTutorMove(pos,token);
  if(!move||hoverTarget!==el)return null;
  moves.push(move);
  if(moves.every((m,i)=>m===game.moves[base+i]))pos=game.positions[base+moves.length];
  else pos=await api('position',{moves:game.moves.slice(0,base).concat(moves)});
 }
 return {moves,position:pos};
}
async function showPreview(el){
 clearPreview();hoverTarget=el;
 const base=Number(el.dataset.base);
 if(el.dataset.location){
  preview={position:game.positions[base],square:el.dataset.location,text:'Casilla '+el.dataset.location};
  board();
  return;
 }
 try{
  const resolved=el.dataset.sans?await tutorLine(el,base):null;
  if(el.dataset.sans&&!resolved)return;
  const moves=resolved?.moves || el.dataset.line.split(' '), end=base+moves.length;
  const main=moves.every((m,i)=>m===game.moves[base+i]);
  const position=resolved?.position || (main?game.positions[end]:await api('position',{moves:game.moves.slice(0,base).concat(moves)}));
  if(hoverTarget!==el || !el.isConnected)return;
  const move=moves.at(-1);
  preview={position,move,text:el.textContent};
  board();
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
   const before=main?game.positions[end-1]:moves.length===1?game.positions[base]:null;
   animateMove(move,before);
  }
 }catch{if(hoverTarget===el)clearPreview();}
}
document.addEventListener('pointerover',e=>{
 const el=e.target.closest('.notation');
 if(e.pointerType!=='touch' && el && el!==hoverTarget)showPreview(el);
});
document.addEventListener('pointerout',e=>{
 if(hoverTarget && hoverTarget.contains(e.target) && !hoverTarget.contains(e.relatedTarget))clearPreview();
});
window.addEventListener('blur',clearPreview);
function board() {
 const playing=view==='learn';
 const position=preview?.position || (playing?(trial?.position || game.positions[ply-1]):game.positions[ply]);
 const move=preview?preview.move:(playing?trial?.move:game.moves[ply-1]);
 let squares='';
 for(let rank=8;rank;rank--) for(const file of 'abcdefgh'){
  const sq=file+rank, piece=position.pieces[sq], target=origin && position.legal.some(m=>m.startsWith(origin+sq));
  const classes='square '+(('abcdefgh'.indexOf(file)+rank)%2?'dark':'light')+(target?' target-hint':'')+(sq===origin?' selected-square':'')+(preview && sq===(preview.square || move?.slice(2,4))?' preview-square':'');
  const tag=playing?'button':'div';
  squares+='<'+tag+' class="'+classes+'" data-square="'+sq+'" aria-label="'+sq+' '+(piece || 'vacía')+'">'+(piece?'<span class="piece '+(piece===piece.toUpperCase()?'white':'black')+'">'+symbols[piece]+'</span>':'')+'</'+tag+'>';
 }
 lastArrows=move?[[move.slice(0,2),move.slice(2,4),playing&&!preview?'alt':'real']]:[];
 const markup=squares+arrowsSvg(lastArrows);
 if(markup!==boardMarkup){$('board').innerHTML=markup;boardMarkup=markup;}
 renderLegend();
 $('current-move').textContent=preview?.text || (playing?(trial?spanish(trial.san):label(ply-1)):label(ply));
 $('move-subtitle').textContent=preview?'Vista previa':playing?'Posición de práctica':'Posición de la partida';
 $('side-to-move').textContent='Turno: '+position.turn;
 $('prev').disabled=playing || ply<=1;
 $('next').disabled=playing || ply>=game.moves.length;
}
function evaluationBadge(row){
 const severity=row.grade==='warning'?'warning':'danger';
 return '<span class="kind '+severity+'">'+esc(row.kind)+'</span>';
}
function tree(){
 if(hoverTarget && $('tree').contains(hoverTarget))clearPreview();
 $('tree').innerHTML=game.sans.map((_,i)=>{
  const n=i+1, row=badRows().find(r=>r.ply===n), count=notes.get(n)?.questions.length;
  const badge=row?' '+evaluationBadge(row):'';
  return '<div class="tree-entry '+(n===ply?'selected':'')+'"><button class="tree-move" data-ply="'+n+'"><span>'+gameNotation(n)+badge+'</span>'+(count?'<small>'+count+' consulta(s)</small>':'')+'</button>'+variationList(n)+(n===ply && view!=='learn'?btn('learn','¿Qué pasaría si…?'):'')+'</div>';
 }).join('');
}
function summary(){
 if(!report) return reportError?esc(reportError)+' '+btn('analyze','Reintentar análisis'):'Stockfish está comparando tus jugadas con sus alternativas…';
 const rows=badRows();
 if(!rows.length)return 'Stockfish no detectó pérdidas importantes en tus jugadas.';
 return '<table class="results-table"><thead><tr><th>Jugada</th><th>Evaluación</th><th>Alternativa</th></tr></thead><tbody>'+rows.map(r=>'<tr class="'+(r.ply===ply?'highlight-row':'')+'"><td><button class="small-button" data-ply="'+r.ply+'">'+gameNotation(r.ply)+'</button></td><td>'+evaluationBadge(r)+'</td><td>'+lineNotation(r.best,r.ply-1,true)+'</td></tr>').join('')+'</tbody></table><p class="table-foot">'+esc(report.engine)+' · Pérdida estimada al comparar ambas jugadas desde la misma posición.</p>'+btn('chain','Explicar '+label(ply))+' '+btn('learn','Probar una alternativa');
}
function output(item){
 if(!item)return '';
 return '<div class="detail-box" style="white-space:pre-line">'+esc(item.error || item.text || 'Ollama está preparando la explicación…')+(item.model?'<p class="src">'+esc(item.model)+' · '+esc(item.engine)+'</p>':'')+'</div>';
}
function tutorSections(text){
 const sections=[];
 for(const raw of text.split(/\r?\n/)){
  const line=raw.trim();
  if(!line)continue;
  const heading=line.match(/^(?:#{1,4}\s+(.+)|\*\*(.+?)\*\*\s*:?|(?:\d+[.)]\s*)?(Posición antes de la jugada|Comparación(?: de la jugada con la alternativa del motor)?|Conclusión práctica):?)$/i);
  if(heading){
   sections.push({title:(heading[1]||heading[2]||heading[3]).replace(/\*\*|:$/g,''),body:[]});
  }else{
   if(!sections.length)sections.push({title:'Lectura de la jugada',body:[]});
   sections.at(-1).body.push(line);
  }
 }
 return sections.filter(section=>section.body.length);
}
function chainView(n){
 const item=n.chain;
 const row=item?.evidence || selectedRow();
 let comparison='';
 if(row){
  const same=row.best.pv[0]===row.played.pv[0];
  const loss=row.loss_cp==null?row.kind:(row.loss_cp/100).toLocaleString('es',{maximumFractionDigits:2})+' peones';
  comparison='<dl class="chain-metrics"><div><dt>Jugada de la partida</dt><dd>'+gameNotation(ply)+'</dd></div><div><dt>Elección de Stockfish</dt><dd>'+lineNotation(row.best,ply-1,true)+'</dd></div><div><dt>'+(row.loss_cp==null?'Diagnóstico':'Pérdida estimada')+'</dt><dd>'+esc(loss)+'</dd></div></dl>'+
   '<details class="chain-lines"><summary>Ver variantes del motor</summary><p><strong>'+(same?'Línea compartida':'Partida')+'</strong> '+lineNotation(row.played,ply-1)+'</p>'+(same?'':'<p><strong>Alternativa</strong> '+lineNotation(row.best,ply-1)+'</p>')+'</details>';
 }
 let explanation='<p role="status" class="chain-wait">Preparando la explicación de esta jugada…</p>';
 if(item?.error)explanation='<p role="status">'+esc(item.error)+'</p>'+btn('regenerate','Reintentar');
 if(item?.text)explanation='<ol class="chain-path">'+tutorSections(item.text).map(section=>'<li><h4>'+esc(section.title)+'</h4>'+section.body.map(p=>'<p>'+esc(p).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')+'</p>').join('')+'</li>').join('')+'</ol>';
 return '<article class="study-chain">'+(n.goal?'<p class="chain-goal"><strong>Tu objetivo</strong> '+esc(n.goal)+'</p>':'')+
 '<section><h3>Comparación de la jugada</h3>'+comparison+'</section><section class="chain-reading"><header><h3>Explicación del tutor</h3><small>'+esc(item?.model || 'Ollama')+'</small></header>'+explanation+'</section></article>';
}
// Resolve notation in tutor prose only when the move has a known position.
function linkTextMoves(root){
 const options=new Map(), row=note().chain?.evidence || selectedRow();
 function add(san,end,base,moves){
  const key=spanish(san).replace(/[+#]$/,'');
  const entry={end,base,moves};
  if(!options.has(key))options.set(key,[]);
  options.get(key).push(entry);
 }
 game.sans.forEach((san,i)=>add(san,i+1,i,[game.moves[i]]));
 for(const line of [row?.played,row?.best,trial?.played,trial?.best].filter(Boolean)){
  line.san.forEach((san,i)=>add(san,ply+i,ply-1,line.pv.slice(0,i+1)));
 }
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 const nodes=[];
 while(walker.nextNode())if(!walker.currentNode.parentElement.closest('.notation,textarea,select'))nodes.push(walker.currentNode);
 const pattern=/(?<![\w/])(?:(\d+)\s*(\.{3}|…|\.)\s*)?([O0]-[O0](?:-[O0])?|[KQRBNTDAC]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBNTDAC])?)[+#]?(?![\w/])/g;
 for(const node of nodes){
  const text=node.textContent, fragment=document.createDocumentFragment();
  let offset=0, lastEnd=-1, base=0, sequence=[];
  for(const match of text.matchAll(pattern)){
   const token=match[3], number=match[1]?2*Number(match[1])-(match[2]==='.'?1:0):null;
   const prefix=text.slice(0,match.index);
   const bareSquare=number===null && match[0]===token && /^[a-h][1-8]$/.test(token);
   const squareContext=/\b(?:en|desde|hasta|casillas?|escaques?)\s*$|\b(?:en|casillas?|escaques?)\s+[a-h][1-8](?:(?:,\s*|\s+y\s+)[a-h][1-8])*(?:,\s*|\s+y\s+)$/i.test(prefix);
   const connected=lastEnd>=0 && /^\s*(?:[,;→–-]\s*)?$/.test(text.slice(lastEnd,match.index)) &&
     (number===null || number===base+sequence.length+1);
   const span=document.createElement('span');
   if(bareSquare && (squareContext || (!connected && !options.has(token) &&
      !legalTutorMove(game.positions[ply-1],token) && !legalTutorMove(game.positions[ply],token)))){
    span.className='notation';
    span.dataset.location=token;
    const heading=node.parentElement.closest('.chain-path li')?.querySelector('h4')?.textContent || '';
    span.dataset.base=/antes/i.test(heading)?ply-1:ply;
    span.textContent=token;
    fragment.append(text.slice(offset,match.index),span);
    offset=match.index+token.length;
    lastEnd=-1;
    continue;
   }
   if(!connected){
    sequence=[];
    if(number!==null)base=number-1;
    else if(legalTutorMove(game.positions[ply-1],token))base=ply-1;
    else if(legalTutorMove(game.positions[ply],token))base=ply;
    else{
     const choices=options.get(token)||[];
     if(!choices.length || choices.some(e=>e.base!==choices[0].base || e.moves.join()!==choices[0].moves.join()))continue;
     base=choices[0].base;
     span.dataset.line=choices[0].moves.join(' ');
    }
    if(!game.positions[base] || (!span.dataset.line && !legalTutorMove(game.positions[base],token)))continue;
   }
   sequence.push(token);
   span.className='notation';span.dataset.base=base;
   if(!span.dataset.line)span.dataset.sans=sequence.join(' ');
   span.textContent=match[0];
   lastEnd=span.dataset.line?-1:match.index+match[0].length;
   fragment.append(text.slice(offset,match.index),span);
   offset=match.index+match[0].length;
  }
  if(offset){fragment.append(text.slice(offset));node.replaceWith(fragment);}
 }
}
function results(){
 if(hoverTarget && $('results').contains(hoverTarget))clearPreview();
 const n=note();
 let html='';
 if(view==='summary') html=summary();
 if(view==='node') html='<h3>Objetivo para '+gameNotation(ply)+'</h3><p>El tutor sugiere qué revisar. Puedes adoptar su objetivo o escribir el tuyo para orientar la cadena.</p>'+output(n.proposal)+(n.proposal?.text?btn('adopt','Usar esta propuesta'):'')+(n.proposal?.error?btn('proposal','Reintentar propuesta'):'')+'<p><label for="study-goal">Mi objetivo o plan para esta jugada</label></p><textarea class="question" style="width:100%" maxlength="400" id="study-goal">'+esc(n.draft ?? n.goal)+'</textarea>'+btn('apply','Aplicar a la cadena');
 if(view==='chain')html=chainView(n);
 if(view==='advice')html=output(n.advice)+(n.advice?.error?btn('regenerate','Reintentar'):'');
 if(view==='learn')html='<h3>¿Qué jugarías en lugar de '+gameNotation(ply)+'?</h3><p>Selecciona una pieza y una casilla resaltada. Stockfish compara tu intento con su mejor continuación.</p><label>Al coronar <select id="promotion"><option value="q">Dama</option><option value="r">Torre</option><option value="b">Alfil</option><option value="n">Caballo</option></select></label><div class="detail-box" role="status">'+esc(practiceMessage || 'Elige una pieza en el tablero.')+'</div>'+(trial?'<p>Continuación del motor: '+lineNotation(trial.played,ply-1)+'</p>':'')+(trial && trial.move!==game.moves[ply-1]?(variations.get(ply)?.has(trial.move)?'<p>Variante guardada en el árbol.</p>':btn('save-variation','Guardar variante')+' '):'')+btn('retry','Volver a intentar')+' '+btn('chain','Volver a la explicación');
 if(view==='resources') html='<a href="https://lichess.org/learn">Fundamentos de ajedrez en Lichess</a>';
 const row=selectedRow();
 if(row && ['node','summary'].includes(view)){
  html+='<details class="detail-box"><summary>Evidencia de Stockfish para '+gameNotation(ply)+'</summary><p>Partida: '+lineNotation(row.played,ply-1)+'</p><p>Alternativa: '+lineNotation(row.best,ply-1)+'</p><p>'+esc(row.loss_cp==null?row.kind:'Pérdida estimada: '+(row.loss_cp/100).toFixed(2)+' peones')+'</p></details>';
 }
 if(view!=='learn') for(const q of n.questions)html+='<h4>'+esc(q.question)+'</h4>'+output(q);
 $('results').innerHTML=html;
 linkTextMoves($('results'));
 if ($('promotion')) $('promotion').value=promotion;
}
function render(){
 if(!game)return;
 board();tree();results();
 $('result-title').textContent=titles[view][0];$('result-subtitle').textContent=titles[view][1];
 $('composer-context').textContent='Vinculada a '+label(ply);
 $('question').disabled=$('ask-form').querySelector('.send').disabled=view==='learn';
 document.querySelectorAll('.view-tab').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
}
async function generate(kind,question){
 const n=note(), at=ply, item={question};
 if(kind==='query')n.questions.push(item);else n[kind]=item;
 const prompts={
 proposal:'Propón en una sola frase un objetivo concreto de estudio para esta decisión. El objetivo es una sugerencia que el jugador puede corregir.',
 chain:'Usa estos tres títulos en líneas independientes: Posición antes de la jugada, Comparación, Conclusión práctica. Bajo cada título escribe una o dos frases concretas. Apoya cada afirmación en la evidencia.',
 advice:'Da un consejo práctico y concreto para esta jugada.'
 };
 render();
 try{
  const row=selectedRow();
  const evidence=row || await api('review/compare',{moves:game.moves.slice(0,at-1),candidate:game.moves[at-1]});
  function describeLine(line){
   const score=line.mate_white==null
     ? (line.cp_white/100).toFixed(2)+' peones de evaluación desde blancas'
     : 'mate forzado a favor de '+(line.mate_white>0?'blancas':'negras')+' en '+Math.abs(line.mate_white);
   return line.san.map(spanish).join(' ')+' ('+score+')';
  }
  const facts='Jugada de la partida: '+label(at)+'. Línea jugada: '+describeLine(evidence.played)+'. Alternativa preferida de Stockfish: '+describeLine(evidence.best)+'. Diagnóstico de la jugada: '+evidence.kind+'.';
  const names={k:'rey',q:'dama',r:'torre',b:'alfil',n:'caballo',p:'peón'};
  const pieces=Object.entries(game.positions[at-1].pieces).map(([sq,p])=>sq+' '+names[p.toLowerCase()]+' de '+(p===p.toLowerCase()?'negras':'blancas')).join(', ');
  const context=[facts,'Notación española: R es rey, T es torre. Inventario antes de mover: '+pieces+'. El valor de evaluación no es inventario de material.',n.goal?'Objetivo del usuario: '+n.goal:''].join(' ');
  if(kind==='chain'){item.evidence=evidence;if(ply===at && view==='chain')results();}
  const data=await api('chat',{moves:game.moves.slice(0,at-1),question:context+'\n'+(question || prompts[kind])});
  Object.assign(item,{text:data.answer,model:data.model,engine:data.evidence.engine});
 }catch(error){item.error=error.message;}
 if(ply===at && (view===kind || kind==='proposal'&&view==='node' || kind==='query')){
  const editing=document.activeElement?.id==='study-goal';
  const cursor=editing?$('study-goal').selectionStart:0;
  results();
  if(editing){$('study-goal').focus();$('study-goal').setSelectionRange(cursor,cursor);}
 }
}
function open(next){
 if(!game)return;
 clearPreview();view=next;origin='';trial=null;practiceMessage='';practiceVersion++;
 $('view-menu').hidden=true;$('view-toggle').setAttribute('aria-expanded','false');
 const kind=view==='node'?'proposal':view;
 if(['proposal','chain','advice'].includes(kind)&&!note()[kind])generate(kind);
 else render();
 $('results').scrollTop=0;
}
function jump(n){
 if(!game||n<1||n>game.moves.length)return;
 const changed=n!==ply || view==='learn';
 ply=n;open(view==='learn'?'summary':view);
 if(changed)animateMove(game.moves[n-1],game.positions[n-1]);
 $('tree').querySelector('[data-ply="'+ply+'"]')?.scrollIntoView({block:'nearest'});
}
async function practice(sq){
 if(view!=='learn'||trial||practiceMessage==='Analizando tu jugada…')return;
 const position=game.positions[ply-1];
 const options=position.legal.filter(move=>move.startsWith(origin+sq));
 if(origin && options.length){
  const candidate=options.find(m=>m.length===4 || m.endsWith($('promotion').value));
  const version=++practiceVersion;
  origin='';practiceMessage='Analizando tu jugada…';render();
  try{
   const result=await api('review/compare',{moves:game.moves.slice(0,ply-1),candidate});
   if(version!==practiceVersion)return;
   trial=result;practiceMessage=trialVerdict(result);
  }catch(error){if(version!==practiceVersion)return;practiceMessage=error.message;}
 }else{origin=position.legal.some(m=>m.startsWith(sq))?sq:'';practiceMessage=origin?'Selecciona un destino resaltado.':'Selecciona una pieza que pueda mover.';}
 board();results();
 if(trial)animateMove(trial.move,position);
}
document.addEventListener('click',event=>{
 const b=event.target.closest('button');if(!b||!game)return;
 if(b.dataset.variation)return reopenVariation(b.dataset.variation);
 if(b.dataset.ply)return jump(Number(b.dataset.ply));
 if(b.dataset.view)return open(b.dataset.view);
 if(b.dataset.square)return practice(b.dataset.square);
 const n=note();
 switch(b.dataset.action){
 case 'analyze':analyze();return;
 case 'proposal':generate('proposal');return;
 case 'adopt':$('study-goal').value=n.proposal.text.slice(0,400);n.draft=$('study-goal').value;return;
 case 'apply':n.goal=$('study-goal').value.trim();delete n.draft;n.chain=null;n.advice=null;open('chain');return;
 case 'regenerate':generate(view);return;
 case 'save-variation':saveVariation();return;
 case 'retry':open('learn');return;
 case 'learn':case 'chain':open(b.dataset.action);return;
 }
 if(b.id==='prev')jump(ply-1);
 if(b.id==='next')jump(ply+1);
 if(b.id==='reset'){notes.clear();view='summary';jump(1);}
 if(b.id==='view-toggle'){$('view-menu').hidden=!$('view-menu').hidden;b.setAttribute('aria-expanded',String(!$('view-menu').hidden));}
});
document.addEventListener('change',e=>{if(e.target.id==='promotion')promotion=e.target.value;});
document.addEventListener('input',e=>{if(e.target.id==='study-goal')note().draft=e.target.value;});
$('ask-form').onsubmit=e=>{
 e.preventDefault();const field=$('question'),question=field.value.trim();if(!game||!question||view==='learn')return;
 field.value='';generate('query',question);
};
async function start(){
 try{
  game=await api('review/game'+gameQuery);
  ply=game.player_color==='black'?2:1;
  $('black-player').textContent=game.headers.Black || '';
  $('white-player').textContent=game.headers.White || '';
  report=game.report?.rows?game.report:null;
  render();if(!report)await analyze();
 }catch(error){$('results').textContent=error.message;}
}
start();
