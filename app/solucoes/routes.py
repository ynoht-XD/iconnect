from __future__ import annotations
from flask import render_template, jsonify
from . import solucoes_bp

@solucoes_bp.get("/solucoes")
def home():
    """
    Página principal de soluções de acessibilidade.
    (Depois criamos templates/solucoes.html e assets próprios)
    """
    return render_template("solucoes.html")

@solucoes_bp.get("/solucoes/cadastro-empresa")
def cadastro_empresa():
    """
    Página de cadastro para empresas (diferente do cadastro de pessoa).
    """
    return render_template("solucoes_cadastro_empresa.html")

@solucoes_bp.get("/solucoes/ping")
def ping():
    return jsonify(module="solucoes", status="ok")
