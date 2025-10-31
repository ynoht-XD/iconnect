from __future__ import annotations
from flask import Blueprint

contato_bp = Blueprint(
    "contato",
    __name__,
    template_folder="templates",
    static_folder="static",
    static_url_path="/contato-static",  # ex.: /contato-static/css/contato.css
)

from . import routes  # noqa: E402,F401
