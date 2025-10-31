# hackathon/app/core/routes.py
from __future__ import annotations
from flask import Blueprint, render_template, jsonify

core_bp = Blueprint("core", __name__)


@core_bp.get("/")
def index():
    # Renderiza a home que estende o layout.html
    return render_template("index.html")


@core_bp.get("/healthz")
def healthz():
    # Endpoint de verificação rápida (para CI/monitoramento)
    return jsonify(status="ok")
