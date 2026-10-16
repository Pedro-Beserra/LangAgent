import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()

llm = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0.2
)

response = llm.invoke("Diga 'Olá, jornalista investigativo!' e confirme que você está operacional");

print("\n--- RESPOSTA DO GROQ ---")
print(response.content)