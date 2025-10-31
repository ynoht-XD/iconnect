# hackathon/app.py
from app import create_app, Config

# Cria a instância da aplicação Flask
app = create_app(Config)

# Executa a aplicação localmente
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
