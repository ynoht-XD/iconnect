from __future__ import annotations
from flask import render_template, jsonify
from . import equipe_bp

@equipe_bp.get("/equipe")
def equipe_home():
    """
    Página 'Nossa Equipe' (sobre nós).
    Template: app/equipe/templates/equipe.html (criaremos depois)
    """
    return render_template("equipe.html")

@equipe_bp.get("/equipe/ping")
def equipe_ping():
    return jsonify(module="equipe", status="ok")
