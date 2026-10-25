"""EduTrack study-coach API: course explanations and adaptive exercises."""
import os
from typing import Literal

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/edutrack-study", tags=["EduTrack Study Coach"])

SYSTEM = """Tu es EduTrack, un tuteur scolaire patient, clair et encourageant.
Tu aides les élèves à comprendre leurs cours, toutes matières confondues, en adaptant
le niveau à leur classe et à leur question. Réponds en français par défaut, sauf si
l'élève demande une autre langue. Explique étape par étape avec des mots simples,
définis les termes difficiles et donne des exemples proches de la vie réelle.
Si un cours est fourni, base-toi d'abord sur ce document, distingue clairement ce
qui y figure de tes connaissances générales et signale si une information manque.
Ne prétends jamais connaître la classe ou le programme si l'élève ne les précise pas.
Pour un exercice, ne donne pas immédiatement la correction complète : propose d'abord
la question, laisse l'élève réfléchir, puis corrige avec explication lorsqu'il répond.
Reste respectueux, positif, et ne fabrique pas de citations ou de faits."""

class StudyRequest(BaseModel):
    task: Literal["explain", "exercise", "correct", "ask"] = "ask"
    question: str = Field(min_length=1, max_length=8000)
    course_text: str = Field(default="", max_length=30000)
    grade: str = Field(default="", max_length=120)
    subject: str = Field(default="", max_length=120)
    difficulty: Literal["debutant", "normal", "avance"] = "normal"

async def ask_groq(messages):
    key = os.getenv("GROQ_API_KEY", "").strip()
    if not key:
        raise HTTPException(status_code=503, detail="Le service IA n'est pas configuré. Ajoutez GROQ_API_KEY dans les variables Render.")
    model = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    try:
        async with httpx.AsyncClient(timeout=45) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                json={"model": model, "messages": messages, "temperature": 0.4, "max_tokens": 1800},
            )
        if response.status_code >= 400:
            raise HTTPException(status_code=502, detail="Le service IA a refusé la demande. Réessaie dans un instant.")
        return response.json()["choices"][0]["message"]["content"]
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=502, detail="EduTrack n'arrive pas à joindre le service IA pour le moment.")

@router.post("/tutor")
async def tutor(req: StudyRequest):
    instructions = {
        "explain": "Explique le cours progressivement : idée principale, notions importantes, exemple concret, puis un mini-résumé. Termine en demandant si l'élève a compris avant de passer aux exercices.",
        "exercise": "Crée 3 exercices progressifs à partir du cours fourni, du plus simple au plus difficile. Présente les énoncés sans donner les réponses tout de suite. Demande à l'élève de répondre au premier.",
        "correct": "Corrige la réponse de l'élève étape par étape. Explique ce qui est juste, ce qui doit être amélioré, et montre la méthode correcte sans humilier l'élève.",
        "ask": "Réponds à la question de l'élève de façon adaptée à son niveau. Si pertinent, propose ensuite un petit exercice pour vérifier la compréhension."
    }
    context = [
        f"Classe/niveau : {req.grade or 'non précisé'}",
        f"Matière : {req.subject or 'non précisée'}",
        f"Difficulté : {req.difficulty}",
        f"Consigne pédagogique : {instructions[req.task]}",
    ]
    if req.course_text.strip():
        context.append("COURS FOURNI PAR L'ÉLÈVE (source prioritaire) :\n" + req.course_text.strip())
    messages = [
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": "\n\n".join(context) + "\n\nQuestion ou réponse de l'élève :\n" + req.question.strip()},
    ]
    answer = await ask_groq(messages)
    return {"answer": answer, "task": req.task}

@router.get("/health")
async def health():
    return {"ok": True, "provider_configured": bool(os.getenv("GROQ_API_KEY", "").strip())}
