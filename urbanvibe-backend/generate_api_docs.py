"""
Script para generar documentación completa de endpoints del backend UrbanVibe.
Analiza directamente los archivos de routers sin necesidad de importar la app.
"""
import re
import ast
from pathlib import Path
from typing import List, Dict, Any


def extract_endpoints_from_router(router_path: Path) -> List[Dict[str, Any]]:
    """Extrae información de endpoints de un archivo de router."""
    endpoints = []
    
    try:
        content = router_path.read_text(encoding='utf-8')
        
        # Buscar decoradores de router (@router.get, @router.post, etc.)
        pattern = r'@router\.(get|post|put|patch|delete)\(["\']([^"\']+)["\'](.*?)\)'
        
        for match in re.finditer(pattern, content):
            method = match.group(1).upper()
            path = match.group(2)
            params = match.group(3)
            
            # Extraer nombre de función (línea siguiente al decorador)
            func_match = re.search(r'async def (\w+)\(', content[match.end():match.end()+200])
            func_name = func_match.group(1) if func_match else 'unknown'
            
            # Buscar docstring de la función
            docstring_match = re.search(
                rf'async def {func_name}\([^)]*\):\s*"""([^"]+)"""',
                content,
                re.MULTILINE
            )
            docstring = docstring_match.group(1).strip() if docstring_match else ''
            
            endpoints.append({
                'method': method,
                'path': path,
                'function': func_name,
                'docstring': docstring,
                'router_file': router_path.name
            })
    
    except Exception as e:
        print(f"⚠️ Error procesando {router_path}: {e}")
    
    return endpoints


def generate_documentation():
    """Genera el documento de documentación completo."""
    
    # Buscar todos los archivos de endpoints
    endpoints_dir = Path(__file__).parent / 'app' / 'api' / 'v1' / 'endpoints'
    
    if not endpoints_dir.exists():
        raise FileNotFoundError(f"No se encontró el directorio: {endpoints_dir}")
    
    # Recopilar todos los endpoints
    all_endpoints = []
    router_files = sorted(endpoints_dir.glob('*.py'))
    
    for router_file in router_files:
        if router_file.name == '__init__.py':
            continue
        
        print(f"📄 Procesando {router_file.name}...")
        endpoints = extract_endpoints_from_router(router_file)
        all_endpoints.extend(endpoints)
    
    # Organizar por módulo
    endpoints_by_module = {}
    for endpoint in all_endpoints:
        module = endpoint['router_file'].replace('.py', '')
        if module not in endpoints_by_module:
            endpoints_by_module[module] = []
        endpoints_by_module[module].append(endpoint)
    
    # Generar markdown
    md_lines = [
        "# Documentación API Backend - UrbanVibe",
        "",
        "**Proyecto:** UrbanVibe - Plataforma de descubrimiento urbano",
        "**Backend:** FastAPI + PostgreSQL (Supabase)",
        "",
        "Esta documentación detalla todos los endpoints disponibles en la API REST.",
        "",
        "---",
        "",
        "## Índice",
        ""
    ]
    
    # Índice por módulo
    for module in sorted(endpoints_by_module.keys()):
        anchor = module.lower().replace('_', '-')
        endpoint_count = len(endpoints_by_module[module])
        md_lines.append(f"- [{module.title()}](#{anchor}) ({endpoint_count} endpoints)")
    
    md_lines.extend(["", "---", ""])
    
    # Documentación detallada
    for module in sorted(endpoints_by_module.keys()):
        md_lines.extend([
            f"## {module.title()}",
            "",
            f"**Archivo:** `app/api/v1/endpoints/{module}.py`",
            ""
        ])
        
        # Ordenar endpoints por path
        endpoints = sorted(endpoints_by_module[module], key=lambda x: (x['path'], x['method']))
        
        for endpoint in endpoints:
            method = endpoint['method']
            path = endpoint['path']
            function = endpoint['function']
            docstring = endpoint['docstring']
            
            # Código de colores según método
            method_badge = {
                'GET': '🔹',
                'POST': '🟢',
                'PUT': '🟡',
                'PATCH': '🟠',
                'DELETE': '🔴'
            }.get(method, '⚪')
            
            md_lines.extend([
                f"### {method_badge} `{method} {path}`",
                ""
            ])
            
            if docstring:
                md_lines.append(f"{docstring}")
                md_lines.append("")
            
            md_lines.append(f"**Función:** `{function}`")
            md_lines.append("")
            
            # Detectar si requiere autenticación
            if 'current_user' in function or 'Depends(get_current_user)' in str(endpoint):
                md_lines.append("**Autenticación:** ✅ Requerida")
                md_lines.append("")
            
            md_lines.extend(["---", ""])
    
    # Agregar información de la base de datos
    md_lines.extend([
        "## Base de Datos",
        "",
        "**Esquema completo:** Ver [esquemaddbb.md](./esquemaddbb.md)",
        "",
        "### Tablas Principales",
        "",
        "- `profiles` - Perfiles de usuario",
        "- `venues` - Locales/Establecimientos",
        "- `friendships` - Relaciones de amistad",
        "- `groups` - Grupos de usuarios",
        "- `group_members` - Miembros de grupos",
        "- `group_invitations` - Invitaciones a grupos",
        "- `venue_invitations` - Invitaciones a locales",
        "- `gamification_logs` - Historial de puntos",
        "- `badges` - Insignias disponibles",
        "- `user_badges` - Insignias obtenidas por usuarios",
        "- `challenges` - Retos activos",
        "- `user_challenge_progress` - Progreso de retos",
        "",
        "---",
        "",
        "## Autenticación",
        "",
        "**Método:** Bearer Token (JWT)",
        "**Header:** `Authorization: Bearer <token>`",
        "",
        "**Obtención del token:**",
        "- Supabase Auth maneja la autenticación",
        "- El token se valida mediante `get_current_user` dependency",
        "",
        "---",
        "",
        f"**Documentación generada automáticamente** - Total de endpoints: {len(all_endpoints)}",
        ""
    ])
    
    return '\n'.join(md_lines), len(all_endpoints)


if __name__ == '__main__':
    print("🚀 Generando documentación de API...")
    
    try:
        docs, total_endpoints = generate_documentation()
        
        # Guardar en la raíz del proyecto
        output_path = Path(__file__).parent.parent / 'API_ENDPOINTS.md'
        output_path.write_text(docs, encoding='utf-8')
        
        print(f"✅ Documentación generada exitosamente")
        print(f"📍 Ubicación: {output_path}")
        print(f"📊 Total de endpoints: {total_endpoints}")
        print(f"📄 Total de líneas: {len(docs.splitlines())}")
        
    except Exception as e:
        print(f"❌ Error al generar documentación: {e}")
        import traceback
        traceback.print_exc()
