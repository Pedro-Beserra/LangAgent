from agent.tools import search_wikipedia, search_web

print("\n--- TESTANDO WIKIPÉDIA ---")
wiki_res = search_wikipedia("Albert einstein", max_results=1)
for item in wiki_res:
    print(f"Título: {item['title']}")
    print(f"Trecho: {item['snippet'][:200]}...")
print("\n--- TESTANDO BUSCA WEB (duckduckgo) ---")
web_res = search_web("Quanto foi o último jogo do santos?", max_results=2)
for item in web_res:
    print(f"Título: {item['title']}")
    print(f"Link: {item['url']}")
    print(f"Descrição: {item['snippet'][:200]}...")