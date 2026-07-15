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

  function docs(container) {
    const key="ag-docs";
    container.innerHTML=`<h2 class="app-title">Docs</h2><div class="button-row"><button class="app-button" data-cmd="bold"><b>B</b></button><button class="app-button" data-cmd="italic"><i>I</i></button><button class="app-button" data-cmd="underline"><u>U</u></button><button class="app-button" data-cmd="insertUnorderedList">• List</button><button class="app-button" data-save>Save</button><button class="app-button" data-export>Export</button></div><div data-document contenteditable="true" style="margin:14px auto;background:white;color:#111;min-height:420px;max-width:760px;padding:clamp(24px,6vw,70px);box-shadow:var(--shadow);outline:none"></div>`;
    const editor=container.querySelector("[data-document]");editor.innerHTML=localStorage.getItem(key)||"<h1>Untitled document</h1><p>Start writing...</p>";
    container.querySelectorAll("[data-cmd]").forEach(b=>b.onclick=()=>document.execCommand(b.dataset.cmd));
    container.querySelector("[data-save]").onclick=()=>localStorage.setItem(key,editor.innerHTML);
    container.querySelector("[data-export]").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([editor.innerText],{type:"text/plain"}));a.download="document.txt";a.click()};
  }

  function slides(container) {
    const key="ag-slides";let slidesData=JSON.parse(localStorage.getItem(key)||'[{"title":"Untitled Presentation","body":"Click to edit"}]'),active=0;
    const draw=()=>{container.innerHTML=`<h2 class="app-title">Slides</h2><div class="button-row"><button class="app-button" data-add>Add slide</button><button class="app-button" data-delete>Delete</button><button class="app-button" data-save>Save</button><button class="app-button" data-present>Present</button></div><div style="display:grid;grid-template-columns:minmax(100px,20%) 1fr;gap:12px;margin-top:12px"><div data-thumbs></div><div data-slide style="aspect-ratio:16/9;background:white;color:#111;padding:8%;display:flex;flex-direction:column;justify-content:center;text-align:center"><h1 contenteditable="true">${slidesData[active].title}</h1><p contenteditable="true">${slidesData[active].body}</p></div></div>`;const slide=container.querySelector("[data-slide]");const commit=()=>{slidesData[active]={title:slide.querySelector("h1").innerText,body:slide.querySelector("p").innerText}};slidesData.forEach((s,i)=>{const b=document.createElement("button");b.className="file-item";b.style="width:100%;margin-bottom:8px";b.textContent=`${i+1}. ${s.title}`;b.onclick=()=>{commit();active=i;draw()};container.querySelector("[data-thumbs]").appendChild(b)});container.querySelector("[data-add]").onclick=()=>{commit();slidesData.push({title:"New Slide",body:"Add content"});active=slidesData.length-1;draw()};container.querySelector("[data-delete]").onclick=()=>{if(slidesData.length>1){slidesData.splice(active,1);active=Math.max(0,active-1);draw()}};container.querySelector("[data-save]").onclick=()=>{commit();localStorage.setItem(key,JSON.stringify(slidesData))};container.querySelector("[data-present]").onclick=()=>{commit();slide.requestFullscreen?.()};};draw();
  }

  function contacts(container) {
    const key="ag-contacts"; const render=()=>{const data=JSON.parse(localStorage.getItem(key)||"[]");container.innerHTML=`<h2 class="app-title">Contacts</h2><div class="auth-code-row"><input class="app-input" placeholder="Name"><input class="app-input" placeholder="Email"></div><button class="app-button" style="margin-top:10px">Add</button><div style="margin-top:14px">${data.map(x=>`<div class="file-item" style="margin-bottom:8px">${x.name} — ${x.email}</div>`).join("")}</div>`;container.querySelector("button").onclick=()=>{const i=container.querySelectorAll("input");if(i[0].value&&i[1].value){data.push({name:i[0].value,email:i[1].value});localStorage.setItem(key,JSON.stringify(data));render()}}};render();
  }

  function viewer(title, accept) { return container=>{container.innerHTML=`<h2 class="app-title">${title}</h2><p class="app-description">Choose a local file to inspect.</p><input class="app-input" type="file" accept="${accept}"><pre class="file-item" style="margin-top:14px;white-space:pre-wrap;max-height:300px;overflow:auto"></pre>`;const i=container.querySelector("input"),o=container.querySelector("pre");i.onchange=()=>{const f=i.files[0];if(!f)return;o.textContent=`${f.name}\n${f.type||"Unknown type"}\n${f.size.toLocaleString()} bytes`;};}; }

  window.ANTIGRAVITY_OPTIONAL_APPS = [
    {key:"audio",title:"Audio Player",icon:"♫",render:mediaApp("audio")},
    {key:"video",title:"Video Player",icon:"▶",render:mediaApp("video")},
    {key:"docs",title:"Docs",icon:"D",render:docs},
    {key:"sheets",title:"Sheets",icon:"S",render:spreadsheet},
    {key:"slides",title:"Slides",icon:"▰",render:slides},
    {key:"contacts",title:"Contacts",icon:"☻",render:contacts},
    {key:"archive",title:"Archive Viewer",icon:"▣",render:viewer("Archive Viewer",".zip,.rar,.7z")},
    {key:"pdf",title:"PDF Viewer",icon:"PDF",render:viewer("PDF Viewer","application/pdf")},
    {key:"calendar",title:"Calendar",icon:"□",render:container=>{container.innerHTML=`<h2 class="app-title">Calendar</h2><div style="font-size:28px;text-align:center;margin-top:60px">${new Date().toLocaleDateString(undefined,{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>`;}}
  ];
})();
