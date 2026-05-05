# Archivos de referencia para la revisión con IA

Coloca aquí los siguientes archivos que mencionaste:

1. **PROMPT.txt** → Contiene las instrucciones/detalle de cómo debe revisar Gemini la tesis.
2. **EsquemaPT.txt** → Contiene la estructura y normas que debe verificar.

## Formato

Estos archivos deben estar en formato **.txt** (texto plano). El backend los lee directamente sin necesidad de procesamiento, lo que hace que el análisis sea mucho más rápido.

## Cómo convertir tus archivos

Si tienes los archivos en `.docx` (Word), simplemente:
1. Ábrelos en Word o cualquier procesador de texto
2. Ve a **Archivo → Guardar como**
3. Selecciona formato **.txt** o **Texto sin formato**
4. Guarda con los nombres exactos: `PROMPT.txt` y `EsquemaPT.txt`

## Nota importante

- Los nombres de archivo deben coincidir exactamente: `PROMPT.txt` y `EsquemaPT.txt`.
- El formato `.txt` es **mucho más rápido** que `.docx` porque no requiere descompresión ni parseo XML.
- Si cambias el contenido, solo reemplaza los archivos y reinicia el servidor; no es necesario modificar código.
