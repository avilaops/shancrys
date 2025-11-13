#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Shancrys Module Completion Reporter

Gera relatorios HTML quando modulos sao finalizados e envia por email.
"""

from __future__ import annotations

import argparse
import html
import os
import smtplib
import textwrap
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path


def generate_module_report_html(module_name: str, status: str, features: list, description: str) -> str:
    """Gera HTML do relatorio de modulo."""
    ts = datetime.now().strftime('%d/%m/%Y %H:%M')
    status_colors = {'completed': '#10b981', 'in-progress': '#f59e0b', 'blocked': '#ef4444'}
    sc = status_colors.get(status, '#6b7280')
    feat_html = ''.join([f'<li>{html.escape(f)}</li>' for f in features]) if features else '<li>N/A</li>'
    
    return f'''<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Modulo {html.escape(module_name)}</title>
<style>
*{{margin:0;padding:0}}
body{{font-family:system-ui;background:#f9fafb;padding:20px}}
.container{{max-width:900px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.1)}}
.header{{background:linear-gradient(135deg,#233b8a,#5a2f90);color:#fff;padding:48px 40px}}
.header h1{{font-size:36px;font-weight:800}}
.status-badge{{display:inline-block;padding:8px 20px;border-radius:999px;background:{sc};color:#fff;margin:16px 0}}
.content{{padding:40px}}
.section{{margin-bottom:32px}}
.section-title{{font-size:22px;font-weight:700;color:#233b8a;margin-bottom:16px;border-bottom:2px solid #e5e7eb;padding-bottom:8px}}
.list{{list-style:none;padding:0}}
.list li{{padding:10px 14px;margin-bottom:6px;background:#f9fafb;border-radius:6px;border-left:3px solid #233b8a}}
</style>
</head>
<body>
<div class="container">
<div class="header">
<h1>Modulo Finalizado</h1>
<div style="font-size:20px;margin:12px 0">{html.escape(module_name)}</div>
<span class="status-badge">{html.escape(status.upper())}</span>
<div style="margin-top:20px;font-size:14px">Data: {ts}</div>
</div>
<div class="content">
<section class="section">
<h2 class="section-title">Descricao</h2>
<p>{html.escape(description) if description else 'N/A'}</p>
</section>
<section class="section">
<h2 class="section-title">Features Implementadas</h2>
<ul class="list">{feat_html}</ul>
</section>
<div style="margin-top:40px;text-align:center;color:#6b7280;font-size:12px">
<p><strong>Shancrys 4D BIM</strong> - AvilaOps</p>
</div>
</div>
</div>
</body>
</html>'''


def send_report_email(html_content: str, module_name: str) -> bool:
    """Envia email com relatorio."""
    try:
        smtp = smtplib.SMTP("smtp.porkbun.com", 587, timeout=30)
        smtp.starttls()
        smtp.login("dev@avila.inc", "7Aciqgr7@3278579")
        
        msg = MIMEMultipart()
        msg['Subject'] = f"[Shancrys] Modulo Finalizado: {module_name}"
        msg['From'] = "dev@avila.inc"
        msg['To'] = "nicolas@avila.inc"
        msg.attach(MIMEText(html_content, 'html', 'utf-8'))
        
        smtp.sendmail("dev@avila.inc", ["nicolas@avila.inc"], msg.as_string())
        smtp.quit()
        return True
    except Exception as e:
        print(f"Erro email: {e}")
        return False


def main():
    p = argparse.ArgumentParser(description='Relatorio de modulo Shancrys')
    p.add_argument('--module', required=True, help='Nome do modulo')
    p.add_argument('--status', default='completed', help='Status do modulo')
    p.add_argument('--description', default='', help='Descricao')
    p.add_argument('--features', nargs='*', default=[], help='Features')
    p.add_argument('--dry-run', action='store_true', help='Nao envia email')
    p.add_argument('--open', action='store_true', help='Abre no navegador')
    args = p.parse_args()
    
    print(f"Gerando relatorio: {args.module}")
    
    html_content = generate_module_report_html(args.module, args.status, args.features, args.description)
    
    rep_dir = Path("Reports")
    rep_dir.mkdir(exist_ok=True)
    
    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    mod_safe = args.module.replace('/', '_').replace('\\', '_')
    out_file = rep_dir / f"module_{mod_safe}_{ts}.html"
    out_file.write_text(html_content, encoding='utf-8')
    print(f"Salvo em: {out_file}")
    
    if not args.dry_run:
        print("Enviando email...")
        sent = send_report_email(html_content, args.module)
        print(f"Email: {'ENVIADO' if sent else 'FALHOU'}")
    else:
        print("Dry-run: email nao enviado")
    
    if args.open and os.name == 'nt':
        os.startfile(str(out_file))
    
    return 0

if __name__ == '__main__':
    exit(main())
