from typing import Annotated, TypedDict
import operator

class SourceItem(TypedDict):
    title: str
    url: str
    snippet: str
    source: str

class FactCheckState(TypedDict, total=False):
    # Entrada do usuário e credencial opcional
    claim: str
    api_key: str
    
    # Estratégia de busca definida pelo nó Planner
    wikipedia_query: str
    web_queries: list[str]
    plan_explanation: str
    
    # Evidências acumuladas
    sources: Annotated[list[SourceItem], operator.add]
    
    # Histórico de passos/atividades do agente para visualização no frontend
    steps_log: Annotated[list[str], operator.add]
    
    # Resultado final
    verdict: str         # "Verdadeiro", "Falso", "Parcialmente Verdadeiro", "Inconclusivo"
    confidence: str      # "Alta", "Média", "Baixa"
    summary: str         # Resumo executivo da checagem
    analysis: str        # Análise investigativa detalhada com citações

