🚀 Guía: Cómo generar una nueva APK (Build Local)
Como ya tienes todo el entorno configurado (Java, SDK, google-services.json), las próximas veces será mucho más rápido (aprox. 3-5 minutos).

Pasos a seguir
1. Preparar y Limpiar
Asegúrate de que tus cambios de código estén guardados. Luego, regenera la carpeta nativa para asegurar que todo esté sincronizado.

# En la carpeta del frontend (c:\UrbanVibe\UV APP\urbanvibe-frontend)
npx expo prebuild --platform android --clean

2. Compilar
Entra a la carpeta android y ejecuta el build.

cd android
./gradlew assembleRelease

(Si te da error de Java, recuerda correr: `$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"`).
(Si te da error de **SDK location**, revisa que el archivo `android/local.properties` tenga la ruta correcta a tu SDK).

3. ¡Listo!
Tu nueva APK estará en: android\app\build\outputs\apk\release\app-release.apk

💡 Tips Pro
¿Solo cambiaste código JS/TS?: A veces no necesitas hacer el paso 1 completo, pero hacerlo garantiza que no haya errores viejos.
Versiones: Si vas a publicar una update real, recuerda subir la version y buildNumber en 

app.json
 antes de compilar.