from typing import Literal
from pydantic import BaseModel, Field

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, START, END
from langchain_core.output_parsers import StrOutputParser

from app.core.config import settings
from app.core.errors import AgentException, GroqAuthError
from .state import FactCheckState, SourceItem
from .tools import search_wikipedia, search_web


# Modelos Pydantic para saída estruturada
class PlanOutput(BaseModel):
    wikipedia_query: str = Field(
        description="Termo para consultar a enciclopédia Wikipédia para obter contexto de fundo ou definições."
    )
    web_queries: list[str] = Field(
        description="Lista de 1 a 2 termos específicos para buscar notícias recentes ou artigos na Web."
    )
    plan_explanation: str = Field(
        description="Breve explicação da estratégia investigativa para validar a afirmação."
    )


class VerdictOutput(BaseModel):
    verdict: Literal["Verdadeiro", "Falso", "Parcialmente Verdadeiro", "Inconclusivo"] = Field(
        description="Veredito definitivo sobre a alegação."
    )
    confidence: Literal["Alta", "Média", "Baixa"] = Field(
        description="Nível de confiança na avaliação com base nas fontes encontradas."
    )
    summary: str = Field(
        description="Resumo executivo direto ao ponto explicando a conclusão."
    )

def get_llm(custom_api_key: str | None = None) -> ChatGroq:
    key = (custom_api_key or "").strip() or settings.DEFAULT_GROQ_API_KEY.strip()
    if not key:
        raise GroqAuthError(
            message="Chave da API Groq não informada. Insira sua chave no campo superior do app ou configure GROQ_API_KEY no .env."
        )
    try:
        return ChatGroq(
            model=settings.DEFAULT_GROQ_MODEL,
            temperature=0.1,
            api_key=key,
        )
    except Exception as e:
        raise GroqAuthError(
            message="Falha ao inicializar conexão com o modelo Groq.",
            details=str(e)
        )


# --- NÓ 1: PLANNER ---
def planner_node(state: FactCheckState) -> dict:
    claim = state.get("claim", "")
    api_key = state.get("api_key")
    
    try:
        llm = get_llm(api_key)
        prompt = ChatPromptTemplate.from_messages([
            (
                "system",
                "Você é um editor-chefe de checagem de fatos jornalísticos. "
                "Sua missão é criar uma estratégia de busca para investigar a alegação do leitor:\n"
                "1. wikipedia_query: Um termo de busca para a Wikipédia.\n"
                "2. web_queries: 1 a 2 buscas objetivas para o buscador da Web (DuckDuckGo).\n"
                "3. plan_explanation: Uma frase explicando o ângulo de investigação."
            ),
            (
                "human",
                "Afirmação a ser investigada: {claim}"
            )
        ])

        structured_llm = llm.with_structured_output(PlanOutput)
        chain = prompt | structured_llm
        plan_result: PlanOutput = chain.invoke({"claim": claim})

        return {
            "wikipedia_query": plan_result.wikipedia_query,
            "web_queries": plan_result.web_queries,
            "plan_explanation": plan_result.plan_explanation,
            "steps_log": [
                f"Estratégia: {plan_result.plan_explanation}",
                f"Consultas planejadas: Wikipédia ('{plan_result.wikipedia_query}') e Web ({plan_result.web_queries})"
            ]
        }
    except GroqAuthError:
        raise
    except Exception as e:
        raise AgentException(
            message="Falha ao gerar o plano de investigação no modelo de linguagem.",
            stage="planner",
            details=str(e)
        )


# --- NÓ 2A: WIKIPEDIA RESEARCHER (Especialista Histórico/Enciclopédico) ---
def wiki_researcher_node(state: FactCheckState) -> dict:
    wiki_query = state.get("wikipedia_query", "")
    
    collected_sources: list[SourceItem] = []
    log_messages = []

    if wiki_query:
        wiki_results = search_wikipedia(wiki_query, max_results=2)
        collected_sources.extend(wiki_results)
        log_messages.append(f"Wikipédia: {len(wiki_results)} artigos de referência coletados para '{wiki_query}'.")
    else:
        log_messages.append("Wikipédia: Nenhuma consulta enciclopédica necessária.")

    return {
        "sources": collected_sources,
        "steps_log": log_messages
    }


# --- NÓ 2B: WEB RESEARCHER (Especialista em Notícias e Web Recente) ---
def web_researcher_node(state: FactCheckState) -> dict:
    web_queries = state.get("web_queries", [])
    
    collected_sources: list[SourceItem] = []
    log_messages = []

    for q in web_queries:
        web_results = search_web(q, max_results=3)
        collected_sources.extend(web_results)
        log_messages.append(f"Web: {len(web_results)} fontes recentes para '{q}'.")

    if not web_queries:
        log_messages.append("Web: Nenhuma consulta de notícias recente informada.")

    return {
        "sources": collected_sources,
        "steps_log": log_messages
    }


# --- NÓ 3: FACT-CHECKER (Auditoria e Veredito) ---
async def fact_checker_node(state: FactCheckState) -> dict:
    claim = state.get("claim", "")
    api_key = state.get("api_key")
    sources = state.get("sources", [])
    sources_text = ""
    for i, s in enumerate(sources, 1):
        sources_text += f"\n[Fonte {i}] {s['title']} ({s['source']}):\n{s['snippet']}\nLink: {s['url']}\n"
    if not sources_text.strip():
        sources_text = "Nenhuma fonte relevante foi encontrada durante a pesquisa."
    try:
        llm = get_llm(api_key)
        verdict_prompt = ChatPromptTemplate.from_messages([
            (
                "system",
                "Você é um jornalista auditor de checagem de fatos.\n"
                "Analise as evidências e defina:\n"
                "- Veredito: 'Verdadeiro', 'Falso', 'Parcialmente Verdadeiro' ou 'Inconclusivo'.\n"
                "- Confiança: 'Alta', 'Média' ou 'Baixa'.\n"
                "- Summary: Resumo executivo direto de 1 a 2 parágrafos."
            ),
            ("human", "Afirmação: {claim}\n\nFontes:\n{sources_text}")
        ])
        structured_chain = verdict_prompt | llm.with_structured_output(VerdictOutput)
        verdict_result: VerdictOutput = await structured_chain.ainvoke({
            "claim": claim,
            "sources_text": sources_text
        })
        # Retorna imediatamente para o frontend já renderizar o Badge e o Resumo!
        return {
            "verdict": verdict_result.verdict,
            "confidence": verdict_result.confidence,
            "summary": verdict_result.summary,
            "steps_log": [
                f"Veredito definido: {verdict_result.verdict} (Confiança: {verdict_result.confidence}). Redigindo análise..."
            ]
        }
    except GroqAuthError:
        raise
    except Exception as e:
        raise AgentException(
            message="Falha ao gerar o veredito no modelo de linguagem.",
            stage="fact_checker",
            details=str(e)
        )


async def analysis_writer_node(state: FactCheckState) -> dict:
    claim = state.get("claim", "")
    api_key = state.get("api_key")
    sources = state.get("sources", [])
    verdict = state.get("verdict", "Inconclusivo")
    summary = state.get("summary", "")
    sources_text = ""
    for i, s in enumerate(sources, 1):
        sources_text += f"\n[Fonte {i}] {s['title']} ({s['source']}):\n{s['snippet']}\nLink: {s['url']}\n"
    if not sources_text.strip():
        sources_text = "Nenhuma fonte relevante foi encontrada durante a pesquisa."
    try:
        llm = get_llm(api_key)
        analysis_prompt = ChatPromptTemplate.from_messages([
            (
                "system",
                "Você é um jornalista investigativo. Escreva a análise detalhada fundamentando o veredito '{verdict}'. "
                "Contraste a afirmação com as evidências e cite nominalmente as fontes encontradas. "
                "Responda apenas com o texto da análise, em parágrafos bem divididos."
            ),
            ("human", "Afirmação: {claim}\n\nResumo do Veredito: {summary}\n\nFontes:\n{sources_text}")
        ])
        analysis_chain = (analysis_prompt | llm | StrOutputParser()).with_config(
            tags=["analysis_stream"]
        )
        full_analysis = ""
        async for chunk in analysis_chain.astream({
            "claim": claim,
            "verdict": verdict,
            "summary": summary,
            "sources_text": sources_text,
        }):
            full_analysis += chunk
        return {
            "analysis": full_analysis,
            "steps_log": ["Análise investigativa concluída."]
        }
    except GroqAuthError:
        raise
    except Exception as e:
        raise AgentException(
            message="Falha ao redigir a análise final no modelo de linguagem.",
            stage="fact_checker",
            details=str(e)
        )


# --- CONSTRUÇÃO DO WORKFLOW COM LANGGRAPH ---
def build_fact_check_graph():
    builder = StateGraph(FactCheckState)

    builder.add_node("planner", planner_node)
    builder.add_node("wiki_researcher", wiki_researcher_node)
    builder.add_node("web_researcher", web_researcher_node)
    builder.add_node("fact_checker", fact_checker_node)
    builder.add_node("analysis_writer", analysis_writer_node)

    builder.add_edge(START, "planner")

    builder.add_edge("planner", "wiki_researcher")
    builder.add_edge("planner", "web_researcher")

    builder.add_edge("wiki_researcher", "fact_checker")
    builder.add_edge("web_researcher", "fact_checker")

    # Veredito pronto -> Escreve a análise em streaming -> Fim
    builder.add_edge("fact_checker", "analysis_writer")
    builder.add_edge("analysis_writer", END)

    return builder.compile()


fact_check_agent = build_fact_check_graph()

