/** @type {import('tailwindcss').Config} */
module.exports = {
  // Dónde Tailwind/NativeWind debe buscar clases para compilarlas.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",  // todas las pantallas/rutas de Expo Router
    "./src/**/*.{js,jsx,ts,tsx}",  // hooks, componentes y utilidades internas
  ],

  // Preset de NativeWind: hace que las clases funcionen en React Native.
  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      colors: {
        // 1. FONDO GLOBAL
        // bg-background → “La Noche UV” (#1B1D37)
        // Ej: <View className="bg-background" />
        // Este es el color Azul Oscuro - #1B1D37 principal
        background: "hsl(var(--la-noche-uv) / <alpha-value>)",

        // 2. SUPERFICIES (LO QUE FLOTA SOBRE EL FONDO)
        surface: {
          // bg-surface → tarjetas y contenedores principales (#232959)
          // Este es el color Azul Oscuro - #232959 
          DEFAULT: "hsl(var(--surface-card-uv) / <alpha-value>)",

          // bg-surface-deep → barras, headers, fondos secundarios (#252A4A)
          // Este es el color Azul Oscuro - #252A4A 
          deep: "hsl(var(--surface-deep-uv) / <alpha-value>)",

          // bg-surface-active → estados presionados / seleccionados (#083D77)
          // Este es el color Azul Oscuro - #083D77 
          active: "hsl(var(--surface-active-uv) / <alpha-value>)",
        },

        // 3. TEXTO
        // Siempre que veas "foreground" piensa en "texto sobre algo oscuro"
        foreground: {
          // text-foreground → texto principal (#F2F1F0)
          // Este es el color Azul Oscuro - #F2F1F0 
          DEFAULT: "hsl(var(--texto-brillante-uv) / <alpha-value>)",

          // text-foreground-muted → subtítulos y textos secundarios4
          // Este es el color Azul Oscuro - #F2F1F0 
          muted: "hsl(var(--texto-humo-uv) / <alpha-value>)",

          // text-foreground-inverted → texto oscuro sobre fondos claros
          
          inverted: "hsl(var(--texto-invertido-uv) / <alpha-value>)",
        },

        // 4. BRANDING (COLORES DE MARCA)
        primary: {
          // bg-primary / text-primary → Naranja AventuraUV ( #FA4E35 )
          DEFAULT: "hsl(var(--aventura-uv) / <alpha-value>)",

          // text-primary-foreground → texto sobre un botón naranja
          // Úsalo siempre en CTAs con bg-primary
          foreground: "hsl(var(--aventura-fg-uv) / <alpha-value>)",
        },
        secondary: {
          // bg-secondary / text-secondary → Morado MisticaUV ( #6313A1)
          // Este es el color morado - #6313A1 sexto
          DEFAULT: "hsl(var(--mistica-uv) / <alpha-value>)",
        },

        // 5. ACENTOS NEÓN
        // Úsalos con moderación (detalles, iconos, tags)
        accent: {
          // text-accent-cyber / bg-accent-cyber → Cyan ( #00E0FF)
          cyber: "hsl(var(--cyber-uv) / <alpha-value>)",

          // text-accent-turquesa / bg-accent-turquesa → Turquesa ( #00F5D4)
          turquesa: "hsl(var(--turquesa-uv) / <alpha-value>)",

          // text-accent-fucsia / bg-accent-fucsia → Magenta ( #FF00CC)
          fucsia: "hsl(var(--fucsia-uv) / <alpha-value>)",
        },

        // 6. ESTADOS DEL SISTEMA
        // bg-success / text-success → estados OK, validaciones, etc.
        success: "hsl(var(--bio-neon-uv) / <alpha-value>)",

        // bg-warning / text-warning → advertencias, estrellas, rating
        // Regla de oro: NUNCA texto blanco encima.
        warning: "hsl(var(--estrella-uv) / <alpha-value>)",

        // 6.b ERRORES & ESTADOS INERTES
        // text-destructive / bg-destructive / border-destructive → errores críticos
        destructive: "hsl(var(--error-uv) / <alpha-value>)",

        // bg-muted → botones deshabilitados, fondos apagados
        muted: "hsl(var(--disabled-uv) / <alpha-value>)",
      },

      // 7. DEGRADADOS MAESTROS
      // Para fondos hero, botones especiales, etc.
      backgroundImage: {
        // bg-gradient-mystery → violeta profundo
        "gradient-mystery": "linear-gradient(to right, #7209B7, #351B60)",

        // bg-gradient-heat → fucsia + magenta (más agresivo)
        "gradient-heat": "linear-gradient(to right, #FF00CC, #99007A)",

        // bg-gradient-ice → azul eléctrico suave
        "gradient-ice": "linear-gradient(to right, #00B5FF, #7D7FFF)",
      },

      // 8. TIPOGRAFÍA (MAPPINGS PARA TAILWIND)
      fontFamily: {
        // font-brand → títulos y marca “urbanVibe”
        brand: ["Lexend_900Black", "system-ui", "sans-serif"],

        // font-body → texto general
        body: ["Inter_400Regular", "system-ui", "sans-serif"],

        // font-body-semibold → texto intermedio (subtítulos importantes)
        "body-semibold": ["Inter_600SemiBold", "system-ui", "sans-serif"],

        // font-body-bold → enfatizar partes clave, badges, etc.
        "body-bold": ["Inter_800ExtraBold", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
