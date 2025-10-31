# hackathon/app/__init__.py
from __future__ import annotations
import os
from flask import Flask


# =====================================================
# CONFIGURAÇÕES GERAIS
# =====================================================
class Config:
    """Configurações básicas da aplicação."""
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
    TEMPLATES_AUTO_RELOAD = True
    SEND_FILE_MAX_AGE_DEFAULT = 0  # sem cache para dev
    JSON_AS_ASCII = False
    JSON_SORT_KEYS = False


# =====================================================
# FACTORY PRINCIPAL
# =====================================================
def create_app(config_class: type[Config] = Config) -> Flask:
    """Cria e configura a aplicação Flask principal."""
    app = Flask(
        __name__,
        static_folder="static",
        template_folder="templates",
    )
    app.config.from_object(config_class)

    # ===========================
    # BLUEPRINTS PRINCIPAIS
    # ===========================
    # Página inicial
    from .core.routes import core_bp
    app.register_blueprint(core_bp)

    # Módulo de cadastro
    from .cadastro import cadastro_bp
    app.register_blueprint(cadastro_bp)

    # Módulo de soluções
    from .solucoes import solucoes_bp
    app.register_blueprint(solucoes_bp)

    # Módulo de contato
    from .contato import contato_bp
    app.register_blueprint(contato_bp)

    # Módulo "Sobre nós" / equipe
    from .equipe import equipe_bp
    app.register_blueprint(equipe_bp)

    # (Exemplo futuro)
    # from .vagas import vagas_bp
    # app.register_blueprint(vagas_bp)

    # ===========================
    # VARIÁVEIS GLOBAIS (JINJA)
    # ===========================
    @app.context_processor
    def inject_globals():
        """Variáveis disponíveis em todos os templates."""
        return {
            "APP_NAME": "InovaAcess",
            "APP_VERSION": "1.0.0",
        }

    # ===========================
    # ERROS CUSTOMIZADOS
    # ===========================
    from flask import render_template

    @app.errorhandler(404)
    def not_found(err):
        """Erro 404 - Página não encontrada."""
        tpl = os.path.join(app.template_folder, "errors", "404.html")
        if os.path.exists(tpl):
            return render_template("errors/404.html"), 404
        return "<h1>404</h1><p>Página não encontrada.</p>", 404

    @app.errorhandler(500)
    def server_error(err):
        """Erro 500 - Erro interno do servidor."""
        tpl = os.path.join(app.template_folder, "errors", "500.html")
        if os.path.exists(tpl):
            return render_template("errors/500.html"), 500
        return "<h1>500</h1><p>Erro interno do servidor.</p>", 500

    # ===========================
    # LOG DE INICIALIZAÇÃO
    # ===========================
    print("\n" + "=" * 60)
    print("🚀 Aplicação InovaAcess iniciada com sucesso!")
    print(f"📦  Blueprints carregados: {', '.join(app.blueprints.keys())}")
    print("=" * 60 + "\n")

    return app
