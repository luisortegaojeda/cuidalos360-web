/* Chat de Mary en cuidalos360.com. Habla con la API del asistente y puede mover la página. */
(() => {
  const API = "https://cuidalos360-bot.netlify.app/api/chat";
  const CLAVE = "mary-chat-v1";
  const SALUDO = "¡Hola! Soy Mary, de CUIDALOS360 😊 Te ayudo a elegir plan, te explico cómo funciona o te echo una mano con la app. ¿En qué te ayudo?";
  const SUGERENCIAS = ["¿Cuánto cuesta?", "¿Cómo funciona?", "Mis padres viven en otro país", "Soy profesional de la salud"];
  const PAGINAS = { pagina_profesionales: "/profesionales.html" };

  const leer = () => { try { return JSON.parse(sessionStorage.getItem(CLAVE)) || {}; } catch { return {}; } };
  const guardar = (e) => { try { sessionStorage.setItem(CLAVE, JSON.stringify(e)); } catch {} };
  let estado = Object.assign({ abierto: false, mensajes: [] }, leer());

  const css = `
  .mc-btn{position:fixed;right:18px;bottom:18px;z-index:60;display:flex;align-items:center;gap:10px;padding:10px 18px 10px 10px;border:0;border-radius:999px;background:#f5b800;color:#1d1400;font:600 16px/1 var(--font,-apple-system,system-ui,sans-serif);box-shadow:0 10px 30px -8px rgba(0,0,0,.45);cursor:pointer;transition:transform .2s}
  .mc-btn:hover{transform:translateY(-2px)}
  .mc-av{width:36px;height:36px;border-radius:50%;background:#0b2f57;color:#fff;display:grid;place-items:center;font-weight:700;font-size:17px;flex:none}
  .mc-panel{position:fixed;right:18px;bottom:18px;z-index:61;width:380px;max-width:calc(100vw - 32px);height:560px;max-height:calc(100vh - 90px);display:none;flex-direction:column;background:#fff;color:#1d1d1f;border-radius:22px;box-shadow:0 24px 70px -12px rgba(0,0,0,.5);overflow:hidden;font-family:var(--font,-apple-system,system-ui,sans-serif)}
  .mc-panel.on{display:flex}
  .mc-head{display:flex;align-items:center;gap:12px;padding:14px 16px;background:#0b2f57;color:#fff}
  .mc-head b{display:block;font-size:17px}.mc-head small{opacity:.75;font-size:13px}
  .mc-x{margin-left:auto;background:rgba(255,255,255,.15);border:0;color:#fff;width:34px;height:34px;border-radius:50%;font-size:20px;cursor:pointer}
  .mc-log{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#f5f5f7}
  .mc-m{max-width:85%;padding:10px 14px;border-radius:18px;font-size:15px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word}
  .mc-m.u{align-self:flex-end;background:#0b2f57;color:#fff;border-bottom-right-radius:6px}
  .mc-m.a{align-self:flex-start;background:#fff;border-bottom-left-radius:6px;box-shadow:0 1px 2px rgba(0,0,0,.08)}
  .mc-dots{display:inline-flex;gap:4px}.mc-dots i{width:7px;height:7px;border-radius:50%;background:#6e6e73;animation:mcb 1s infinite}.mc-dots i:nth-child(2){animation-delay:.15s}.mc-dots i:nth-child(3){animation-delay:.3s}
  @keyframes mcb{0%,80%,100%{opacity:.25}40%{opacity:1}}
  .mc-sug{display:flex;flex-wrap:wrap;gap:8px;padding:0 16px 10px;background:#f5f5f7}
  .mc-sug button{border:1px solid #d2d2d7;background:#fff;border-radius:999px;padding:7px 12px;font-size:14px;cursor:pointer;color:#1d1d1f}
  .mc-form{display:flex;gap:8px;padding:10px;border-top:1px solid #d2d2d7;background:#fff}
  .mc-form textarea{flex:1;resize:none;border:1px solid #d2d2d7;border-radius:16px;padding:10px 12px;font:16px/1.3 inherit;max-height:110px;outline:none}
  .mc-form textarea:focus{border-color:#2aa3ef}
  .mc-form button{border:0;border-radius:50%;width:44px;height:44px;background:#f5b800;color:#1d1400;font-size:20px;cursor:pointer;flex:none}
  .mc-form button:disabled{opacity:.5;cursor:default}
  .mc-legal{font-size:11.5px;color:#6e6e73;text-align:center;padding:0 12px 8px;background:#fff}
  .mc-legal a{color:inherit}
  .mc-toast{position:fixed;left:50%;bottom:86px;transform:translateX(-50%);z-index:62;background:#1d1d1f;color:#fff;padding:10px 16px;border-radius:999px;font:500 14px/1.2 var(--font,system-ui);white-space:nowrap;display:none;align-items:center;gap:10px;box-shadow:0 10px 30px -10px rgba(0,0,0,.5)}
  .mc-toast button{background:#f5b800;color:#1d1400;border:0;border-radius:999px;padding:6px 12px;font-weight:600;cursor:pointer}
  @media (max-width:600px){
    .mc-btn{right:12px;bottom:12px;padding:8px 14px 8px 8px;font-size:15px}
    .mc-panel{right:0;left:0;bottom:0;width:100%;max-width:100%;height:78vh;max-height:78vh;border-radius:22px 22px 0 0}
  }`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (t) => t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const formato = (t) => esc(t).replace(/\*([^*\n]+)\*/g, "<strong>$1</strong>");

  const btn = el("button", "mc-btn", '<span class="mc-av">M</span>Habla con Mary');
  btn.setAttribute("aria-label", "Abrir el chat con Mary");
  const panel = el("div", "mc-panel");
  panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Chat con Mary");
  panel.innerHTML = `
    <div class="mc-head"><span class="mc-av" style="background:#f5b800;color:#1d1400">M</span><div><b>Mary</b><small>Asesora de CUIDALOS360 · responde al momento</small></div><button class="mc-x" aria-label="Cerrar">×</button></div>
    <div class="mc-log" aria-live="polite"></div>
    <div class="mc-sug"></div>
    <form class="mc-form"><textarea rows="1" placeholder="Escribe tu pregunta…" aria-label="Tu mensaje" maxlength="1000"></textarea><button type="submit" aria-label="Enviar">➤</button></form>
    <div class="mc-legal">Mary es una asistente con inteligencia artificial y no da consejo médico. <a href="/privacidad.html">Privacidad</a></div>`;
  const toast = el("div", "mc-toast", '<span>Te lo muestro aquí 👇</span><button type="button">Volver al chat</button>');
  document.body.append(btn, panel, toast);

  const log = panel.querySelector(".mc-log");
  const sug = panel.querySelector(".mc-sug");
  const form = panel.querySelector("form");
  const ta = form.querySelector("textarea");
  const enviar = form.querySelector("button");

  function pintar() {
    log.innerHTML = "";
    log.appendChild(el("div", "mc-m a", formato(SALUDO)));
    for (const m of estado.mensajes) log.appendChild(el("div", "mc-m " + (m.role === "user" ? "u" : "a"), formato(m.content)));
    sug.innerHTML = "";
    if (!estado.mensajes.length) for (const s of SUGERENCIAS) { const b = el("button", "", esc(s)); b.type = "button"; b.onclick = () => mandar(s); sug.appendChild(b); }
    log.scrollTop = log.scrollHeight;
  }

  function abrir(on) {
    estado.abierto = on; guardar(estado);
    panel.classList.toggle("on", on);
    btn.style.display = on ? "none" : "";
    toast.style.display = "none";
    if (on) { pintar(); setTimeout(() => ta.focus(), 50); }
  }

  function irA(seccion) {
    if (PAGINAS[seccion]) { if (location.pathname !== PAGINAS[seccion]) { location.href = PAGINAS[seccion]; } return; }
    const destino = document.getElementById(seccion);
    if (!destino) { location.href = "/#" + seccion; return; }
    const movil = matchMedia("(max-width:600px)").matches;
    if (movil) { panel.classList.remove("on"); toast.style.display = "flex"; btn.style.display = "none"; }
    destino.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function mandar(texto) {
    texto = texto.trim();
    if (!texto || enviar.disabled) return;
    estado.mensajes.push({ role: "user", content: texto.slice(0, 1000) });
    guardar(estado); pintar();
    ta.value = ""; enviar.disabled = true;
    const esc_ = el("div", "mc-m a", '<span class="mc-dots"><i></i><i></i><i></i></span>');
    log.appendChild(esc_); log.scrollTop = log.scrollHeight;
    let r;
    try {
      const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mensajes: estado.mensajes.slice(-20) }) });
      r = await res.json();
    } catch { r = { respuesta: "No he podido conectarme. Revisa tu conexión o escríbeme por WhatsApp al +58 424 176 8331. 🙏" }; }
    let txt = r.respuesta || "Perdona, ¿me lo repites?";
    // El saludo ya la presenta: quita una segunda presentación al principio.
    txt = txt.replace(/^\s*¡?Hola[!,.]?\s*(¡|,)?\s*soy Mary,? de CUIDALOS360[.!]?\s*(😊)?\.?\s*/i, "").trim() || txt;
    estado.mensajes.push({ role: "assistant", content: txt });
    guardar(estado); enviar.disabled = false; pintar();
    const ir = (r.acciones || []).find((a) => a.tipo === "ir");
    if (ir) setTimeout(() => irA(ir.seccion), 600);
  }

  btn.onclick = () => abrir(true);
  panel.querySelector(".mc-x").onclick = () => abrir(false);
  toast.querySelector("button").onclick = () => abrir(true);
  form.onsubmit = (e) => { e.preventDefault(); mandar(ta.value); };
  ta.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); mandar(ta.value); } });
  ta.addEventListener("input", () => { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 110) + "px"; });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && estado.abierto) abrir(false); });

  if (estado.abierto) abrir(true);
})();
