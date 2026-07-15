(function () {
  "use strict";

  function mediaApp(kind) {
    return function (container) {
      const accept = kind === "audio" ? "audio/*" : "video/*";
      container.innerHTML = `<h2 class="app-title">${kind === "audio" ? "Audio Player" : "Video Player"}</h2><p class="app-description">Open a local ${kind} file.</p><input class="app-input" type="file" accept="${accept}"><${kind} controls style="width:100%;margin-top:16px;"></${kind}>`;
      const input = container.querySelector("input");
      const player = container.querySelector(kind);
      input.addEventListener("change", () => { if (input.files[0]) player.src = URL.createObjectURL(input.files[0]); });
    };
  }

  function simplePad(title, key) {
    return function (container) {
      container.innerHTML = `<h2 class="app-title">${title}</h2><textarea class="app-textarea" placeholder="Start writing..."></textarea><button class="app-button" style="margin-top:10px;">Save</button>`;
      const area = container.querySelector("textarea");
      area.value = localStorage.getItem(key) || "";
      container.querySelector("button").addEventListener("click", () => localStorage.setItem(key, area.value));
    };
  }

  function spreadsheet(container) {
    container.innerHTML = `<h2 class="app-title">Sheets</h2><p class="app-description">Editable 8 × 6 worksheet.</p><div style="overflow:auto"><table class="info-table">${Array.from({length:8},(_,r)=>`<tr>${Array.from({length:6},(_,c)=>`<td contenteditable="true" data-cell="${r}-${c}"></td>`).join("")}</tr>`).join("")}</table></div><button class="app-button" style="margin-top:10px;">Save sheet</button>`;
    const saved = JSON.parse(localStorage.getItem("ag-sheet") || "{}");
    container.querySelectorAll("[data-cell]").forEach((cell) => cell.textContent = saved[cell.dataset.cell] || "");
    container.querySelector("button").addEventListener("click", () => { const data={}; container.querySelectorAll("[data-cell]").forEach(c=>data[c.dataset.cell]=c.textContent); localStorage.setItem("ag-sheet",JSON.stringify(data)); });
  }

  function paint(container) {
    container.innerHTML = `<h2 class="app-title">Paint</h2><canvas width="700" height="380" style="width:100%;background:white;border-radius:8px;touch-action:none"></canvas><button class="app-button" style="margin-top:10px;">Clear</button>`;
    const canvas=container.querySelector("canvas"),ctx=canvas.getContext("2d"); let drawing=false;
    const point=e=>{const r=canvas.getBoundingClientRect();return[(e.clientX-r.left)*canvas.width/r.width,(e.clientY-r.top)*canvas.height/r.height]};
    canvas.addEventListener("pointerdown",e=>{drawing=true;ctx.beginPath();ctx.moveTo(...point(e));canvas.setPointerCapture(e.pointerId)});
    canvas.addEventListener("pointermove",e=>{if(drawing){ctx.lineWidth=3;ctx.strokeStyle="#111";ctx.lineTo(...point(e));ctx.stroke()}});
    canvas.addEventListener("pointerup",()=>drawing=false); container.querySelector("button").onclick=()=>ctx.clearRect(0,0,canvas.width,canvas.height);
  }

  function contacts(container) {
    const key="ag-contacts"; const render=()=>{const data=JSON.parse(localStorage.getItem(key)||"[]");container.innerHTML=`<h2 class="app-title">Contacts</h2><div class="auth-code-row"><input class="app-input" placeholder="Name"><input class="app-input" placeholder="Email"></div><button class="app-button" style="margin-top:10px">Add</button><div style="margin-top:14px">${data.map(x=>`<div class="file-item" style="margin-bottom:8px">${x.name} — ${x.email}</div>`).join("")}</div>`;container.querySelector("button").onclick=()=>{const i=container.querySelectorAll("input");if(i[0].value&&i[1].value){data.push({name:i[0].value,email:i[1].value});localStorage.setItem(key,JSON.stringify(data));render()}}};render();
  }

  function clock(container) { container.innerHTML='<h2 class="app-title">Clock</h2><div style="font-size:48px;color:var(--primary);text-align:center;margin-top:70px" id="agClock"></div>'; const tick=()=>{const e=container.querySelector("#agClock");if(e)e.textContent=new Date().toLocaleTimeString()};tick();setInterval(tick,1000); }
  function viewer(title, accept) { return container=>{container.innerHTML=`<h2 class="app-title">${title}</h2><p class="app-description">Choose a local file to inspect.</p><input class="app-input" type="file" accept="${accept}"><pre class="file-item" style="margin-top:14px;white-space:pre-wrap;max-height:300px;overflow:auto"></pre>`;const i=container.querySelector("input"),o=container.querySelector("pre");i.onchange=()=>{const f=i.files[0];if(!f)return;o.textContent=`${f.name}\n${f.type||"Unknown type"}\n${f.size.toLocaleString()} bytes`;};}; }

  window.ANTIGRAVITY_OPTIONAL_APPS = [
    {key:"audio",title:"Audio Player",icon:"♫",render:mediaApp("audio")},
    {key:"video",title:"Video Player",icon:"▶",render:mediaApp("video")},
    {key:"writer",title:"Writer",icon:"W",render:simplePad("Writer","ag-writer")},
    {key:"sheets",title:"Sheets",icon:"▦",render:spreadsheet},
    {key:"slides",title:"Slides",icon:"▰",render:simplePad("Slides Outline","ag-slides")},
    {key:"paint",title:"Paint",icon:"✎",render:paint},
    {key:"contacts",title:"Contacts",icon:"☻",render:contacts},
    {key:"clock",title:"Clock",icon:"◷",render:clock},
    {key:"archive",title:"Archive Viewer",icon:"▣",render:viewer("Archive Viewer",".zip,.rar,.7z")},
    {key:"pdf",title:"PDF Viewer",icon:"PDF",render:viewer("PDF Viewer","application/pdf")},
    {key:"mail",title:"Mail Drafts",icon:"✉",render:simplePad("Mail Drafts","ag-mail")},
    {key:"calendar",title:"Calendar",icon:"□",render:container=>{container.innerHTML=`<h2 class="app-title">Calendar</h2><div style="font-size:28px;text-align:center;margin-top:60px">${new Date().toLocaleDateString(undefined,{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>`;}}
  ];
})();
