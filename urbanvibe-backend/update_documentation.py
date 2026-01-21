"""
Script unificado para actualizar toda la documentación del proyecto UrbanVibe.

Ejecuta en orden:
1. generate_api_docs.py - Genera API_ENDPOINTS.md
2. audit_db_usage.py - Genera DB_AUDIT_REPORT.md

Uso:
    python update_documentation.py
"""

import subprocess
import sys
from pathlib import Path


def run_script(script_name: str, description: str) -> bool:
    """Ejecuta un script y retorna True si fue exitoso."""
    print(f"\n{'='*60}")
    print(f"-> {description}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(
            [sys.executable, script_name],
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace',  # Reemplazar caracteres problemáticos
            check=True
        )
        
        # Mostrar output
        if result.stdout:
            print(result.stdout)
        
        print(f"OK {description} - COMPLETADO")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"ERROR en {description}")
        print(f"Codigo de salida: {e.returncode}")
        if e.stdout:
            print("STDOUT:", e.stdout)
        if e.stderr:
            print("STDERR:", e.stderr)
        return False


def main():
    """Función principal."""
    print("ACTUALIZADOR DE DOCUMENTACION - UrbanVibe Backend")
    print("=" * 60)
    
    backend_dir = Path(__file__).parent
    
    # Verificar que los scripts existen
    scripts = [
        ('generate_api_docs.py', 'Generando API_ENDPOINTS.md'),
        ('audit_db_usage.py', 'Generando DB_AUDIT_REPORT.md')
    ]
    
    for script_name, _ in scripts:
        script_path = backend_dir / script_name
        if not script_path.exists():
            print(f"ERROR: No se encontro {script_name}")
            print(f"   Ruta esperada: {script_path}")
            sys.exit(1)
    
    # Ejecutar scripts
    success_count = 0
    for script_name, description in scripts:
        if run_script(script_name, description):
            success_count += 1
    
    # Resumen final
    print(f"\n{'='*60}")
    print(f"RESUMEN FINAL")
    print(f"{'='*60}")
    print(f"Scripts ejecutados: {success_count}/{len(scripts)}")
    
    if success_count == len(scripts):
        print("OK - Toda la documentacion fue actualizada exitosamente!")
        print("\nArchivos generados:")
        print("  - ../API_ENDPOINTS.md")
        print("  - ../DB_AUDIT_REPORT.md")
        return 0
    else:
        print("ADVERTENCIA - Algunos scripts fallaron. Revisa los errores arriba.")
        return 1


if __name__ == '__main__':
    sys.exit(main())
