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
    const key = "ag-slides";
    let slidesData = JSON.parse(localStorage.getItem(key) || '[{"title":"Untitled Presentation","body":"Click to edit"}]');
    let active = 0;
    let presentationSlide = null;
    const undoStack = [], redoStack = [];
    const remember = () => { undoStack.push(JSON.stringify({slidesData,active})); if(undoStack.length>50) undoStack.shift(); redoStack.length=0; };
    const restoreHistory = (from,to) => { if(!from.length)return; to.push(JSON.stringify({slidesData,active})); const previous=JSON.parse(from.pop()); slidesData=previous.slidesData; active=previous.active; draw(); };

    const renderPresentedSlide = () => {
      if (!presentationSlide) return;
      presentationSlide.querySelector("h1").textContent = slidesData[active].title;
      presentationSlide.querySelector("p").textContent = slidesData[active].body;
      presentationSlide.querySelector("[data-slide-count]").textContent = `${active + 1} / ${slidesData.length}`;
    };

    const handlePresentationKey = (event) => {
      if (document.fullscreenElement !== presentationSlide) return;
      if (["ArrowRight", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        active = Math.min(slidesData.length - 1, active + 1);
        renderPresentedSlide();
      } else if (["ArrowLeft", "PageUp"].includes(event.key)) {
        event.preventDefault();
        active = Math.max(0, active - 1);
        renderPresentedSlide();
      } else if (event.key === "Home") {
        event.preventDefault();
        active = 0;
        renderPresentedSlide();
      } else if (event.key === "End") {
        event.preventDefault();
        active = slidesData.length - 1;
        renderPresentedSlide();
      }
    };

    const leavePresentation = () => {
      if (document.fullscreenElement) return;
      document.removeEventListener("keydown", handlePresentationKey, true);
      document.removeEventListener("fullscreenchange", leavePresentation);
      presentationSlide = null;
      draw();
    };

    const draw = () => {
      container.innerHTML = `<h2 class="app-title">Slides</h2><div class="button-row"><button class="app-button" data-add>Add slide</button><button class="app-button" data-duplicate>Duplicate</button><button class="app-button" data-move-up>Move up</button><button class="app-button" data-move-down>Move down</button><button class="app-button" data-delete>Delete</button><input type="color" data-background value="${slidesData[active].background||'#ffffff'}" title="Slide background"><button class="app-button" data-save>Save</button><button class="app-button" data-present>Present</button></div><div style="display:grid;grid-template-columns:minmax(100px,20%) 1fr;gap:12px;margin-top:12px"><div data-thumbs></div><div data-slide style="position:relative;aspect-ratio:16/9;background:${slidesData[active].background||'white'};color:#111;padding:8%;display:flex;flex-direction:column;justify-content:center;text-align:center"><h1 contenteditable="true">${slidesData[active].title}</h1><p contenteditable="true">${slidesData[active].body}</p><span data-slide-count style="display:none;position:absolute;right:20px;bottom:14px;font-size:12px;color:#666"></span></div></div>`;
      const slide = container.querySelector("[data-slide]");
      const toolbar = container.querySelector(".button-row");
      const undoButton=document.createElement("button"),redoButton=document.createElement("button");undoButton.className=redoButton.className="app-button";undoButton.textContent="Undo";redoButton.textContent="Redo";toolbar.prepend(redoButton);toolbar.prepend(undoButton);
      const backgroundInput=container.querySelector("[data-background]"),backgroundLabel=document.createElement("label");backgroundLabel.className="app-button";backgroundLabel.textContent="Background ";backgroundInput.style.cssText="width:26px;height:20px;margin-left:6px;vertical-align:middle";backgroundInput.replaceWith(backgroundLabel);backgroundLabel.appendChild(backgroundInput);
      const commit = () => { slidesData[active] = { ...slidesData[active], title: slide.querySelector("h1").innerText, body: slide.querySelector("p").innerText }; };
      slidesData.forEach((item, index) => {
        const button = document.createElement("button");
        button.className = "file-item";
        button.style = "width:100%;margin-bottom:8px";
        button.textContent = `${index + 1}. ${item.title}`;
        button.onclick = () => { commit(); active = index; draw(); };
        container.querySelector("[data-thumbs]").appendChild(button);
      });
      undoButton.onclick=()=>restoreHistory(undoStack,redoStack);redoButton.onclick=()=>restoreHistory(redoStack,undoStack);
      container.onkeydown=event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="z"){event.preventDefault();restoreHistory(event.shiftKey?redoStack:undoStack,event.shiftKey?undoStack:redoStack)}else if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="y"){event.preventDefault();restoreHistory(redoStack,undoStack)}};
      container.querySelector("[data-add]").onclick = () => { commit(); remember(); slidesData.push({ title: "New Slide", body: "Add content" }); active = slidesData.length - 1; draw(); };
      container.querySelector("[data-duplicate]").onclick = () => { commit(); remember(); slidesData.splice(active + 1, 0, { ...slidesData[active] }); active += 1; draw(); };
      container.querySelector("[data-move-up]").onclick = () => { commit(); remember(); if (active > 0) { [slidesData[active - 1], slidesData[active]] = [slidesData[active], slidesData[active - 1]]; active -= 1; } draw(); };
      container.querySelector("[data-move-down]").onclick = () => { commit(); remember(); if (active < slidesData.length - 1) { [slidesData[active + 1], slidesData[active]] = [slidesData[active], slidesData[active + 1]]; active += 1; } draw(); };
      container.querySelector("[data-background]").onchange = event => { remember(); slidesData[active].background = event.target.value; slide.style.background = event.target.value; };
      container.querySelector("[data-delete]").onclick = () => { if (slidesData.length > 1) { remember(); slidesData.splice(active, 1); active = Math.max(0, active - 1); draw(); } };
      container.querySelector("[data-save]").onclick = () => { commit(); localStorage.setItem(key, JSON.stringify(slidesData)); };
      container.querySelector("[data-present]").onclick = async () => {
        commit();
        presentationSlide = slide;
        slide.querySelector("h1").contentEditable = "false";
        slide.querySelector("p").contentEditable = "false";
        slide.querySelector("[data-slide-count]").style.display = "block";
        renderPresentedSlide();
        document.addEventListener("keydown", handlePresentationKey, true);
        document.addEventListener("fullscreenchange", leavePresentation);
        try {
          await slide.requestFullscreen();
        } catch (error) {
          document.removeEventListener("keydown", handlePresentationKey, true);
          document.removeEventListener("fullscreenchange", leavePresentation);
          presentationSlide = null;
          draw();
        }
      };
    };
    draw();
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

  const esc = value => String(value ?? "").replace(/[&<>"']/g, character => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[character]));
  const appByKey = key => window.ANTIGRAVITY_OPTIONAL_APPS.find(app => app.key === key);
  const session = () => window.ANTIGRAVITY_APP_RUNTIME?.getSession?.() || {id:"local-user",username:"user",email:"",companyName:"Local"};
  const userKey = base => `${base}:${session().id}`;

  appByKey("docs").render = container => {
    const key=userKey("ag-docs-v2");
    container.innerHTML=`<h2 class="app-title">Docs</h2><div class="button-row" data-tools><select class="app-select" data-block style="width:auto"><option value="p">Normal</option><option value="h1">Heading 1</option><option value="h2">Heading 2</option></select><select class="app-select" data-size style="width:auto"><option>2</option><option selected>3</option><option>4</option><option>5</option><option>6</option></select><button class="app-button" data-cmd="bold"><b>B</b></button><button class="app-button" data-cmd="italic"><i>I</i></button><button class="app-button" data-cmd="underline"><u>U</u></button><button class="app-button" data-cmd="justifyLeft">Left</button><button class="app-button" data-cmd="justifyCenter">Center</button><button class="app-button" data-cmd="justifyRight">Right</button><button class="app-button" data-cmd="insertUnorderedList">Bullets</button><button class="app-button" data-cmd="insertOrderedList">Numbering</button><button class="app-button" data-cmd="undo">Undo</button><button class="app-button" data-cmd="redo">Redo</button><input type="color" data-color title="Text color"><button class="app-button" data-new>New</button><button class="app-button" data-save>Save</button><button class="app-button" data-export>Export</button><button class="app-button" data-print>Print</button></div><div data-doc contenteditable="true" style="margin:14px auto;background:white;color:#111;min-height:520px;max-width:820px;padding:clamp(28px,7vw,76px);box-shadow:var(--shadow);outline:none"></div><p class="app-description" data-count></p>`;
    const editor=container.querySelector("[data-doc]"),count=container.querySelector("[data-count]"); editor.innerHTML=localStorage.getItem(key)||"<h1>Untitled document</h1><p>Start writing...</p>";
    const pageSizes={A4:[794,1123],Letter:[816,1056],Legal:[816,1344],A5:[559,794],Executive:[696,1008]};const pageSelect=document.createElement("select");pageSelect.className="app-select";pageSelect.style.width="auto";pageSelect.innerHTML=Object.keys(pageSizes).map(name=>`<option>${name}</option>`).join("");pageSelect.title="Page size";container.querySelector("[data-tools]").prepend(pageSelect);const applyPageSize=()=>{const [width,height]=pageSizes[pageSelect.value];editor.style.width=`min(100%, ${width}px)`;editor.style.minHeight=`${height}px`};pageSelect.onchange=applyPageSize;applyPageSize();
    const colorInput=container.querySelector("[data-color]"),colorLabel=document.createElement("label");colorLabel.className="app-button";colorLabel.textContent="Text color ";colorInput.style.cssText="width:26px;height:20px;margin-left:6px;vertical-align:middle";colorInput.replaceWith(colorLabel);colorLabel.appendChild(colorInput);
    const update=()=>{const words=editor.innerText.trim().split(/\s+/).filter(Boolean).length;count.textContent=`${words} words · ${editor.innerText.length} characters`;}; update(); editor.oninput=update;
    container.querySelectorAll("[data-cmd]").forEach(button=>button.onclick=()=>document.execCommand(button.dataset.cmd)); container.querySelector("[data-block]").onchange=e=>document.execCommand("formatBlock",false,e.target.value); container.querySelector("[data-size]").onchange=e=>document.execCommand("fontSize",false,e.target.value); container.querySelector("[data-color]").oninput=e=>document.execCommand("foreColor",false,e.target.value);
    editor.onkeydown=event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="z"){event.preventDefault();document.execCommand(event.shiftKey?"redo":"undo")}else if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="y"){event.preventDefault();document.execCommand("redo")}};
    container.querySelector("[data-new]").onclick=()=>{if(confirm("Create a new document?")){editor.innerHTML="<h1>Untitled document</h1><p></p>";update();}}; container.querySelector("[data-save]").onclick=()=>localStorage.setItem(key,editor.innerHTML); container.querySelector("[data-export]").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([`<!doctype html><meta charset="utf-8"><body>${editor.innerHTML}</body>`],{type:"text/html"}));a.download="document.html";a.click();}; container.querySelector("[data-print]").onclick=()=>{const w=open("","_blank");w.document.write(editor.innerHTML);w.document.close();w.print();};
  };

  appByKey("sheets").render = container => {
    const key=userKey("ag-sheets-v2"),rows=30,cols=12,data=JSON.parse(localStorage.getItem(key)||"{}");let selected="A1";
    const undoStack=[],redoStack=[];const remember=()=>{undoStack.push(JSON.stringify(data));if(undoStack.length>50)undoStack.shift();redoStack.length=0};const restore=(from,to)=>{if(!from.length)return;to.push(JSON.stringify(data));const previous=JSON.parse(from.pop());Object.keys(data).forEach(k=>delete data[k]);Object.assign(data,previous);draw()};
    const colName=n=>String.fromCharCode(65+n); const calculated=(id,seen=new Set())=>{if(seen.has(id))return"#CYCLE!";seen.add(id);const raw=String(data[id]?.value||"");if(!raw.startsWith("="))return raw;try{let expression=raw.slice(1).replace(/(SUM|AVERAGE|MIN|MAX)\(([A-L]\d+):([A-L]\d+)\)/gi,(_,fn,start,end)=>{const column=start[0],from=Number(start.slice(1)),to=Number(end.slice(1)),values=[];for(let row=from;row<=to;row++)values.push(Number(calculated(`${column}${row}`,new Set(seen)))||0);return fn.toUpperCase()==="SUM"?values.reduce((a,b)=>a+b,0):fn.toUpperCase()==="AVERAGE"?values.reduce((a,b)=>a+b,0)/values.length:fn.toUpperCase()==="MIN"?Math.min(...values):Math.max(...values)}).replace(/\b[A-L]\d+\b/g,ref=>Number(calculated(ref,new Set(seen)))||0);if(!/^[0-9+\-*/().\s]+$/.test(expression))throw 0;return String(Function(`return (${expression})`)())}catch{return"#ERROR!"}}; const draw=()=>{container.innerHTML=`<h2 class="app-title">Sheets</h2><div class="button-row"><button class="app-button" data-new>New</button><button class="app-button" data-save>Save</button><button class="app-button" data-csv>Export CSV</button><button class="app-button" data-bold><b>B</b></button><input type="color" data-fill title="Cell fill"><input class="app-input" data-name value="${selected}" style="width:70px"><input class="app-input" data-formula placeholder="Value or =SUM(A1:A5)" style="flex:1;min-width:180px"></div><div style="overflow:auto;max-height:520px;margin-top:12px"><table class="info-table" style="min-width:900px"><thead><tr><th></th>${Array.from({length:cols},(_,c)=>`<th>${colName(c)}</th>`).join("")}</tr></thead><tbody>${Array.from({length:rows},(_,r)=>`<tr><th>${r+1}</th>${Array.from({length:cols},(_,c)=>{const id=`${colName(c)}${r+1}`,cell=data[id]||{};return`<td contenteditable data-cell="${id}" style="min-width:90px;background:${cell.fill||"transparent"};font-weight:${cell.bold?"700":"400"}">${esc(calculated(id))}</td>`}).join("")}</tr>`).join("")}</tbody></table></div>`;
      const formula=container.querySelector("[data-formula]");container.querySelectorAll("[data-cell]").forEach(cell=>{cell.onclick=()=>{selected=cell.dataset.cell;container.querySelector("[data-name]").value=selected;formula.value=data[selected]?.value||"";};cell.oninput=()=>{data[cell.dataset.cell]={...(data[cell.dataset.cell]||{}),value:cell.innerText};};}); formula.onchange=()=>{data[selected]={...(data[selected]||{}),value:formula.value};draw();};container.querySelector("[data-save]").onclick=()=>localStorage.setItem(key,JSON.stringify(data));container.querySelector("[data-new]").onclick=()=>{if(confirm("Clear this workbook?")){Object.keys(data).forEach(k=>delete data[k]);draw();}};container.querySelector("[data-bold]").onclick=()=>{data[selected]={...(data[selected]||{}),bold:!data[selected]?.bold};draw();};container.querySelector("[data-fill]").oninput=e=>{data[selected]={...(data[selected]||{}),fill:e.target.value};draw();};container.querySelector("[data-csv]").onclick=()=>{const csv=Array.from({length:rows},(_,r)=>Array.from({length:cols},(_,c)=>JSON.stringify(data[`${colName(c)}${r+1}`]?.value||"")).join(",")).join("\n"),a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="workbook.csv";a.click();};
      container.querySelectorAll("[data-cell]").forEach(cell=>{const saved=data[cell.dataset.cell]||{};cell.style.border=saved.border||"1px solid var(--border)";["Top","Bottom","Left","Right"].forEach(side=>{if(saved[`border${side}`])cell.style[`border${side}`]=saved[`border${side}`]});cell.onfocus=()=>remember();});
      const toolbar=container.querySelector(".button-row"),undo=document.createElement("button"),redo=document.createElement("button"),border=document.createElement("select");undo.className=redo.className="app-button";undo.textContent="Undo";redo.textContent="Redo";border.className="app-select";border.style.width="auto";border.title="Cell borders";border.innerHTML='<option value="">Borders</option><option value="all">All borders</option><option value="none">No border</option><option value="top">Top border</option><option value="bottom">Bottom border</option><option value="left">Left border</option><option value="right">Right border</option>';toolbar.prepend(border);toolbar.prepend(redo);toolbar.prepend(undo);undo.onclick=()=>restore(undoStack,redoStack);redo.onclick=()=>restore(redoStack,undoStack);border.onchange=()=>{remember();const cell=data[selected]||(data[selected]={}),choice=border.value;delete cell.borderTop;delete cell.borderBottom;delete cell.borderLeft;delete cell.borderRight;if(choice==="none")cell.border="none";else if(choice==="all")cell.border="1px solid currentColor";else if(choice){cell.border="1px solid var(--border)";cell[`border${choice[0].toUpperCase()+choice.slice(1)}`]="2px solid currentColor"}draw()};
      const fill=container.querySelector("[data-fill]"),fillLabel=document.createElement("label");fillLabel.className="app-button";fillLabel.textContent="Fill color ";fill.style.cssText="width:26px;height:20px;margin-left:6px;vertical-align:middle";fill.replaceWith(fillLabel);fillLabel.appendChild(fill);fill.onchange=e=>{remember();data[selected]={...(data[selected]||{}),fill:e.target.value};draw()};
      container.onkeydown=event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="z"){event.preventDefault();restore(event.shiftKey?redoStack:undoStack,event.shiftKey?undoStack:redoStack)}else if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="y"){event.preventDefault();restore(redoStack,undoStack)}};
    };draw();
  };

  const CHAT_KEY="antigravity-gravity-chat-messages", chatContactsKey=()=>userKey("antigravity-gravity-chat-contacts");
  const chatMessages=()=>{try{return JSON.parse(localStorage.getItem(CHAT_KEY)||"[]")}catch{return[]}};
  const gravityUnread=()=>{const me=session();return chatMessages().filter(message=>message.to===me.email && !(message.readBy||[]).includes(me.email)).length;};
  appByKey("contacts").title="Gravity Chat"; appByKey("contacts").badge=gravityUnread;
  appByKey("contacts").render=container=>{let selected=null;const draw=()=>{const me=session(),directory=window.ANTIGRAVITY_APP_RUNTIME?.getDirectory?.()||[],saved=JSON.parse(localStorage.getItem(chatContactsKey())||"[]"),contacts=directory.filter(person=>saved.includes(person.email)&&person.email!==me.email);if(!selected)selected=contacts[0]?.email;let all=chatMessages();all.forEach(message=>{if(message.to===me.email&&message.from===selected&&!message.readBy?.includes(me.email))(message.readBy||(message.readBy=[])).push(me.email)});localStorage.setItem(CHAT_KEY,JSON.stringify(all));window.ANTIGRAVITY_APP_RUNTIME?.refreshTaskbar?.();const thread=all.filter(m=>[m.from,m.to].includes(me.email)&&[m.from,m.to].includes(selected));container.innerHTML=`<h2 class="app-title">Gravity Chat</h2><p class="app-description">Signed in as <strong>${esc(me.username)}</strong><br>${esc(me.companyName||"Local")}</p><div class="auth-code-row"><input class="app-input" data-add-email placeholder="Add people by email"><button class="app-button" data-add>Add</button></div><p class="app-description" data-message></p><div style="display:grid;grid-template-columns:minmax(150px,28%) 1fr;gap:12px;min-height:360px"><div class="settings-list">${contacts.map(p=>`<button class="settings-row" data-person="${esc(p.email)}" style="width:100%"><span><strong>${esc(p.username)}</strong><small style="display:block">${esc(p.companyName||"Local")}</small></span></button>`).join("")||'<p class="app-description" style="padding:12px">Add someone using their account email.</p>'}</div><div style="display:flex;flex-direction:column"><div style="flex:1;overflow:auto;padding:10px">${thread.map(m=>`<div style="margin:7px;padding:9px;border-radius:9px;background:${m.from===me.email?'var(--primary-soft)':'var(--panel-secondary)'}">${esc(m.text)}<small style="display:block;color:var(--muted)">${new Date(m.time).toLocaleString()}</small></div>`).join("")}</div><form data-chat class="auth-code-row"><input class="app-input" placeholder="Message" ${selected?'':'disabled'}><button class="app-button" ${selected?'':'disabled'}>Send</button></form></div></div>`;container.querySelectorAll("[data-person]").forEach(b=>b.onclick=()=>{selected=b.dataset.person;draw();});container.querySelector("[data-add]").onclick=()=>{const email=container.querySelector("[data-add-email]").value.trim().toLowerCase(),person=directory.find(p=>p.email===email),msg=container.querySelector("[data-message]");if(!person){msg.textContent="No AntigravityOS account uses that email.";return}localStorage.setItem(chatContactsKey(),JSON.stringify([...new Set([...saved,email])]));selected=email;draw();};container.querySelector("[data-chat]").onsubmit=e=>{e.preventDefault();const input=e.target.querySelector("input"),text=input.value.trim();if(!text)return;all.push({id:crypto.randomUUID?.()||String(Date.now()),from:me.email,to:selected,text,time:new Date().toISOString(),readBy:[me.email]});localStorage.setItem(CHAT_KEY,JSON.stringify(all));draw();};};draw();};

  appByKey("calendar").render=container=>{const key=userKey("antigravity-calendar-v2");let cursor=new Date(),items=JSON.parse(localStorage.getItem(key)||"[]");const save=()=>localStorage.setItem(key,JSON.stringify(items));const draw=()=>{const year=cursor.getFullYear(),month=cursor.getMonth(),first=new Date(year,month,1),days=new Date(year,month+1,0).getDate(),offset=first.getDay();container.innerHTML=`<h2 class="app-title">Calendar</h2><div class="button-row"><button class="app-button" data-prev>Previous</button><button class="app-button" data-today>Today</button><button class="app-button" data-next>Next</button><strong style="padding:10px">${cursor.toLocaleDateString(undefined,{month:"long",year:"numeric"})}</strong></div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:5px;margin-top:12px">${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>`<strong>${d}</strong>`).join("")}${Array(offset).fill("<span></span>").join("")}${Array.from({length:days},(_,i)=>{const date=`${year}-${String(month+1).padStart(2,"0")}-${String(i+1).padStart(2,"0")}`,count=items.filter(x=>x.date===date).length;return`<button class="file-item" data-date="${date}" style="min-height:72px;text-align:left"><strong>${i+1}</strong>${count?`<small style="display:block;color:var(--primary)">${count} item${count>1?'s':''}</small>`:""}</button>`}).join("")}</div><h3>Planner</h3><form data-event><div class="button-row"><input class="app-input" name="title" required placeholder="Event or task"><input class="app-input" name="date" type="date" required><input class="app-input" name="time" type="time"><select class="app-select" name="type"><option>Event</option><option>Task</option><option>Reminder</option></select><button class="app-button">Add</button></div></form><div>${items.sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).map(x=>`<div class="settings-row"><span><strong>${esc(x.title)}</strong><small style="display:block">${esc(x.type)} · ${esc(x.date)} ${esc(x.time||"")}</small></span><button class="app-button" data-delete="${x.id}">Delete</button></div>`).join("")||'<p class="app-description">No planned items.</p>'}</div>`;container.querySelector("[data-prev]").onclick=()=>{cursor=new Date(year,month-1,1);draw()};container.querySelector("[data-next]").onclick=()=>{cursor=new Date(year,month+1,1);draw()};container.querySelector("[data-today]").onclick=()=>{cursor=new Date();draw()};container.querySelectorAll("[data-date]").forEach(b=>b.onclick=()=>{container.querySelector('[name="date"]').value=b.dataset.date;container.querySelector('[name="title"]').focus()});container.querySelector("[data-event]").onsubmit=e=>{e.preventDefault();const form=new FormData(e.target);items.push({id:String(Date.now()),title:form.get("title"),date:form.get("date"),time:form.get("time"),type:form.get("type")});save();draw()};container.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>{items=items.filter(x=>x.id!==b.dataset.delete);save();draw()});};draw();};
  const gravityChatRender=appByKey("contacts").render;
  appByKey("contacts").render=container=>{gravityChatRender(container);const listId=`gravity-directory-${Math.random().toString(36).slice(2)}`;const applySuggestions=()=>{const input=container.querySelector("[data-add-email]");if(!input||input.getAttribute("list"))return;const list=document.createElement("datalist");list.id=listId;list.innerHTML=(window.ANTIGRAVITY_APP_RUNTIME?.getDirectory?.()||[]).filter(person=>person.email!==session().email).map(person=>`<option value="${esc(person.email)}">${esc(person.username)} · ${esc(person.companyName||"Local")}</option>`).join("");container.appendChild(list);input.setAttribute("list",listId);input.autocomplete="off";};applySuggestions();new MutationObserver(applySuggestions).observe(container,{childList:true,subtree:true});};
  const gravityChatAutocompleteRender=appByKey("contacts").render;
  appByKey("contacts").render=container=>{gravityChatAutocompleteRender(container);const enhanceLinks=()=>{const messageArea=container.querySelector("[data-chat]")?.previousElementSibling;if(!messageArea)return;const walker=document.createTreeWalker(messageArea,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())if(/https?:\/\/|www\./i.test(walker.currentNode.nodeValue))nodes.push(walker.currentNode);nodes.forEach(node=>{const fragment=document.createDocumentFragment(),parts=node.nodeValue.split(/(https?:\/\/[^\s]+|www\.[^\s]+)/gi);parts.forEach(part=>{if(/^(https?:\/\/|www\.)/i.test(part)){const anchor=document.createElement("a"),url=/^www\./i.test(part)?`https://${part}`:part;anchor.href=url;anchor.textContent=part;anchor.style.color="var(--primary)";anchor.style.textDecoration="underline";anchor.onclick=event=>{event.preventDefault();window.ANTIGRAVITY_APP_RUNTIME?.openUrl?.(url,event.ctrlKey||event.metaKey)};fragment.appendChild(anchor)}else fragment.appendChild(document.createTextNode(part))});node.replaceWith(fragment)});};enhanceLinks();new MutationObserver(enhanceLinks).observe(container,{childList:true,subtree:true});};
})();
