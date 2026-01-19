/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                uv: {
                    base: '#1B1D37',      // Tu fondo principal (Azul Noche)
                    card: '#232959',      // El color de las tarjetas en tu App (Mi Comunidad/Retos)
                    text: '#F2F1F0',      // Tu Blanco hueso (mejor lectura que blanco puro)
                    naranja: '#FA4E35',   // Tu Naranja de marca (Botón Escanear QR)
                    rojo: '#FF2A51',      // Ese rosa/rojo vibrante
                    cyber: '#00E0FF',     // El Cyan eléctrico
                    amarillo: '#FFC000',  // El amarillo mostaza
                    purple: '#6313A1',    // El morado oscuro
                    'purple-light': '#7209B7', // Para degradados
                }
            },
            fontFamily: {
                brand: ['Figtree', 'sans-serif'], // Títulos
                sans: ['Inter', 'sans-serif'],    // Textos
            },
            backgroundImage: {
                // Degradados extraídos de tu imagen para fondos más ricos
                'uv-gradient-purple': 'linear-gradient(135deg, #7209B7 0%, #351B60 100%)',
                'uv-gradient-pink': 'linear-gradient(135deg, #FF00CC 0%, #99007A 100%)',
                'uv-gradient-blue': 'linear-gradient(135deg, #00B5FF 0%, #7D7FFF 100%)',
                'uv-hero-glow': 'radial-gradient(circle at center, rgba(114, 9, 183, 0.25) 0%, rgba(27, 29, 55, 0) 70%)',
            }
        },
    },
    plugins: [],
}
