# hackathon/app/cadastro/routes.py
from __future__ import annotations
from flask import render_template, jsonify
from . import cadastro_bp

# ============================================================
# Página principal de cadastro (escolha: empresa ou colaborador)
# ============================================================
@cadastro_bp.get("/cadastro")
def cadastro_home():
    """
    Página principal de cadastro, com os dois cards de escolha.
    Renderiza: hackathon/app/cadastro/templates/cadastro.html
    """
    return render_template("cadastro.html")


# ============================================================
# Cadastro para empresas, projetos ou eventos
# ============================================================
@cadastro_bp.get("/cadastro/empresa")
def cadastro_empresa():
    """
    Página para empresas, projetos ou eventos que buscam acessibilidade.
    Renderiza: hackathon/app/cadastro/templates/cadastro_empresa.html
    """
    return render_template("cadastro_empresa.html")


# ============================================================
# Cadastro para colaboradores e freelancers
# ============================================================
@cadastro_bp.get("/cadastro/colaborador")
def cadastro_colaborador():
    """
    Página para colaboradores/freelancers que desejam participar dos projetos.
    Renderiza: hackathon/app/cadastro/templates/cadastro_colaborador.html
    """
    return render_template("cadastro_colaborador.html")


# ============================================================
# Endpoint de teste / health check
# ============================================================
@cadastro_bp.get("/cadastro/ping")
def cadastro_ping():
    """Endpoint simples para verificar se o módulo está ativo."""
    return jsonify(module="cadastro", status="ok")
