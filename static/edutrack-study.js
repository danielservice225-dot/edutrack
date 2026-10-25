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
  launch.addEventListener('click',()=>{panel.style.display='flex';});
  $('et-close').addEventListener('click',()=>{panel.style.display='none';});
  $('et-file').addEventListener('change',async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;try{$('et-course').value=await f.text();}catch(_){setAnswer("Impossible de lire ce fichier. Copie-colle le texte du cours dans la zone prévue.");}});
  $('et-send').addEventListener('click',async()=>{
    const question=$('et-question').value.trim();if(!question){setAnswer("Écris une question ou la consigne de l'exercice.");return;}
    const btn=$('et-send');btn.disabled=true;btn.textContent='EduTrack réfléchit…';setAnswer("Préparation de ton explication…");
    try{
      const res=await fetch('/api/edutrack-study/tutor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({task:$('et-task').value,question,course_text:$('et-course').value,grade:$('et-grade').value,subject:$('et-subject').value,difficulty:$('et-level').value})});
      const data=await res.json();if(!res.ok)throw new Error(data.detail||'Le service est temporairement indisponible.');
      setAnswer(data.answer||"Je n'ai pas reçu de réponse.");
    }catch(err){setAnswer('EduTrack : '+(err.message||'Une erreur est survenue. Vérifie la connexion et réessaie.'));}
    finally{btn.disabled=false;btn.textContent='Demander à EduTrack';}
  });
  $('et-speak').addEventListener('click',()=>{
    if(!('speechSynthesis' in window)){setAnswer($('et-answer').textContent+'\n\nLa lecture vocale n’est pas disponible dans ce navigateur.');return;}
    window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance($('et-answer').textContent);u.lang='fr-FR';window.speechSynthesis.speak(u);
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
      const rec=new SR();activeRecognition=rec;rec.lang='fr-FR';rec.interimResults=true;rec.continuous=false;rec.maxAlternatives=1;
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
        if($('et-question').value.trim()) $('et-voice-status').textContent='Question transcrite. Vérifie le texte puis appuie sur « Demander à EduTrack ».';
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