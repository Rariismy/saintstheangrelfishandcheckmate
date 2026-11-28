/* Saints, the anglerfish, and checkmate.
   Add your own files in assets/photos, assets/music and assets/covers.
   See README.md for the exact naming convention. */
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const PAGES = ['home','about','personal','gallery','playlist','wonderland','tamagotchi'];
let pageIndex = 0;
const storage = {
  get(k, fallback){try{const v=localStorage.getItem('saints_'+k);return v===null?fallback:JSON.parse(v)}catch{return fallback}},
  set(k,v){localStorage.setItem('saints_'+k,JSON.stringify(v))}
};
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2200)}
function goPage(name){const i=PAGES.indexOf(name);if(i<0)return;pageIndex=i;$$('.page-view').forEach(p=>p.classList.toggle('active',p.id==='page-'+name));$$('.nav-button').forEach(b=>b.classList.toggle('active',b.dataset.page===name));$('#crumb').textContent=name.toUpperCase();$('#pagePosition').textContent=String(i+1).padStart(2,'0')+' / '+String(PAGES.length).padStart(2,'0');$('#backButton').disabled=i===0;$('#forwardButton').disabled=i===PAGES.length-1;window.scrollTo({top:0,behavior:'smooth'})}
$$('[data-page]').forEach(b=>b.addEventListener('click',()=>goPage(b.dataset.page)));
$('#backButton').addEventListener('click',()=>goPage(PAGES[Math.max(0,pageIndex-1)]));
$('#forwardButton').addEventListener('click',()=>goPage(PAGES[Math.min(PAGES.length-1,pageIndex+1)]));
goPage('home');

// Local editable homepage details
$('#saveTags').onclick=()=>{storage.set('tags',$('#workTags').value);toast('tags saved ♡')};
$('#workTags').value=storage.get('tags',$('#workTags').value);
const bills=storage.get('bills',[]);
function renderBills(){ $('#billTotal').textContent=bills.length;$('#billList').innerHTML='';bills.forEach((b,i)=>{const li=document.createElement('li');li.textContent=b+' ';const btn=document.createElement('button');btn.textContent='✓';btn.title='mark paid';btn.onclick=()=>{bills.splice(i,1);storage.set('bills',bills);renderBills()};li.append(btn);$('#billList').append(li)})}
$('#addBill').onclick=()=>{const v=$('#billName').value.trim();if(!v)return;bills.push(v);storage.set('bills',bills);$('#billName').value='';renderBills()};renderBills();
let parentDate=storage.get('parentDate','');$('#parentDate').value=parentDate;
function renderCountdown(){if(!parentDate){$('#parentCountdown').textContent='—';return}const days=Math.ceil((new Date(parentDate+'T00:00:00')-new Date(new Date().toDateString()))/86400000);$('#parentCountdown').textContent=days<0?'arrived!':days===0?'today!':days}
$('#saveParentDate').onclick=()=>{parentDate=$('#parentDate').value;storage.set('parentDate',parentDate);renderCountdown();toast('date saved!')};renderCountdown();
const schedule=storage.get('schedule',[{day:'MON',text:'lecture · 09:00'},{day:'TUE',text:'practice · 11:30'},{day:'FRI',text:'try to be responsible'}]);
function renderSchedule(){$('#scheduleList').innerHTML='';schedule.forEach((x,i)=>{const row=document.createElement('div');row.className='schedule-row';row.innerHTML=`<strong>${escapeHTML(x.day)}</strong><span>${escapeHTML(x.text)}</span>`;const del=document.createElement('button');del.textContent='×';del.onclick=()=>{schedule.splice(i,1);storage.set('schedule',schedule);renderSchedule()};row.append(del);$('#scheduleList').append(row)})}
$('#addSchedule').onclick=()=>{const day=$('#scheduleDay').value.trim(),text=$('#scheduleText').value.trim();if(!day||!text)return;schedule.push({day,text});storage.set('schedule',schedule);$('#scheduleDay').value='';$('#scheduleText').value='';renderSchedule()};renderSchedule();
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

// Calendar
let calDate=new Date();let selectedDate='';
function renderCalendar(){const y=calDate.getFullYear(),m=calDate.getMonth();$('#calendarTitle').textContent=calDate.toLocaleDateString('en-US',{month:'long',year:'numeric'});$('#calendarDays').innerHTML='';const first=(new Date(y,m,1).getDay()+6)%7,days=new Date(y,m+1,0).getDate(),today=new Date();for(let i=0;i<first;i++){const blank=document.createElement('span');$('#calendarDays').append(blank)}for(let d=1;d<=days;d++){const btn=document.createElement('button');btn.className='calendar-day';btn.textContent=d;const key=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;if(y===today.getFullYear()&&m===today.getMonth()&&d===today.getDate())btn.classList.add('today');if(selectedDate===key)btn.classList.add('selected');btn.onclick=()=>{selectedDate=key;const notes=storage.get('calendarNotes',{});const old=notes[key]||'';const note=prompt(`A little note for ${key}:`,old);if(note!==null){if(note.trim())notes[key]=note.trim();else delete notes[key];storage.set('calendarNotes',notes)}renderCalendar()};$('#calendarDays').append(btn)}}
$('#calPrev').onclick=()=>{calDate.setMonth(calDate.getMonth()-1);renderCalendar()};$('#calNext').onclick=()=>{calDate.setMonth(calDate.getMonth()+1);renderCalendar()};renderCalendar();

// Weather via Open-Meteo geocoding + forecast APIs
const weatherCodes={0:['☀','clear sky'],1:['🌤','mostly clear'],2:['⛅','partly cloudy'],3:['☁','cloudy'],45:['🌫','fog'],48:['🌫','fog'],51:['🌦','light drizzle'],61:['🌧','rain'],63:['🌧','rain'],65:['🌧','heavy rain'],71:['❄','snow'],80:['🌦','showers'],95:['⛈','thunderstorm']};
async function loadWeather(){const city=$('#weatherCity').value.trim()||'Petropavl';$('#weatherDesc').textContent='looking up...';try{const g=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`).then(r=>r.json());if(!g.results?.length)throw Error('city not found');const place=g.results[0];const data=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code&timezone=auto`).then(r=>r.json());const code=data.current.weather_code,[icon,desc]=weatherCodes[code]||['☁','changeable'];$('#weatherIcon').textContent=icon;$('#weatherTemp').textContent=Math.round(data.current.temperature_2m)+'°';$('#weatherDesc').textContent=desc;$('#weatherMeta').textContent=place.name+(place.country?', '+place.country:'')+' · live weather'}catch(e){$('#weatherDesc').textContent='could not reach the sky';$('#weatherMeta').textContent='check your connection or city name'} }
$('#weatherRefresh').onclick=loadWeather;loadWeather();

// Date / mood / guest notes
const now=new Date();$('#todayDate').textContent=String(now.getDate()).padStart(2,'0');$('#todayMonth').textContent=now.toLocaleDateString('en-US',{month:'long',year:'numeric'}).toUpperCase();$('#lastUpdated').textContent=now.toLocaleDateString('en-US',{day:'numeric',month:'short',year:'numeric'});
const mood=storage.get('mood','a little bit all over the place');$('#moodSelect').value=mood;$('#moodText').textContent=mood;$('#moodSelect').onchange=()=>{storage.set('mood',$('#moodSelect').value);$('#moodText').textContent=$('#moodSelect').value};
const guestNotes=storage.get('guestNotes',[]);function renderGuest(){ $('#guestNotes').innerHTML='';guestNotes.slice(-3).forEach(n=>{const d=document.createElement('div');d.className='guest-note';d.textContent=n;$('#guestNotes').append(d)})}
$('#saveGuestMessage').onclick=()=>{const v=$('#guestMessage').value.trim();if(!v)return;guestNotes.push(v);storage.set('guestNotes',guestNotes);$('#guestMessage').value='';renderGuest();toast('message tucked away ♡')};renderGuest();

// Character cards
let character='nin';let customCharacters=storage.get('characters',[]);
const characterData={nin:{name:'Nin',role:'the reluctant protagonist',emoji:'𓆝',facts:['currently enrolled at university','has a complicated relationship with deadlines','does not understand the lobster celebration','probably needs a holiday'],note:'A little tired, a little curious, and about to have a very unusual day.'},eri:{name:'Eri',role:'the other point of view',emoji:'🪸',facts:['details to be discovered','has her own music shelf','may know more than she lets on'],note:'Her page is waiting for its proper introduction.'}};
function renderCharacters(){const list=[characterData[character],...customCharacters.filter(x=>x.group===character)];$('#characterCards').innerHTML=list.map(c=>`<article class="character-card"><div class="character-avatar">${c.emoji||'♡'}</div><div><p class="eyebrow">friend survey / character file</p><h3>${escapeHTML(c.name)}</h3><p><strong>${escapeHTML(c.role||'character')}</strong></p>${(c.facts||[]).map(f=>`<p>♡ ${escapeHTML(f)}</p>`).join('')}</div><p class="micro">${escapeHTML(c.note||'A page in progress...')}</p></article>`).join('')}
$$('[data-character]').forEach(b=>b.onclick=()=>{character=b.dataset.character;$$('[data-character]').forEach(x=>x.classList.toggle('active',x===b));renderCharacters()});
$('#addCharacter').onclick=()=>{const name=prompt('Character name?');if(!name)return;const role=prompt('A short description?')||'new face in the story';customCharacters.push({name,role,group:character,emoji:'🐚',facts:['new entry — add details later'],note:'A new page in Nin’s little archive.'});storage.set('characters',customCharacters);renderCharacters()};renderCharacters();

// Journal notes
$('#journalNote').value=storage.get('journalNote','');$('#saveJournal').onclick=()=>{storage.set('journalNote',$('#journalNote').value);toast('page saved in your notebook ♡')};

// Gallery: static repository files photo1.jpg etc + browser uploads
const galleryOverrides=storage.get('galleryData',[]);
const photoFiles=['photo1.jpg','photo2.jpg','photo3.jpg','photo4.jpg','photo5.jpg','photo6.jpg'];
function renderGallery(){const grid=$('#photoGrid');grid.innerHTML='';const entries=photoFiles.map((f,i)=>({src:'assets/photos/'+f,caption:'little memory no. '+(i+1),name:f})).concat(galleryOverrides.map((x,i)=>({...x,caption:x.name||'a little memory'})));entries.forEach((p,i)=>{const fig=document.createElement('figure');fig.className='photo-card';fig.style.setProperty('--tilt',((i%3)-1)+'deg');const img=document.createElement('img');img.src=p.src;img.alt=p.caption;img.onerror=()=>fig.remove();const cap=document.createElement('figcaption');cap.textContent=p.caption;fig.append(img,cap);grid.append(fig)})}
$('#photoUpload').onchange=async e=>{for(const file of e.target.files){if(!file.type.startsWith('image/'))continue;const data=await fileToData(file);galleryOverrides.push({src:data,name:file.name});}storage.set('galleryData',galleryOverrides);renderGallery();toast('photos added to this browser ♡');e.target.value=''};function fileToData(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)})}renderGallery();

// Playlist: repository files named music1.mp3 / music2.mp3 and covers music1.png / music2.png
const tracks={
 nin:[
  {file:'music1.mp3',cover:'music1.png',title:'a song for the sea',artist:'Nin’s choice',lyrics:'Add the original lyrics in app.js when you are ready.',translation:'Add your translation or personal notes here.'},
  {file:'music2.mp3',cover:'music2.png',title:'something on repeat',artist:'Nin’s choice',lyrics:'Lyrics will appear here.',translation:'Translation will appear here.'},
  {file:'music3.mp3',cover:'music3.png',title:'the long way home',artist:'Nin’s choice',lyrics:'Lyrics will appear here.',translation:'Translation will appear here.'}
 ],
 eri:[
  {file:'music4.mp3',cover:'music4.png',title:'under a different sky',artist:'Eri’s choice',lyrics:'Lyrics will appear here.',translation:'Translation will appear here.'},
  {file:'music5.mp3',cover:'music5.png',title:'checkmate',artist:'Eri’s choice',lyrics:'Lyrics will appear here.',translation:'Translation will appear here.'}
 ]};
let shelf='nin',trackIndex=0,localAudio=[];
const audio=$('#audioPlayer');
function currentTracks(){return tracks[shelf].concat(localAudio.filter(x=>x.shelf===shelf))}
function selectTrack(i,autoplay=false){const list=currentTracks();if(!list.length)return;trackIndex=(i+list.length)%list.length;const t=list[trackIndex];$('#trackTitle').textContent=t.title;$('#trackArtist').textContent=t.artist;$('#albumArt').src=t.coverData||('assets/covers/'+t.cover);$('#albumArt').onerror=()=>{$('#albumArt').src='assets/icons/album-placeholder.svg'};audio.src=t.url||('assets/music/'+t.file);$('#lyricsHeading').textContent=t.title+' / lyrics';$('#lyricsText').textContent=t.lyrics;$('#translationText').textContent=t.translation;renderTrackList();if(autoplay)audio.play().then(()=>setPlaying(true)).catch(()=>toast('add the audio file to assets/music first'))}
function renderTrackList(){$('#trackList').innerHTML='';currentTracks().forEach((t,i)=>{const b=document.createElement('button');b.className='track-item'+(i===trackIndex?' active':'');const im=document.createElement('img');im.className='track-thumb';im.src=t.coverData||('assets/covers/'+t.cover);im.onerror=()=>im.src='assets/icons/album-placeholder.svg';const info=document.createElement('span');info.innerHTML=`${escapeHTML(t.title)}<small>${escapeHTML(t.artist)}</small>`;const n=document.createElement('span');n.className='track-num';n.textContent=String(i+1).padStart(2,'0');b.append(im,info,n);b.onclick=()=>selectTrack(i,true);$('#trackList').append(b)})}
function setPlaying(v){$('#playPause').textContent=v?'Ⅱ':'▶';$('#disc').classList.toggle('spinning',v)}
$$('[data-shelf]').forEach(b=>b.onclick=()=>{shelf=b.dataset.shelf;trackIndex=0;$$('[data-shelf]').forEach(x=>x.classList.toggle('active',x===b));audio.pause();setPlaying(false);selectTrack(0)});
$('#playPause').onclick=()=>{if(!audio.src){selectTrack(0)}if(audio.paused)audio.play().then(()=>setPlaying(true)).catch(()=>toast('place the matching MP3 in assets/music'));else{audio.pause();setPlaying(false)}};
$('#prevTrack').onclick=()=>selectTrack(trackIndex-1,true);$('#nextTrack').onclick=()=>selectTrack(trackIndex+1,true);
audio.onplay=()=>setPlaying(true);audio.onpause=()=>setPlaying(false);audio.onended=()=>selectTrack(trackIndex+1,true);
function fmt(s){if(!isFinite(s))return'0:00';return Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0')}
audio.ontimeupdate=()=>{if(audio.duration){$('#progress').value=audio.currentTime/audio.duration*100;$('#currentTime').textContent=fmt(audio.currentTime);$('#duration').textContent=fmt(audio.duration)}};
$('#progress').oninput=()=>{if(audio.duration)audio.currentTime=audio.duration*$('#progress').value/100};$('#volume').oninput=()=>audio.volume=Number($('#volume').value);
$('#audioUpload').onchange=async e=>{for(const f of e.target.files){if(!f.type.startsWith('audio/'))continue;localAudio.push({file:f.name,title:f.name.replace(/\.[^.]+$/,''),artist:shelf==='nin'?'Nin’s choice':'Eri’s choice',url:URL.createObjectURL(f),shelf,cover:'',lyrics:'Add lyrics in app.js for your permanent playlist entry.',translation:'Add a translation or notes in app.js.'})}selectTrack(0);toast('audio added for this browser session');e.target.value=''};
selectTrack(0);

// Wonderland archive
const defaultEntries=[
 {title:'The Lobster Day',type:'event',desc:'A university celebration that seems to have become much more important than Nin expected.'},
 {title:'The glass office door',type:'place',desc:'A doorway, a half-heard exclamation, and a meeting that did not quite happen.'},
 {title:'Saints above!',type:'term',desc:'An unexpectedly memorable expression. It may become a recurring phrase.'},
 {title:'The orange seahorse',type:'term',desc:'A possible answer to a question nobody asked: where is the prince?'},
 {title:'Alice in Wonderland',type:'art',desc:'A reference point for the story’s dreamlike logic, transformations and absurd encounters.'}
];
let entries=storage.get('wonderEntries',defaultEntries);let wonderMode='characters';
function renderWonder(){const q=$('#wonderSearch').value.toLowerCase(),cat=$('#wonderCategory').value;let list=entries.filter(e=>(cat==='all'||e.type===cat)&&(`${e.title} ${e.desc}`.toLowerCase().includes(q)));if(wonderMode==='characters')list=list.filter(e=>e.type==='person');else list=list.filter(e=>e.type!=='person');$('#wonderCards').innerHTML=list.length?list.map(e=>`<article class="wonder-card"><span class="category">${escapeHTML(e.type)}</span><h3>${escapeHTML(e.title)}</h3><p>${escapeHTML(e.desc)}</p></article>`).join(''):'<p class="micro">nothing in this drawer yet. how suspicious.</p>'}
$$('[data-wonder]').forEach(b=>b.onclick=()=>{wonderMode=b.dataset.wonder;$$('[data-wonder]').forEach(x=>x.classList.toggle('active',x===b));$('#wonderCategory').value=wonderMode==='characters'?'person':'all';renderWonder()});
$('#wonderSearch').oninput=renderWonder;$('#wonderCategory').onchange=renderWonder;
$('#addEntry').onclick=()=>{const title=$('#entryTitle').value.trim(),desc=$('#entryDescription').value.trim(),type=$('#entryType').value;if(!title||!desc)return toast('give the note a title and a little description');entries.unshift({title,desc,type});storage.set('wonderEntries',entries);$('#entryTitle').value='';$('#entryDescription').value='';renderWonder();toast('pinned to wonderland ♡')};renderWonder();

// Tamagotchi: persistent stats, maximum 3 feedings per local calendar day
const todayKey=()=>new Date().toLocaleDateString('en-CA');
let pet=storage.get('pet',{hunger:82,happy:88,energy:91,feedDate:todayKey(),feeds:0,lastUpdate:Date.now()});
function updatePet(){const now=Date.now(),elapsed=Math.max(0,(now-(pet.lastUpdate||now))/3600000);pet.hunger=Math.max(0,pet.hunger-elapsed*3);pet.happy=Math.max(0,pet.happy-elapsed*1.2);pet.energy=Math.max(0,pet.energy-elapsed*.8);pet.lastUpdate=now;if(pet.feedDate!==todayKey()){pet.feedDate=todayKey();pet.feeds=0}storage.set('pet',pet);drawPet()}
function drawPet(){[['hunger', 'hungerBar','hungerValue'],['happy','happyBar','happyValue'],['energy','energyBar','energyValue']].forEach(([k,b,v])=>{$('#'+b).style.width=pet[k]+'%';$('#'+v).textContent=Math.round(pet[k])+'%'});const hungry=pet.hunger<35;$('#petFish').classList.toggle('hungry',hungry);$('#petMood').textContent=hungry?'Bubbles is getting hungry...':'Bubbles is having a lovely day.';$('#petMessage').textContent=hungry?'please... could i have a little snack? ♡':pet.happy>75?'psst... hi! i’m Bubbles. thanks for visiting!':'i miss you. wanna play?';const left=Math.max(0,3-pet.feeds);$('#feedLimit').textContent=`today's snacks: ${left} left`;$('#feedFish').disabled=left===0;$('#feedFish').textContent=left===0?'♡ all snacks used today':'♡ feed Bubbles'}
$('#feedFish').onclick=()=>{if(pet.feeds>=3)return;pet.feeds++;pet.hunger=Math.min(100,pet.hunger+28);pet.happy=Math.min(100,pet.happy+9);pet.lastUpdate=Date.now();storage.set('pet',pet);drawPet();toast('Bubbles says: nom nom! ♡')};
$('#petFishButton').onclick=()=>{pet.happy=Math.min(100,pet.happy+4);storage.set('pet',pet);drawPet();$('#petMessage').textContent='bloop! i like when you say hello. ♡'};
updatePet();setInterval(updatePet,60000);

// Simple draggable ring toss
let score=0;const ring=$('#ringPiece'),game=$('#ringGame');let dragging=false;
function moveRing(e){if(!dragging)return;const r=game.getBoundingClientRect();const x=Math.max(5,Math.min(r.width-35,e.clientX-r.left-20));const y=Math.max(45,Math.min(r.height-40,e.clientY-r.top-20));ring.style.left=x+'px';ring.style.top=y+'px';ring.style.bottom='auto'}
ring.addEventListener('pointerdown',e=>{dragging=true;ring.setPointerCapture(e.pointerId);moveRing(e)});
ring.addEventListener('pointermove',moveRing);
ring.addEventListener('pointerup',e=>{if(!dragging)return;dragging=false;const peg=$('#ringPeg').getBoundingClientRect(),rr=ring.getBoundingClientRect();const cx=rr.left+rr.width/2,cy=rr.top+rr.height/2,px=peg.left+peg.width/2,py=peg.top+peg.height/2;if(Math.hypot(cx-px,cy-py)<52){score++;$('#ringScore').textContent=score;$('#gameMessage').textContent='a perfect little splash!'}else $('#gameMessage').textContent='so close! try again';ring.style.left='15%';ring.style.top='auto';ring.style.bottom='24px'});
$('#resetGame').onclick=()=>{score=0;$('#ringScore').textContent='0';$('#gameMessage').textContent='give it a go!';ring.style.left='15%';ring.style.top='auto';ring.style.bottom='24px'};

// Tiny visitor counter is a local decorative counter, not a shared server counter.
let visits=storage.get('visits',1347)+1;storage.set('visits',visits);$('#visitorCounter').textContent=String(visits).padStart(6,'0');
