(function () {
  "use strict";

  const ROOT = "root";
  const now = () => new Date().toISOString();
  const uid = () => crypto.randomUUID?.() || `file-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const folderIcon = '<svg aria-hidden="true" viewBox="0 0 64 52" style="display:block;width:1em;height:1em;color:var(--primary)" fill="none"><path d="M3 13a7 7 0 0 1 7-7h15l7 8h22a7 7 0 0 1 7 7v22a7 7 0 0 1-7 7H10a7 7 0 0 1-7-7V13Z" fill="currentColor" opacity=".72"/><path d="M3 23a7 7 0 0 1 7-7h44a7 7 0 0 1 7 7v20a7 7 0 0 1-7 7H10a7 7 0 0 1-7-7V23Z" fill="currentColor"/><path d="M10 16h44a7 7 0 0 1 6.7 5H3.3a7 7 0 0 1 6.7-5Z" fill="white" opacity=".16"/></svg>';
  const icon = item => item.type === "folder" ? folderIcon : item.mime?.startsWith("image/") ? "▧" : item.mime?.startsWith("video/") ? "▶" : item.mime?.startsWith("audio/") ? "♫" : item.mime === "application/pdf" ? "PDF" : item.name.endsWith(".js") || item.name.endsWith(".html") || item.name.endsWith(".css") ? "</>" : "▤";
  const seed = () => [
    {id:"folder-desktop",parent:ROOT,name:"Desktop",type:"folder",created:now(),modified:now()},
    {id:"folder-documents",parent:ROOT,name:"Documents",type:"folder",created:now(),modified:now()},
    {id:"folder-downloads",parent:ROOT,name:"Downloads",type:"folder",created:now(),modified:now()},
    {id:"folder-pictures",parent:ROOT,name:"Pictures",type:"folder",created:now(),modified:now()},
    {id:"folder-music",parent:ROOT,name:"Music",type:"folder",created:now(),modified:now()},
    {id:"folder-videos",parent:ROOT,name:"Videos",type:"folder",created:now(),modified:now()},
    {id:"welcome-file",parent:"folder-documents",name:"Welcome.txt",type:"file",mime:"text/plain",data:"Welcome to AntigravityOS Files.\n\nCreate folders and files, import items from your computer, drag items between folders, preview supported files, rename, delete, sort, search, and export.",size:230,created:now(),modified:now()}
  ];

  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function dataUrlText(value) {
    const source = String(value || ""), comma = source.indexOf(",");
    if (comma < 0) return source;
    try {
      const meta = source.slice(0, comma), body = source.slice(comma + 1);
      return /;base64/i.test(meta) ? decodeURIComponent([...atob(body)].map(character => `%${character.charCodeAt(0).toString(16).padStart(2,"0")}`).join("")) : decodeURIComponent(body);
    } catch { return ""; }
  }

  function render(container, options = {}) {
    const key = options.storageKey || "antigravity-files:local:user";
    const notify = options.notify || (() => {});
    let items;
    try { items = JSON.parse(localStorage.getItem(key) || "null") || seed(); } catch { items = seed(); }
    let current = ROOT, selected = new Set(), history = [ROOT], historyIndex = 0, view = localStorage.getItem(`${key}:view`) || "grid", sort = "name", descending = false, query = "";

    const save = () => localStorage.setItem(key, JSON.stringify(items));
    if (!localStorage.getItem(key)) save();
    const byId = id => items.find(item => item.id === id);
    const children = id => items.filter(item => item.parent === id);
    const uniqueName = (name, parent, ignoreId = null) => {
      const clean = String(name || "Untitled").replace(/[\\/:*?"<>|]/g, "-").trim() || "Untitled";
      const dot = clean.lastIndexOf("."), stem = dot > 0 ? clean.slice(0, dot) : clean, extension = dot > 0 ? clean.slice(dot) : "";
      let candidate = clean, count = 2;
      while (items.some(item => item.parent === parent && item.id !== ignoreId && item.name.toLowerCase() === candidate.toLowerCase())) candidate = `${stem} ${count++}${extension}`;
      return candidate;
    };
    const descendants = id => { const result=[]; const visit=parent=>children(parent).forEach(child=>{result.push(child.id);if(child.type==="folder")visit(child.id)});visit(id);return result; };
    const path = id => { const result=[]; let cursor=id; while(cursor!==ROOT){const item=byId(cursor);if(!item)break;result.unshift(item);cursor=item.parent}return result; };
    const formatSize = size => size == null ? "—" : size < 1024 ? `${size} B` : size < 1048576 ? `${(size/1024).toFixed(1)} KB` : `${(size/1048576).toFixed(1)} MB`;
    const displayItems = () => {
      let list = query ? items.filter(item => item.name.toLowerCase().includes(query.toLowerCase())) : children(current);
      return list.sort((a,b) => { if(a.type!==b.type)return a.type==="folder"?-1:1; let result=sort==="date"?new Date(a.modified)-new Date(b.modified):sort==="size"?(a.size||0)-(b.size||0):a.name.localeCompare(b.name,undefined,{numeric:true,sensitivity:"base"}); return descending?-result:result; });
    };
    const navigate = (id, push = true) => { if(id!==ROOT && byId(id)?.type!=="folder")return;current=id;selected.clear();query="";if(push){history=history.slice(0,historyIndex+1);history.push(id);historyIndex=history.length-1}draw(); };
    const download = item => { const anchor=document.createElement("a");anchor.download=item.name;anchor.href=item.data || URL.createObjectURL(new Blob([item.content||""],{type:item.mime||"text/plain"}));anchor.click();if(!item.data)URL.revokeObjectURL(anchor.href); };
    const removeSelected = () => { if(!selected.size)return;const names=[...selected].map(id=>byId(id)?.name).filter(Boolean);if(!confirm(`Move ${names.length===1?names[0]:`${names.length} items`} to Trash?`))return;const remove=new Set([...selected]);[...selected].forEach(id=>descendants(id).forEach(child=>remove.add(child)));items=items.filter(item=>!remove.has(item.id));selected.clear();save();notify("Moved to Trash.");draw(); };
    const renameSelected = () => { if(selected.size!==1)return notify("Select one item to rename.");const item=byId([...selected][0]);const value=prompt("Rename item:",item.name);if(value==null)return;item.name=uniqueName(value,item.parent,item.id);item.modified=now();save();draw(); };
    const openItem = item => { if(item.type==="folder")return navigate(item.id);showPreview(item); };

    const showPreview = item => {
      let body;
      if(item.mime?.startsWith("image/"))body=`<img src="${esc(item.data)}" alt="${esc(item.name)}" style="max-width:100%;max-height:52vh;object-fit:contain">`;
      else if(item.mime?.startsWith("video/"))body=`<video src="${esc(item.data)}" controls style="width:100%;max-height:52vh"></video>`;
      else if(item.mime?.startsWith("audio/"))body=`<audio src="${esc(item.data)}" controls style="width:100%"></audio>`;
      else if(item.mime==="application/pdf")body=`<iframe src="${esc(item.data)}" title="${esc(item.name)}" style="width:100%;height:52vh;border:0;background:white"></iframe>`;
      else if(item.mime?.startsWith("text/") || /\.(js|json|css|html|md|csv)$/i.test(item.name)){const text=dataUrlText(item.data)||item.content||"";body=`<textarea class="app-textarea" data-preview-editor style="min-height:45vh">${esc(text)}</textarea>`;}
      else body=`<div class="file-item" style="text-align:center;padding:40px"><span class="file-item-icon" style="font-size:48px">${icon(item)}</span><p>No built-in preview for this file type.</p></div>`;
      const overlay=document.createElement("div");overlay.style.cssText="position:absolute;inset:0;z-index:30;background:rgba(0,0,0,.62);display:grid;place-items:center;padding:18px";overlay.innerHTML=`<section style="width:min(760px,100%);max-height:90%;overflow:auto;background:var(--panel);border:1px solid var(--border);border-radius:14px;box-shadow:var(--shadow)"><header style="display:flex;align-items:center;padding:12px 15px;border-bottom:1px solid var(--border)"><strong style="flex:1">${esc(item.name)}</strong><button class="app-button" data-preview-close>Close</button></header><div style="padding:16px">${body}<p class="app-description">${esc(item.mime||"File")} · ${formatSize(item.size)} · Modified ${new Date(item.modified).toLocaleString()}</p><div class="button-row"><button class="app-button" data-preview-download>Download</button>${body.includes("data-preview-editor")?'<button class="app-button" data-preview-save>Save changes</button>':""}</div></div></section>`;container.appendChild(overlay);overlay.querySelector("[data-preview-close]").onclick=()=>overlay.remove();overlay.querySelector("[data-preview-download]").onclick=()=>download(item);overlay.querySelector("[data-preview-save]")?.addEventListener("click",()=>{const text=overlay.querySelector("[data-preview-editor]").value;item.data=`data:text/plain;charset=utf-8,${encodeURIComponent(text)}`;item.mime="text/plain";item.size=new Blob([text]).size;item.modified=now();save();notify("File saved.");draw()});
    };

    const importFiles = async fileList => {
      for (const file of fileList) { const relative=(file.webkitRelativePath||"").split("/").filter(Boolean);let parent=current;if(relative.length>1){for(const folderName of relative.slice(0,-1)){let folder=items.find(item=>item.parent===parent&&item.type==="folder"&&item.name===folderName);if(!folder){folder={id:uid(),parent,name:uniqueName(folderName,parent),type:"folder",created:now(),modified:now()};items.push(folder)}parent=folder.id;}}items.push({id:uid(),parent,name:uniqueName(file.name,parent),type:"file",mime:file.type||"application/octet-stream",data:await readFile(file),size:file.size,created:now(),modified:now()}); }
      save();notify(`${fileList.length} item${fileList.length===1?"":"s"} imported.`);draw();
    };

    function draw() {
      const list=displayItems(), crumbs=path(current);
      container.innerHTML=`<style>
        .ag-files{height:100%;min-height:420px;display:grid;grid-template-columns:190px minmax(0,1fr);grid-template-rows:auto 1fr;background:var(--panel-secondary);border:1px solid var(--border);border-radius:12px;overflow:hidden}.ag-files-toolbar{grid-column:1/-1;display:flex;align-items:center;gap:7px;padding:9px;border-bottom:1px solid var(--border);background:var(--panel)}.ag-files-sidebar{padding:12px 8px;border-right:1px solid var(--border);overflow:auto}.ag-files-main{min-width:0;display:flex;flex-direction:column;overflow:hidden}.ag-files-path{display:flex;align-items:center;gap:3px;padding:8px 12px;border-bottom:1px solid var(--border);overflow:auto;white-space:nowrap}.ag-files-content{flex:1;overflow:auto;padding:12px}.ag-files-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(105px,1fr));gap:10px}.ag-files-item{border:1px solid transparent;border-radius:10px;padding:12px 8px;background:transparent;color:var(--text);text-align:center;cursor:default;min-width:0}.ag-files-item:hover{background:var(--primary-soft)}.ag-files-item.selected{border-color:var(--primary);background:var(--primary-soft)}.ag-files-item-icon{display:grid;place-items:center;height:54px;font-size:42px;color:var(--text)}.ag-files-name{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:6px}.ag-files-list{width:100%;border-collapse:collapse}.ag-files-list tr{cursor:default}.ag-files-list tr:hover,.ag-files-list tr.selected{background:var(--primary-soft)}.ag-files-list td{padding:9px;border-bottom:1px solid var(--border)}.ag-files-side-button{width:100%;border:0;border-radius:7px;padding:8px 10px;background:transparent;color:var(--text);text-align:left;cursor:pointer}.ag-files-side-button:hover,.ag-files-side-button.active{background:var(--primary-soft);color:var(--primary)}.ag-files-status{display:flex;justify-content:space-between;padding:7px 12px;border-top:1px solid var(--border);color:var(--muted);font-size:11px}@media(max-width:680px){.ag-files{grid-template-columns:1fr}.ag-files-sidebar{display:none}.ag-files-toolbar{overflow-x:auto}.ag-files-grid{grid-template-columns:repeat(auto-fill,minmax(90px,1fr))}}
      </style><div class="ag-files"><div class="ag-files-toolbar"><button class="app-button" data-back title="Back" ${historyIndex<=0?"disabled":""}>‹</button><button class="app-button" data-forward title="Forward" ${historyIndex>=history.length-1?"disabled":""}>›</button><button class="app-button" data-up title="Up" ${current===ROOT?"disabled":""}>↑</button><button class="app-button" data-new-folder>New Folder</button><button class="app-button" data-new-file>New File</button><label class="app-button" style="cursor:pointer">Import<input data-import type="file" multiple hidden></label><label class="app-button" style="cursor:pointer">Import Folder<input data-import-folder type="file" webkitdirectory multiple hidden></label><input class="app-input" data-search placeholder="Search files" value="${esc(query)}" style="min-width:130px;flex:1"><select class="app-select" data-sort style="width:auto"><option value="name">Name</option><option value="date">Date modified</option><option value="size">Size</option></select><button class="app-button" data-direction title="Reverse sort">${descending?"↓":"↑"}</button><button class="app-button" data-view title="Change view">${view==="grid"?"☷":"▦"}</button><button class="app-button" data-more title="Actions">•••</button></div><aside class="ag-files-sidebar"><p class="sidebar-heading">Favorites</p>${[[ROOT,"Home","⌂"],["folder-desktop","Desktop","▱"],["folder-documents","Documents","▤"],["folder-downloads","Downloads","↓"],["folder-pictures","Pictures","▧"],["folder-music","Music","♫"],["folder-videos","Videos","▶"]].map(([id,name,glyph])=>`<button class="ag-files-side-button ${current===id?"active":""}" data-place="${id}">${glyph} &nbsp;${name}</button>`).join("")}<p class="sidebar-heading" style="margin-top:18px">Locations</p><button class="ag-files-side-button" data-place="${ROOT}">◉ &nbsp;Antigravity Drive</button></aside><main class="ag-files-main"><nav class="ag-files-path"><button class="ag-files-side-button" style="width:auto" data-crumb="${ROOT}">Antigravity Drive</button>${crumbs.map(item=>`<span>›</span><button class="ag-files-side-button" style="width:auto" data-crumb="${item.id}">${esc(item.name)}</button>`).join("")}</nav><div class="ag-files-content" data-drop-zone>${list.length?(view==="grid"?`<div class="ag-files-grid">${list.map(item=>`<button class="ag-files-item ${selected.has(item.id)?"selected":""}" draggable="true" data-item="${item.id}" title="${esc(item.name)}"><span class="ag-files-item-icon">${icon(item)}</span><span class="ag-files-name">${esc(item.name)}</span></button>`).join("")}</div>`:`<table class="ag-files-list"><thead><tr><td>Name</td><td>Modified</td><td>Size</td></tr></thead><tbody>${list.map(item=>`<tr class="${selected.has(item.id)?"selected":""}" draggable="true" data-item="${item.id}"><td><span style="font-size:20px">${icon(item)}</span> ${esc(item.name)}</td><td>${new Date(item.modified).toLocaleDateString()}</td><td>${item.type==="folder"?"—":formatSize(item.size)}</td></tr>`).join("")}</tbody></table>`):`<div style="height:100%;display:grid;place-items:center;text-align:center;color:var(--muted)"><div><div style="font-size:52px">${query?"⌕":"□"}</div><p>${query?"No matching files":"This folder is empty"}</p></div></div>`}</div><footer class="ag-files-status"><span>${list.length} item${list.length===1?"":"s"}${selected.size?` · ${selected.size} selected`:""}</span><span>${options.sudo?"Root filesystem":"Persistent local storage"}</span></footer></main></div>`;
      container.querySelector("[data-sort]").value=sort;
      const refreshSelection=()=>{container.querySelectorAll("[data-item]").forEach(element=>element.classList.toggle("selected",selected.has(element.dataset.item)));const status=container.querySelector(".ag-files-status span");if(status)status.textContent=`${list.length} item${list.length===1?"":"s"}${selected.size?` · ${selected.size} selected`:""}`};
      container.querySelectorAll("[data-place],[data-crumb]").forEach(button=>button.onclick=()=>navigate(button.dataset.place||button.dataset.crumb));
      container.querySelector("[data-back]").onclick=()=>{if(historyIndex>0){historyIndex--;current=history[historyIndex];selected.clear();draw()}};container.querySelector("[data-forward]").onclick=()=>{if(historyIndex<history.length-1){historyIndex++;current=history[historyIndex];selected.clear();draw()}};container.querySelector("[data-up]").onclick=()=>navigate(current===ROOT?ROOT:(byId(current)?.parent||ROOT));
      container.querySelector("[data-new-folder]").onclick=()=>{const value=prompt("Folder name:","New Folder");if(value==null)return;items.push({id:uid(),parent:current,name:uniqueName(value,current),type:"folder",created:now(),modified:now()});save();draw()};
      container.querySelector("[data-new-file]").onclick=()=>{const value=prompt("File name:","Untitled.txt");if(value==null)return;const name=uniqueName(value,current),text="";items.push({id:uid(),parent:current,name,type:"file",mime:"text/plain",data:`data:text/plain;charset=utf-8,${encodeURIComponent(text)}`,size:0,created:now(),modified:now()});save();draw()};
      container.querySelector("[data-import]").onchange=e=>importFiles(e.target.files);container.querySelector("[data-import-folder]").onchange=e=>importFiles(e.target.files);
      container.querySelector("[data-search]").oninput=e=>{query=e.target.value;draw()};container.querySelector("[data-sort]").onchange=e=>{sort=e.target.value;draw()};container.querySelector("[data-direction]").onclick=()=>{descending=!descending;draw()};container.querySelector("[data-view]").onclick=()=>{view=view==="grid"?"list":"grid";localStorage.setItem(`${key}:view`,view);draw()};
      container.querySelector("[data-more]").onclick=()=>{if(!selected.size)return notify("Select a file or folder first.");const action=prompt("Action: rename, delete, download, or info","rename")?.trim().toLowerCase();if(action==="rename")renameSelected();else if(action==="delete")removeSelected();else if(action==="download")selected.forEach(id=>{const item=byId(id);if(item?.type==="file")download(item)});else if(action==="info"){const chosen=[...selected].map(id=>byId(id));alert(chosen.map(item=>`${item.name}\n${item.type}${item.type==="file"?` · ${item.mime||"Unknown"} · ${formatSize(item.size)}`:""}\nModified ${new Date(item.modified).toLocaleString()}`).join("\n\n"))}};
      container.querySelectorAll("[data-item]").forEach(element=>{const item=byId(element.dataset.item);element.onclick=event=>{if(!event.ctrlKey&&!event.metaKey&&!event.shiftKey)selected.clear();if(event.shiftKey&&selected.size){const visible=displayItems().map(x=>x.id),anchor=visible.indexOf([...selected][0]),target=visible.indexOf(item.id);visible.slice(Math.min(anchor,target),Math.max(anchor,target)+1).forEach(id=>selected.add(id))}else if((event.ctrlKey||event.metaKey)&&selected.has(item.id))selected.delete(item.id);else selected.add(item.id);refreshSelection()};element.ondblclick=event=>{event.preventDefault();openItem(item)};element.ondragstart=event=>{event.dataTransfer.setData("application/x-antigravity-file",item.id);event.dataTransfer.effectAllowed="move"};if(item.type==="folder"){element.ondragover=event=>{event.preventDefault();event.stopPropagation();element.style.outline="2px solid var(--primary)"};element.ondragleave=()=>element.style.outline="";element.ondrop=event=>{event.preventDefault();event.stopPropagation();element.style.outline="";const id=event.dataTransfer.getData("application/x-antigravity-file"),moving=byId(id);if(moving&&moving.id!==item.id&&!descendants(moving.id).includes(item.id)){moving.parent=item.id;moving.name=uniqueName(moving.name,item.id,moving.id);moving.modified=now();save();draw()}}}});
      const zone=container.querySelector("[data-drop-zone]");zone.ondragover=event=>{event.preventDefault();zone.style.boxShadow="inset 0 0 0 2px var(--primary)"};zone.ondragleave=()=>zone.style.boxShadow="";zone.ondrop=event=>{event.preventDefault();zone.style.boxShadow="";if(event.dataTransfer.files.length)return importFiles(event.dataTransfer.files);const id=event.dataTransfer.getData("application/x-antigravity-file"),moving=byId(id);if(moving){moving.parent=current;moving.name=uniqueName(moving.name,current,moving.id);moving.modified=now();save();draw()}};
      container.tabIndex=0;container.onkeydown=event=>{if(event.key==="Delete"){event.preventDefault();removeSelected()}else if(event.key==="F2"){event.preventDefault();renameSelected()}else if(event.key==="Enter"&&selected.size===1){event.preventDefault();openItem(byId([...selected][0]))}else if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="a"){event.preventDefault();selected=new Set(displayItems().map(item=>item.id));draw()}};
    }
    draw();
  }

  window.ANTIGRAVITY_FILES_APP = { render };
})();
