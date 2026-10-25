(() => {
  if (window.__edutrackStudyCoachLoaded) return;
  window.__edutrackStudyCoachLoaded = true;
  const css = `
  #et-study-launch{position:fixed;right:20px;bottom:20px;z-index:99998;border:0;border-radius:999px;padding:13px 18px;background:linear-gradient(135deg,#2563eb,#6d5ae6);color:white;font:600 14px system-ui;box-shadow:0 8px 28px #17255435;cursor:pointer}
  #et-study-panel{position:fixed;z-index:99999;right:16px;bottom:78px;width:min(420px,calc(100vw - 24px));max-height:min(78dvh,760px);display:none;flex-direction:column;background:#fff;color:#172033;border:1px solid #dbe4f0;border-radius:20px;box-shadow:0 18px 60px #0f172a38;font:14px/1.5 system-ui;overflow:hidden}
  #et-study-panel *{box-sizing:border-box} #et-study-panel .et-head{padding:14px 16px;background:linear-gradient(120deg,#eff6ff,#f5f3ff);display:flex;align-items:center;justify-content:space-between;gap:8px}
  #et-study-panel .et-head strong{font-size:16px} #et-study-panel .et-body{padding:14px;overflow:auto;display:flex;flex-direction:column;gap:10px}
  #et-study-panel input,#et-study-panel select,#et-study-panel textarea{width:100%;border:1px solid #cbd5e1;border-radius:10px;padding:10px;font:inherit;background:#fff;color:#172033}
  #et-study-panel textarea{min-height:82px;resize:vertical} #et-study-panel .et-row{display:flex;gap:8px} #et-study-panel .et-row>*{flex:1;min-width:0}
  #et-study-panel button{border:0;border-radius:10px;padding:10px 12px;font:600 13px system-ui;cursor:pointer}
  #et-study-panel .et-primary{background:#2563eb;color:#fff} #et-study-panel .et-secondary{background:#eef2ff;color:#3730a3} #et-study-panel .et-voice{background:#dcfce7;color:#166534;border:1px solid #86efac} #et-study-panel button:disabled{opacity:.6;cursor:wait} #et-study-panel .et-voice-status{font-size:12px;color:#166534;min-height:16px}
  #et-study-panel .et-answer{white-space:pre-wrap;overflow-wrap:anywhere;background:#f8fafc;border:1px solid #e2e8f0;padding:12px;border-radius:12px;min-height:44px}
  #et-study-panel .et-small{font-size:12px;color:#64748b} #et-study-panel label{font-weight:600;font-size:12px;color:#475569}
  `;
  const style=document.createElement('style'); style.textContent=css; document.head.appendChild(style);
  const launch=document.createElement('button'); launch.id='et-study-launch'; launch.type='button'; launch.textContent='Mon coach EduTrack';
  const panel=document.createElement('section'); panel.id='et-study-panel'; panel.setAttribute('aria-label','Coach de révision EduTrack');
  panel.innerHTML=`
    <div class="et-head"><div><strong>Coach de révision</strong><div class="et-small">Comprendre · s'entraîner · progresser</div></div><button id="et-close" class="et-secondary">Fermer</button></div>
    <div class="et-body">
      <div class="et-row"><div><label for="et-grade">Classe / niveau</label><input id="et-grade" placeholder="Ex. 3e, 1re F2, Terminale"></div><div><label for="et-subject">Matière</label><input id="et-subject" placeholder="Ex. électronique"></div></div>
      <label for="et-course">Ton cours (importe un fichier texte ou colle le texte)</label><input id="et-file" type="file" accept=".txt,.md,.csv,.html,.text">
      <textarea id="et-course" placeholder="Colle ici le cours étudié à l'école. EduTrack s'appuiera dessus pour l'expliquer et préparer des exercices."></textarea>
      <div class="et-row"><div><label for="et-task">Objectif</label><select id="et-task"><option value="explain">M'expliquer le cours</option><option value="exercise">Me donner des exercices</option><option value="correct">Corriger ma réponse</option><option value="ask">Poser une question</option></select></div><div><label for="et-level">Difficulté</label><select id="et-level"><option value="debutant">Débutant</option><option value="normal" selected>Normal</option><option value="avance">Avancé</option></select></div></div>
      <label for="et-question">Ta question ou ta réponse</label><textarea id="et-question" placeholder="Ex. Explique-moi cette formule avec un exemple…"></textarea>
      <div class="et-row"><button id="et-send" class="et-primary">Demander à EduTrack</button><button id="et-speak" class="et-secondary">Lire la réponse</button></div>
      <div id="et-answer" class="et-answer" aria-live="polite">Ton explication ou tes exercices apparaîtront ici.</div>
      <div class="et-row"><button id="et-listen" class="et-voice">Parler à EduTrack</button><button id="et-stop" class="et-secondary">Arrêter la voix</button></div><div id="et-voice-status" class="et-voice-status" aria-live="polite">Appuie sur « Parler à EduTrack », puis pose ta question à voix haute.</div>
      <hr style="width:100%;border:0;border-top:1px solid #e2e8f0">
      <strong>Rappel vocal de révision</strong>
      <div class="et-row"><div><label for="et-time">Heure de révision</label><input id="et-time" type="time" value="18:00"></div><div><label for="et-days">Répétition</label><select id="et-days"><option value="daily">Tous les jours</option><option value="weekdays">Lun–Ven</option></select></div></div>
      <div class="et-row"><button id="et-reminder" class="et-primary">Activer le rappel</button><button id="et-clear" class="et-secondary">Désactiver</button></div>
      <div id="et-reminder-status" class="et-small">Le rappel vocal fonctionne lorsque le site est ouvert. Autorise les notifications pour recevoir aussi une alerte du navigateur.</div>
    </div>`;
  document.body.append(launch,panel);
  const $=id=>document.getElementById(id);
  const setAnswer=t=>{$('et-answer').textContent=t;};
  const speakText=text=>{if(!('speechSynthesis' in window)){ $('et-voice-status').textContent='La lecture audio n’est pas prise en charge par ce navigateur.'; return; } window.speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(String(text||'')); u.lang='fr-FR'; u.rate=0.96; u.pitch=1; u.onstart=()=>{$('et-voice-status').textContent='EduTrack répond à voix haute…';}; u.onend=()=>{$('et-voice-status').textContent='Réponse terminée. Tu peux poser une autre question.';}; u.onerror=()=>{$('et-voice-status').textContent='Lecture audio interrompue. Tu peux appuyer sur « Lire la réponse ». ';}; window.speechSynthesis.speak(u);};
  launch.addEventListener('click',()=>{panel.style.display='flex';});
  $('et-close').addEventListener('click',()=>{panel.style.display='none';});
  $('et-file').addEventListener('change',async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;try{$('et-course').value=await f.text();}catch(_){setAnswer("Impossible de lire ce fichier. Copie-colle le texte du cours dans la zone prévue.");}});
  const submitQuestion=async(autoSpeak=false)=>{
    const question=$('et-question').value.trim();if(!question){setAnswer("Écris une question ou la consigne de l'exercice.");return;}
    const btn=$('et-send');btn.disabled=true;btn.textContent='EduTrack réfléchit…';setAnswer("Préparation de ton explication…");
    try{
      const res=await fetch('/api/edutrack-study/tutor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({task:$('et-task').value,question,course_text:$('et-course').value,grade:$('et-grade').value,subject:$('et-subject').value,difficulty:$('et-level').value})});
      const data=await res.json();if(!res.ok)throw new Error(data.detail||'Le service est temporairement indisponible.');
      const answer=data.answer||data.response||data.reply||"Je n'ai pas reçu de réponse.";setAnswer(answer);if(autoSpeak)speakText(answer);
    }catch(err){setAnswer('EduTrack : '+(err.message||'Une erreur est survenue. Vérifie la connexion et réessaie.'));}
    finally{btn.disabled=false;btn.textContent='Demander à EduTrack';}
  };
  $('et-send').addEventListener('click',()=>submitQuestion(false));
  $('et-speak').addEventListener('click',()=>{
    speakText($('et-answer').textContent);
  });
  $('et-stop').addEventListener('click',()=>{if('speechSynthesis' in window)window.speechSynthesis.cancel();});
  let activeRecognition=null;
  $('et-listen').addEventListener('click',()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){
      $('et-voice-status').textContent="La dictée vocale n'est pas disponible ici. Ouvre EduTrack dans Chrome ou Edge récent et vérifie le microphone.";
      return;
    }
    try {
      if(activeRecognition){activeRecognition.stop();activeRecognition=null;}
      const rec=new SR();activeRecognition=rec;rec.lang='fr-FR';rec.interimResults=true;rec.continuous=false;rec.maxAlternatives=1;$('et-question').value='';
      $('et-voice-status').textContent='Écoute en cours… Parle clairement, puis attends la transcription.';
      $('et-listen').textContent='Écoute en cours…';
      rec.onresult=e=>{
        let transcript='';
        for(let i=e.resultIndex;i<e.results.length;i++) transcript+=e.results[i][0].transcript;
        $('et-question').value=transcript;
      };
      rec.onerror=e=>{
        const hints={ 'not-allowed':'Autorise l’accès au microphone dans le navigateur.','audio-capture':'Aucun microphone détecté.','no-speech':'Aucune parole détectée. Réessaie en parlant près du microphone.','network':'La reconnaissance vocale a rencontré un problème réseau.' };
        $('et-voice-status').textContent=hints[e.error]||('Dictée vocale indisponible : '+e.error+'.');
      };
      rec.onend=()=>{
        activeRecognition=null;$('et-listen').textContent='Parler à EduTrack';
        if($('et-question').value.trim()){ $('et-voice-status').textContent='Question reçue. EduTrack prépare sa réponse audio…'; submitQuestion(true); }
      };
      rec.start();
    } catch(err) {
      activeRecognition=null;$('et-listen').textContent='Parler à EduTrack';
      $('et-voice-status').textContent='Impossible de démarrer le microphone. Vérifie les permissions et réessaie.';
    }
  });
  let lastReminder='';
  const announce=()=>{
    const now=new Date(),hh=String(now.getHours()).padStart(2,'0'),mm=String(now.getMinutes()).padStart(2,'0'),key=now.toDateString()+' '+hh+':'+mm;
    let cfg;try{cfg=JSON.parse(localStorage.getItem('edutrack-study-reminder')||'null');}catch(_){cfg=null;}
    if(!cfg||cfg.time!==hh+':'+mm||lastReminder===key)return;
    if(cfg.days==='weekdays'&&(now.getDay()===0||now.getDay()===6))return;
    lastReminder=key;
    const msg="C'est l'heure de réviser avec EduTrack. Ouvre ton cours, relis les notions importantes et demande-moi de t'expliquer ce que tu ne comprends pas.";
    if('speechSynthesis' in window){window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(msg);u.lang='fr-FR';window.speechSynthesis.speak(u);}
    if('Notification' in window&&Notification.permission==='granted')new Notification('EduTrack — Temps de révision',{body:'Ouvre ton cours et commence ta séance de révision.'});
    $('et-reminder-status').textContent='Rappel déclenché. Bonne révision !';
  };
  $('et-reminder').addEventListener('click',async()=>{
    const time=$('et-time').value;if(!time){$('et-reminder-status').textContent='Choisis une heure pour le rappel.';return;}
    if('Notification' in window&&Notification.permission==='default'){try{await Notification.requestPermission();}catch(_){}}
    localStorage.setItem('edutrack-study-reminder',JSON.stringify({time,days:$('et-days').value}));
    $('et-reminder-status').textContent='Rappel activé pour '+time+'. Garde le site ouvert à cette heure pour entendre le message vocal.';
    announce();
  });
  $('et-clear').addEventListener('click',()=>{localStorage.removeItem('edutrack-study-reminder');$('et-reminder-status').textContent='Rappel désactivé.';});
  try{const cfg=JSON.parse(localStorage.getItem('edutrack-study-reminder')||'null');if(cfg){$('et-time').value=cfg.time;$('et-days').value=cfg.days;$('et-reminder-status').textContent='Rappel enregistré : '+cfg.time+'. Le site doit rester ouvert.';}}catch(_){}
  setInterval(announce,15000);
})();

/* EduTrack authentication: Supabase signup, email OTP and password login. */
(() => {
  if (window.__edutrackAuthBooted) return;
  window.__edutrackAuthBooted = true;
  const SUPABASE_URL = "https://dzneydemngmubjpfujdk.supabase.co";
  const SUPABASE_KEY = "sb_publishable_aUVbSBQWKy5zNVjKqhd-Fg_O-DBzhPt";
  const css = '#et-auth-overlay{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;overflow-y:auto;padding:18px;background:radial-gradient(ellipse at top left,#dbeafe 0,transparent 48%),radial-gradient(ellipse at bottom right,#ede9fe 0,transparent 45%),rgba(248,250,252,.98);font:16px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;color:#0f172a}#et-auth-overlay *{box-sizing:border-box}#et-auth-card{width:min(100%,430px);margin:auto;padding:26px;background:rgba(255,255,255,.97);border:1px solid #e2e8f0;border-radius:24px;box-shadow:0 24px 80px #0f172a1a}#et-auth-logo{display:flex;align-items:center;gap:10px;margin-bottom:20px;font-size:24px;font-weight:800;letter-spacing:-.7px}#et-auth-mark{display:grid;place-items:center;width:44px;height:44px;border-radius:14px;background:linear-gradient(140deg,#2563eb,#7c3aed);color:white;font-weight:900}#et-auth-card h1{font-size:24px;line-height:1.2;margin:0 0 8px;letter-spacing:-.5px}#et-auth-sub{color:#64748b;font-size:14px;margin:0 0 22px}#et-auth-form{display:grid;gap:13px}#et-auth-form label{display:grid;gap:6px;font-size:13px;font-weight:650;color:#334155}#et-auth-form input{width:100%;min-height:46px;padding:11px 13px;border:1px solid #cbd5e1;border-radius:12px;background:#fff;color:#0f172a;font:inherit;font-size:16px;outline:none}#et-auth-form input:focus{border-color:#2563eb;box-shadow:0 0 0 3px #2563eb20}#et-auth-submit{min-height:47px;margin-top:4px;border:0;border-radius:12px;background:linear-gradient(120deg,#2563eb,#6d5ae6);color:white;font-weight:750;font-size:15px;cursor:pointer}#et-auth-submit:disabled{opacity:.6;cursor:wait}#et-auth-switch{display:block;width:100%;margin-top:14px;padding:10px;border:0;background:transparent;color:#1d4ed8;font:600 14px system-ui;cursor:pointer}#et-auth-message{min-height:20px;margin-top:12px;color:#475569;font-size:13px;overflow-wrap:anywhere}#et-auth-message[data-kind=error]{color:#b91c1c}#et-auth-message[data-kind=success]{color:#047857}#et-auth-hint{font-size:12px;color:#64748b;margin-top:12px}#et-auth-userbar{position:fixed;top:10px;right:12px;z-index:2147482000;display:flex;align-items:center;gap:8px;max-width:calc(100vw - 24px);padding:7px 9px 7px 12px;border:1px solid #dbe4f0;border-radius:999px;background:rgba(255,255,255,.96);box-shadow:0 5px 20px #0f172a15;font:13px system-ui;color:#334155}#et-auth-userbar span{max-width:42vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#et-auth-logout{border:0;border-radius:999px;padding:8px 11px;background:#eff6ff;color:#1d4ed8;font-weight:700;cursor:pointer}@media(max-width:480px){#et-auth-overlay{padding:12px}#et-auth-card{padding:22px 18px;border-radius:20px}#et-auth-card h1{font-size:22px}#et-auth-userbar{top:7px;right:7px}}';
  const style=document.createElement('style'); style.id='et-auth-style'; style.textContent=css; document.head.appendChild(style);
  const sdk=document.createElement('script'); sdk.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'; sdk.async=true; sdk.onload=boot;
  sdk.onerror=()=>fatal('EduTrack ne peut pas charger le service de connexion. Vérifie ta connexion Internet puis actualise la page.');
  document.head.appendChild(sdk);
  function fatal(message){let o=document.getElementById('et-auth-overlay');if(!o){o=document.createElement('div');o.id='et-auth-overlay';document.body.appendChild(o);}o.innerHTML='<div id="et-auth-card"><div id="et-auth-logo"><div id="et-auth-mark">E</div><span>EduTrack</span></div><h1>Connexion indisponible</h1><p id="et-auth-sub"></p></div>';o.querySelector('#et-auth-sub').textContent=message;}
  function boot(){
    if(!window.supabase||!window.supabase.createClient){fatal('Le module de connexion n’a pas pu démarrer. Actualise la page.');return;}
    const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    window.__edutrackSupabase=client;
    let mode='login',pendingEmail='',busy=false;
    const overlay=document.createElement('div');overlay.id='et-auth-overlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');document.body.appendChild(overlay);
    function render(){
      overlay.innerHTML='<section id="et-auth-card"><div id="et-auth-logo"><div id="et-auth-mark">E</div><span>EduTrack</span></div><h1 id="et-auth-title">Connecte-toi à EduTrack</h1><p id="et-auth-sub">Retrouve ton espace scolaire et tes révisions.</p><form id="et-auth-form"><label id="et-auth-name-wrap" hidden>Nom complet<input id="et-auth-name" autocomplete="name" maxlength="100" placeholder="Ton nom et prénom"></label><label>Adresse e-mail<input id="et-auth-email" type="email" autocomplete="email" required maxlength="254" placeholder="nom@exemple.com"></label><label id="et-auth-password-wrap">Mot de passe<input id="et-auth-password" type="password" autocomplete="current-password" minlength="8" required placeholder="8 caractères minimum"></label><label id="et-auth-code-wrap" hidden>Code reçu par e-mail<input id="et-auth-code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" placeholder="Code à 6 chiffres"></label><button id="et-auth-submit" type="submit">Se connecter</button></form><button id="et-auth-switch" type="button">Créer un compte</button><div id="et-auth-message" role="status" aria-live="polite"></div><div id="et-auth-hint">L’inscription doit être confirmée avec le code envoyé à ton adresse e-mail.</div></section>';
      const $=id=>overlay.querySelector('#'+id),form=$('et-auth-form'),email=$('et-auth-email'),password=$('et-auth-password'),name=$('et-auth-name'),code=$('et-auth-code'),submit=$('et-auth-submit'),sw=$('et-auth-switch'),message=$('et-auth-message');
      const say=(t,k)=>{message.textContent=t;message.dataset.kind=k||'';};
      function sync(){ $('et-auth-name-wrap').hidden=mode!=='signup';$('et-auth-password-wrap').hidden=mode==='verify';$('et-auth-code-wrap').hidden=mode!=='verify';password.required=mode!=='verify';code.required=mode==='verify';email.readOnly=mode==='verify';$('et-auth-title').textContent=mode==='login'?'Connecte-toi à EduTrack':mode==='signup'?'Crée ton compte':'Vérifie ton adresse e-mail';$('et-auth-sub').textContent=mode==='login'?'Retrouve ton espace scolaire et tes révisions.':mode==='signup'?'Inscris-toi avec ton e-mail et un mot de passe.':'Saisis le code à 6 chiffres reçu dans ta boîte e-mail.';sw.hidden=mode==='verify';sw.textContent=mode==='login'?'Créer un compte':'J’ai déjà un compte : me connecter';$('et-auth-hint').textContent=mode==='verify'?'Vérifie aussi le dossier Spam/Indésirables.':'L’inscription doit être confirmée avec le code envoyé à ton adresse e-mail.';submit.disabled=false;submit.textContent=mode==='login'?'Se connecter':mode==='signup'?'Créer mon compte':'Vérifier le code';}
      sw.onclick=()=>{mode=mode==='login'?'signup':'login';say('');sync();};
      form.onsubmit=async ev=>{ev.preventDefault();if(busy)return;const address=email.value.trim().toLowerCase();if(!address){say('Saisis une adresse e-mail valide.','error');return;}busy=true;submit.disabled=true;submit.textContent='Patiente un instant…';say('');
        try{
          if(mode==='signup'){
            if(password.value.length<8)throw new Error('Choisis un mot de passe de 8 caractères minimum.');
            const r=await client.auth.signUp({email:address,password:password.value,options:{data:{full_name:name.value.trim()},emailRedirectTo:location.origin}});
            if(r.error)throw r.error;pendingEmail=address;
            if(r.data.session&&r.data.user){await saveProfile(r.data.user,name.value.trim());showApp(r.data.session);return;}
            mode='verify';email.value=address;say('Un code de confirmation a été demandé. Ouvre ton e-mail et saisis le code ci-dessous.','success');sync();code.focus();
          }else if(mode==='verify'){
            const token=code.value.trim();if(!/^[0-9]{6}$/.test(token))throw new Error('Saisis le code de confirmation à 6 chiffres.');
            const r=await client.auth.verifyOtp({email:pendingEmail||address,token:token,type:'signup'});if(r.error)throw r.error;if(!r.data.user||!r.data.session)throw new Error('Aucune session créée. Essaie de te connecter.');
            await saveProfile(r.data.user,(r.data.user.user_metadata||{}).full_name||'');showApp(r.data.session);
          }else{
            const r=await client.auth.signInWithPassword({email:address,password:password.value});if(r.error)throw r.error;await saveProfile(r.data.user,(r.data.user.user_metadata||{}).full_name||'');showApp(r.data.session);
          }
        }catch(e){say(friendly(e),'error');}finally{busy=false;if(document.getElementById('et-auth-overlay'))sync();}
      };
      sync();
    }
    async function saveProfile(user,name){if(!user||!user.id||!user.email)return;const r=await client.from('edutrack_profiles').upsert({id:user.id,full_name:String(name||(user.user_metadata||{}).full_name||'').trim().slice(0,100),email:user.email,updated_at:new Date().toISOString()},{onConflict:'id'});if(r.error)console.warn('EduTrack profile save:',r.error.message);}
    function friendly(e){const m=String(e&&(e.message||e.msg)||'');if(/invalid login credentials/i.test(m))return 'E-mail ou mot de passe incorrect.';if(/email not confirmed/i.test(m))return 'Confirme d’abord ton adresse e-mail avec le code reçu.';if(/user already registered/i.test(m))return 'Cette adresse possède déjà un compte. Connecte-toi.';if(/password should be at least/i.test(m))return 'Le mot de passe doit contenir au moins 8 caractères.';if(/rate limit|too many requests/i.test(m))return 'Trop de tentatives. Attends un peu avant de réessayer.';if(/invalid|expired|token/i.test(m))return 'Code incorrect ou expiré. Vérifie le code reçu et réessaie.';return m||'Une erreur est survenue. Réessaie.';}
    function showApp(session){const o=document.getElementById('et-auth-overlay');if(o)o.remove();let bar=document.getElementById('et-auth-userbar');if(!bar){bar=document.createElement('div');bar.id='et-auth-userbar';bar.innerHTML='<span id="et-auth-user-email"></span><button id="et-auth-logout" type="button">Déconnexion</button>';document.body.appendChild(bar);bar.querySelector('#et-auth-logout').onclick=async()=>{await client.auth.signOut();location.reload();};}const e=bar.querySelector('#et-auth-user-email');e.textContent=session&&session.user?session.user.email||'Compte connecté':'Compte connecté';e.title=e.textContent;bar.hidden=false;}
    if(!window.__edutrackAuthFetchPatched){window.__edutrackAuthFetchPatched=true;const original=window.fetch.bind(window);window.fetch=async(input,init={})=>{let p='';try{p=new URL(typeof input==='string'?input:input.url,location.href).pathname;}catch(_){}if(p==='/api/chat'||p==='/api/edutrack-study/tutor'){try{const r=await client.auth.getSession(),token=r.data&&r.data.session&&r.data.session.access_token;if(token){const headers=new Headers(init.headers||(input instanceof Request?input.headers:undefined));headers.set('Authorization','Bearer '+token);init={...init,headers};}}catch(_){}}return original(input,init);};}
    client.auth.onAuthStateChange((_event,session)=>{if(session)showApp(session);});
    client.auth.getSession().then(r=>{if(r.data&&r.data.session)showApp(r.data.session);else render();}).catch(render);
  }
})();
