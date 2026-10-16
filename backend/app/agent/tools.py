"""
Ferramentas de pesquisa para o Agente de Fact-Checking:
1. Wikipédia (Contexto histórico e enciclopédico)
2. DuckDuckGo / DDGS (Notícias e fatos recentes na Web)
"""

import wikipedia
from ddgs import DDGS

# Configurar idioma e User-Agent da Wikipédia
wikipedia.set_lang("pt")
wikipedia.set_user_agent("FactCheckingAgent/1.0 (educational-agent@example.com)")


def search_wikipedia(query: str, max_results: int = 2) -> list[dict]:
    """Busca artigos na Wikipédia relacionados ao termo especificado."""
    results = []
    try:
        search_titles = wikipedia.search(query, results=max_results)
        for title in search_titles:
            try:
                page = wikipedia.page(title, auto_suggest=False)
                results.append({
                    "title": f"Wikipédia: {page.title}",
                    "url": page.url,
                    "snippet": page.summary[:800],
                    "source": "Wikipedia"
                })
            except Exception:
                continue
    except Exception as e:
        print(f"[Aviso] Erro na ferramenta Wikipedia ('{query}'): {e}")
    return results


def search_web(query: str, max_results: int = 3) -> list[dict]:
    """Busca notícias e artigos recentes na Web via DDGS."""
    results = []
    try:
        with DDGS() as ddgs:
            raw_results = list(ddgs.text(query, max_results=max_results))
            for item in raw_results:
                results.append({
                    "title": item.get("title", "Sem título"),
                    "url": item.get("href", ""),
                    "snippet": item.get("body", ""),
                    "source": "Web"
                })
    except Exception as e:
        print(f"[Aviso] Erro na ferramenta Web Search ('{query}'): {e}")
    return results

