from __future__ import annotations
from flask import Blueprint

equipe_bp = Blueprint(
    "equipe",
    __name__,
    template_folder="templates",
    static_folder="static",
    static_url_path="/equipe-static",  # ex.: /equipe-static/css/equipe.css
)

from . import routes  # noqa: E402,F401
