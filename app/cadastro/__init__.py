# hackathon/app/cadastro/__init__.py
from __future__ import annotations
from flask import Blueprint

# Blueprint do módulo Cadastro
# Obs.: se quiser que todas as rotas fiquem sob /cadastro, use:
# cadastro_bp = Blueprint(
#     "cadastro",
#     __name__,
#     template_folder="templates",
#     static_folder="static",
#     static_url_path="/cadastro-static",
#     url_prefix="/cadastro",  # <- ativa prefixo
# )
cadastro_bp = Blueprint(
    "cadastro",
    __name__,
    template_folder="templates",
    static_folder="static",
    static_url_path="/cadastro-static",  # ex.: /cadastro-static/css/cadastro.css
)

# Importa as rotas para registrar no blueprint
from . import routes  # noqa: E402, F401
