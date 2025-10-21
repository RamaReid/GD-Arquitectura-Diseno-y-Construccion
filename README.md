# Arquitectura Diseño y Construcción

Sitio estático que presenta los servicios, proyectos y datos de contacto del estudio ADC.

## Estructura
- `index.html`: página de inicio con servicios destacados.
- `projects.html`: listado de proyectos y mapa interactivo con ubicaciones.
- `projects/`: memorias descriptivas individuales de los proyectos realizados.
- `about.html`: información del estudio y su equipo.
- `contact.html`: formulario de contacto y datos del estudio.
- `assets/`: estilos, scripts y recursos gráficos compartidos.

## Uso
Podés previsualizar el sitio de dos maneras:

1. **Abrir directamente los archivos HTML:** hacé doble clic en `index.html` para cargar la home en tu navegador. El resto de las secciones se navegan desde el encabezado.
2. **Servirlo en local:** desde la carpeta del proyecto ejecutá un servidor estático, por ejemplo con Python:

   ```bash
   python3 -m http.server 8000
   ```

   Luego abrí `http://localhost:8000/index.html`. Esto garantiza que el mapa interactivo y los recursos remotos se carguen sin restricciones del navegador.

En ambos casos necesitás conexión a internet para obtener fuentes de Google, imágenes de Unsplash, Leaflet y Google Maps.
