from __future__ import annotations
from flask import Blueprint

solucoes_bp = Blueprint(
    "solucoes",
    __name__,
    template_folder="templates",
    static_folder="static",
    static_url_path="/solucoes-static",  # ex.: /solucoes-static/css/solucoes.css
)

from . import routes  # noqa: E402,F401
