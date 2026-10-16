import json
import traceback
from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import StreamingResponse

from app.api.schemas import CheckClaimRequest, CheckClaimResponse
from app.agent.graph import fact_check_agent
from app.core.errors import AgentException, GroqAuthError
from app.api.auth import router as auth_router

router = APIRouter(prefix="/api")
router.include_router(auth_router)


@router.get("/health", tags=["Sistema"])
def health_check():
    return {"status": "ok", "service": "Fact-Checking Agent"}


@router.post("/check", response_model=CheckClaimResponse)
async def check_claim(request: CheckClaimRequest):
    """Executa a checagem de fatos completa e retorna a resposta consolidada."""
    try:
        initial_state = {
            "claim": request.claim.strip(),
            "api_key": request.api_key.strip() if request.api_key else None,
            "sources": [],
            "steps_log": ["Iniciando investigacao jornalistica..."]
        }
        
        final_state = await fact_check_agent.ainvoke(initial_state)

        return CheckClaimResponse(
            success=True,
            claim=final_state.get("claim", request.claim),
            verdict=final_state.get("verdict", "Inconclusivo"),
            confidence=final_state.get("confidence", "Baixa"),
            summary=final_state.get("summary", ""),
            analysis=final_state.get("analysis", ""),
            sources=final_state.get("sources", []),
            steps_log=final_state.get("steps_log", [])
        )
    except GroqAuthError as ge:
        raise HTTPException(
            status_code=401,
            detail={"stage": "groq_auth", "message": ge.message, "details": ge.details}
        )
    except AgentException as ae:
        raise HTTPException(
            status_code=400,
            detail={"stage": ae.stage, "message": ae.message, "details": ae.details}
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"stage": "server", "message": f"Erro interno: {str(e)}", "details": traceback.format_exc()}
        )


@router.post("/check/stream")
async def check_claim_stream(request: CheckClaimRequest):
    """Executa o agente enviando eventos em tempo real (SSE) para o frontend."""
    async def event_generator():
        # Evento de início
        yield f"data: {json.dumps({'event': 'start', 'message': 'Investigação iniciada com sucesso'})}\n\n"

        initial_state = {
            "claim": request.claim.strip(),
            "api_key": request.api_key.strip() if request.api_key else None,
            "sources": [],
            "steps_log": ["Iniciando investigacao jornalistica..."]
        }

        accumulated_state = dict(initial_state)

        try:
            # stream_mode=["updates", "messages"] entrega fim de nós E tokens do LLM em tempo real
            async for mode, event in fact_check_agent.astream(
                initial_state, stream_mode=["updates", "messages"]
            ):
                # A) Tokens do LLM sendo gerados em tempo real
                if mode == "messages":
                    msg_chunk, metadata = event
                    # Filtra apenas os tokens da análise final (usando a tag que definimos no graph.py)
                    if "analysis_stream" in metadata.get("tags", []) and msg_chunk.content:
                        token_payload = {
                            "event": "token",
                            "content": msg_chunk.content,
                        }
                        yield f"data: {json.dumps(token_payload, ensure_ascii=False)}\n\n"

                # B) Conclusão de cada nó (Planner, Wiki, Web, Fact-Checker)
                elif mode == "updates":
                    for node_name, node_update in event.items():
                        # Acumula listas (sources e steps_log) sem sobrescrever!
                        for key, val in node_update.items():
                            if key in ("sources", "steps_log") and isinstance(val, list):
                                accumulated_state[key] = accumulated_state.get(key, []) + val
                            else:
                                accumulated_state[key] = val

                        payload = {
                            "event": "node_update",
                            "node": node_name,
                            "update": node_update,
                        }
                        yield f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"

            # Evento final de sucesso
            yield f"data: {json.dumps({'event': 'finished', 'data': accumulated_state}, ensure_ascii=False)}\n\n"
        except AgentException as ae:
            error_payload = {
                "event": "error",
                "stage": ae.stage,
                "message": ae.message,
                "details": ae.details
            }
            yield f"data: {json.dumps(error_payload, ensure_ascii=False)}\n\n"
        except Exception as e:
            error_payload = {
                "event": "error",
                "stage": "general",
                "message": f"Erro inesperado: {str(e)}",
                "details": traceback.format_exc()
            }
            yield f"data: {json.dumps(error_payload, ensure_ascii=False)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

