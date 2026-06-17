const PizzaGame = (() => {
  // ── State ──
  let eaten = new Array(6).fill(false);
  let eatenCount = 0;

  // Approximate visual centers of each 60° wedge (SVG coords)
  const sliceCentroids = [
    {x:240,y:118},{x:318,y:200},{x:285,y:295},
    {x:165,y:305},{x:90,y:200},{x:118,y:118},
  ];

  const comicWords = ['MUNCH!','NOM NOM!','CHOMP!','CRUNCH!','YUMMY!','SLURP!','DEVOURED!','RIZZED UP!','IT HIT 🔥','NO CAP!','BUSSIN!','SLAY! 💅','PERIODT!'];
  const wordColors = ['#ffd700','#ff4500','#00ff88','#ff00ff','#00cfff','#ffaa00'];

  function playMunch() {
    /* ── AUDIO COMMENTED OUT AS REQUESTED ── */
    // Paste your munch audio files logic here
    /*
    const audio = new Audio('path/to/munch.mp3');
    audio.play();
    */
  }

  function playBurp() {
    /* ── AUDIO COMMENTED OUT AS REQUESTED ── */
    // Paste your burp audio files logic here
    /*
    const audio = new Audio('path/to/burp.mp3');
    audio.play();
    */
  }

  function spawnComicPop(idx) {
    const wrap = document.getElementById('pizza-wrap');
    const svg  = document.getElementById('pizza-svg');
    if (!wrap || !svg) return;
    
    const svgRect  = svg.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    const scaleX = svgRect.width / 400, scaleY = svgRect.height / 400;
    const cx = sliceCentroids[idx].x * scaleX + (svgRect.left - wrapRect.left);
    const cy = sliceCentroids[idx].y * scaleY + (svgRect.top  - wrapRect.top);
    const col = wordColors[Math.floor(Math.random()*wordColors.length)];

    // Starburst SVG
    const burst = document.createElementNS('http://www.w3.org/2000/svg','svg');
    burst.setAttribute('width','90'); burst.setAttribute('height','90');
    burst.setAttribute('viewBox','-45 -45 90 90');
    burst.style.cssText=`position:absolute;left:${cx}px;top:${cy}px;z-index:99;pointer-events:none;`;
    burst.classList.add('star-burst');
    const pts=[];
    for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2,r=i%2===0?42:18;pts.push(`${Math.cos(a)*r},${Math.sin(a)*r}`);}
    burst.innerHTML=`<polygon points="${pts.join(' ')}" fill="${col}" opacity="0.85"/>`;
    wrap.appendChild(burst);
    setTimeout(()=>burst.remove(),800);

    // Word
    const word = document.createElement('div');
    word.className='comic-pop';
    word.style.left=cx+'px'; word.style.top=cy+'px'; word.style.color=col;
    word.textContent=comicWords[Math.floor(Math.random()*comicWords.length)];
    wrap.appendChild(word);
    setTimeout(()=>word.remove(),850);
  }

  function spawnCrumbs(idx) {
    const wrap = document.getElementById('pizza-wrap');
    const svg  = document.getElementById('pizza-svg');
    if (!wrap || !svg) return;

    const svgRect  = svg.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    const scaleX = svgRect.width/400, scaleY = svgRect.height/400;
    const cx = sliceCentroids[idx].x*scaleX + (svgRect.left-wrapRect.left);
    const cy = sliceCentroids[idx].y*scaleY + (svgRect.top -wrapRect.top);
    const colors=['#f5c842','#c03008','#8b4513','#f5b942','#2d8b2d'];
    for(let i=0;i<12;i++){
      const p=document.createElement('div'); p.className='crumb-particle';
      const angle=Math.random()*Math.PI*2, dist=40+Math.random()*80;
      const dx=Math.cos(angle)*dist, dy=Math.sin(angle)*dist;
      const size=4+Math.random()*8;
      p.style.cssText=`left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;
        background:${colors[Math.floor(Math.random()*colors.length)]};
        --dx:${dx}px;--dy:${dy}px;
        border-radius:${Math.random()>0.5?'50%':'3px'};
        animation:crumbFly ${0.4+Math.random()*0.4}s ease-out forwards;`;
      wrap.appendChild(p);
      setTimeout(()=>p.remove(),900);
    }
  }

  // ── Build plate residue (called once on page load) ──
  function buildPlate() {
    const plate = document.getElementById('plate');
    if (!plate || plate.children.length > 0) return; // Only build once
    
    const grease = [
      {l:30,t:25,w:80,h:60},{l:55,t:50,w:100,h:70},{l:20,t:55,w:60,h:50},
      {l:60,t:20,w:70,h:55},{l:35,t:60,w:90,h:65},{l:10,t:35,w:55,h:45},
      {l:50,t:65,w:80,h:55},{l:65,t:40,w:65,h:50},{l:25,t:45,w:75,h:60},
      {l:45,t:30,w:95,h:65},{l:15,t:60,w:70,h:50},{l:70,t:55,w:60,h:45},
    ];
    grease.forEach(g=>{
      const el=document.createElement('div'); el.className='grease';
      el.style.cssText=`left:${g.l}%;top:${g.t}%;width:${g.w}px;height:${g.h}px;`;
      plate.appendChild(el);
    });
    const cheese=[
      {l:38,t:28,w:22,h:8,r:-25},{l:52,t:60,w:18,h:6,r:40},{l:28,t:55,w:15,h:7,r:-15},
      {l:62,t:35,w:20,h:7,r:60},{l:44,t:70,w:16,h:6,r:-35},{l:32,t:42,w:14,h:6,r:20},
      {l:58,t:65,w:19,h:7,r:-50},{l:48,t:38,w:17,h:6,r:30},{l:22,t:48,w:13,h:5,r:-20},
      {l:68,t:48,w:15,h:6,r:10},{l:40,t:22,w:20,h:7,r:45},{l:55,t:75,w:14,h:5,r:-30},
    ];
    cheese.forEach(c=>{
      const el=document.createElement('div'); el.className='cheese-bit';
      el.style.cssText=`left:${c.l}%;top:${c.t}%;width:${c.w}px;height:${c.h}px;--r:${c.r}deg;`;
      plate.appendChild(el);
    });
    const sauce=[
      {l:35,t:30,w:55,h:35},{l:55,t:55,w:50,h:30},{l:20,t:50,w:45,h:28},
      {l:60,t:30,w:40,h:25},{l:40,t:65,w:52,h:32},
    ];
    sauce.forEach(s=>{
      const el=document.createElement('div'); el.className='sauce-smear';
      el.style.cssText=`left:${s.l}%;top:${s.t}%;width:${s.w}px;height:${s.h}px;`;
      plate.appendChild(el);
    });
    for(let i=0;i<18;i++){
      const el=document.createElement('div'); el.className='crust-crumb';
      const sz=3+Math.random()*7;
      el.style.cssText=`left:${15+Math.random()*70}%;top:${15+Math.random()*70}%;
        width:${sz}px;height:${sz}px;opacity:${0.4+Math.random()*0.5};`;
      plate.appendChild(el);
    }
  }

  function eatSlice(idx) {
    if (eaten[idx]) return;
    eaten[idx] = true; eatenCount++;
    const group = document.getElementById(`slice-${idx}`);
    playMunch();
    spawnComicPop(idx);
    spawnCrumbs(idx);
    group.classList.add('vanishing');
    setTimeout(()=>{ group.style.display='none'; group.classList.remove('vanishing'); group.classList.add('eaten'); }, 650);
    
    if (eatenCount === 6) {
      setTimeout(()=>{
        playBurp();
        const overlay = document.getElementById('burp-overlay');
        if (overlay) {
            overlay.classList.add('show');
            setTimeout(() => {
                overlay.classList.remove('show');
                resetPizzaGame();
            }, 3000);
        }
      }, 800);
    }
  }

  function resetPizzaGame() {
    eaten.fill(false);
    eatenCount = 0;
    
    // Show all slices again
    for (let i = 0; i < 6; i++) {
        const group = document.getElementById(`slice-${i}`);
        if (group) {
            group.style.display = 'block';
            group.classList.remove('eaten');
        }
    }
  }

  function init() {
    buildPlate();
    document.querySelectorAll('.slice-group').forEach(g => {
      // Avoid multiple event listeners
      g.replaceWith(g.cloneNode(true));
    });
    document.querySelectorAll('.slice-group').forEach(g => {
      g.addEventListener('click', () => eatSlice(parseInt(g.dataset.idx)));
    });
  }

  return { init };
})();

// Initialize on DOM load just in case, but usually init when shown
document.addEventListener('DOMContentLoaded', () => {
    PizzaGame.init();
});
