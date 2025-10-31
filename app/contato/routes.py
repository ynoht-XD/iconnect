from __future__ import annotations
from flask import render_template, request, jsonify
from . import contato_bp

@contato_bp.get("/contato")
def contato_home():
    """
    Página de contato (template virá depois).
    """
    return render_template("contato.html")

@contato_bp.post("/contato/enviar")
def contato_enviar():
    """
    Endpoint básico para receber o formulário de contato.
    (Por enquanto: ecoa os dados em JSON.)
    """
    data = {
        "nome": request.form.get("nome"),
        "email": request.form.get("email"),
        "assunto": request.form.get("assunto"),
        "mensagem": request.form.get("mensagem"),
    }
    # TODO: validar, enviar e-mail, persistir no banco etc.
    return jsonify(ok=True, recebido=data)

@contato_bp.get("/contato/ping")
def contato_ping():
    """Sanity check do módulo."""
    return jsonify(module="contato", status="ok")
