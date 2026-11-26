# IAjedrez v2 — rediseño con las guías de Johnson

Pareja: **Luis Ccalluchi** y **Rimsky Miramira**. Tarea 1 de la clase del 17 de noviembre de 2026.

Base: la interfaz del grupo, con los aportes de los cuatro integrantes (`IAjedrez_prototipo_interactivo.html` del 5 de noviembre). No se hizo una interfaz nueva. Se revisó con las guías de Johnson (cap. 1-8) y se rediseñó lo que no las cumplía.

Las guías verificadas, con su cita y su página, están en `../../guias_johnson_verificadas.md`. Los números (1.1, 7.2…) remiten a ese archivo.

Datos simulados: no hay Stockfish ni IA. La profesora indicó que se puede simular.

## Aportes que se conservan

| Integrante | Aporte | En la v2 |
|---|---|---|
| Luis | Árbol de decisiones: cada jugada es una rama, se pregunta desde una rama, la IA pide aclarar el plan y se ve en qué se basa la recomendación (Anexo D, Pang et al.). Nodo de análisis de `PROPUESTA_THINKFLOW.md` (Chen et al. 2026). | **Ampliado:** ramas para comparar y vista **Nodo** |
| Rimsky | "Tablero que explica": jugadas con flechas, sin depender de la notación. Sale de su entrevista a Rony (N1). | **Nuevo:** flechas en el tablero |
| Hellen | Cadena de análisis en 4 pasos (PromptChainer). | Se conserva (pestaña Cadena) |
| Mauricio | Módulos por prioridad: primero los errores, lo demás a un clic. Motor para no alucinar. | Se conserva: Errores primero; Consejos y Referencias en "Más" |

## Cambios y guía que los justifica

| # | Antes (5-nov) | Ahora (v2) | Guías | Aporte |
|---|---|---|---|---|
| 1 | La jugada solo se marcaba coloreando dos casillas. | **Flechas** en el tablero: jugada de la partida (azul oscuro, continua), alternativa (verde claro, discontinua), idea del rival (gris medio, punteada) y tu jugada para comparar (gris claro, fina). Una leyenda muestra solo las flechas que están en pantalla. | 4.1 brillos distintos, de modo que se distinguen en escala de grises (comprobado con las capturas); 4.4 no depender solo del color (cada flecha tiene color **y** trazo distintos); 1.1 evitar la ambigüedad (leyenda); 6.4 menos lectura: se ve en lugar de leer notación | Rimsky |
| 2 | Bajo 12. h3, "Variantes para explorar" era una lista. | **Ramas para comparar** con etiquetas "Jugaste" y "Rama". La rama guardada muestra ✓. | 2.1 proximidad (las ramas, debajo de su jugada); 2.2 semejanza (todas las ramas con la misma forma); 8.2 mostrar qué ya se hizo | Luis |
| 3 | Al pulsar una rama solo cambiaba el tablero. | Al pulsar una rama se abre su **Nodo de análisis**, con 5 campos: Objetivo, Tu plan, Criterios, Evidencia y Resultado. | 7.1 memoria de 3-5 elementos (máximo 5 campos); 3.3 jerarquía visual (cada campo con su etiqueta); 1.3 entender los objetivos | Luis |
| 4 | La IA respondía sin saber qué buscaba el jugador. | La IA **pregunta el plan** ("¿Qué buscabas con 12. h3?") y responde "Entendí: querías…". La intención declarada queda separada del resultado. | 1.3 entender los objetivos; 7.2 el sistema recuerda el plan, no el usuario | Luis (Pang: la IA pide aclarar) |
| 5 | No se podía corregir a la IA. | **Corregir objetivo**, **Añadir criterio**, quitar criterio y **Confirmar y guardar**. El estado se muestra con símbolo y texto: ◇ Propuesta de la IA → ⟳ Cambiaste algo → ✓ Guardado. | 8.5 retroalimentación del progreso; 8.2 qué ya se hizo; 4.4 símbolo además del color | Luis (ThinkFlow: proponer → revisar → corregir → conservar) |
| 6 | Toda la evidencia aparecía como texto. | **Evidencia a pedido:** "◎ Ver en el tablero" dibuja la flecha de la idea del rival. | 6.6 resumen primero y detalle a pedido; 6.4 minimizar la prosa | Luis + Rimsky |
| 7 | Las otras vistas estaban ocultas en el menú "Otras respuestas". | **Pestañas visibles**: Errores, Nodo, Cadena y Aprende. Consejos y Referencias quedan en "Más". | 8.3 rastro de información fuerte; 8.4 mostrar el camino desde la primera pantalla; 3.4 lo importante primero | Mauricio (prioridad) |
| 8 | Tabla de errores con 5 columnas, 3 de ellas de prosa. | **3 columnas** (Jugada, Tipo, Mejor jugada). La explicación aparece solo para la fila elegida. | 3.1 información breve y estructurada; 6.4 no presentar bloques de texto; 6.6 detalle a pedido | Mauricio |
| 9 | Errores marcados solo con un punto de color. | **⚠ Imprecisión** y **✖ Error**, en el árbol y en la tabla. El rojo solo marca errores. | 4.4 no depender solo del color; 5.2 marcar el error con un símbolo; 5.3 reservar el rojo para errores | — |
| 10 | Textos largos en las tareas y en el pie de la Cadena. | Textos de una línea. | 6.5 instrucciones con el mínimo texto; 3.1 | — |

**Lo que ya cumplía y se mantiene:** la Cadena muestra los pasos hechos con ✓ y deja los 4 pasos visibles (8.2, 7.5). La consulta muestra la jugada a la que está vinculada (7.4). El modo Aprende avisa que el tablero es interactivo (7.3). La duda secundaria se abre sobre el análisis y permite volver sin perderlo (2.5, 8.5).

## Las tres tareas de la pareja

| Tarea | Recorrido en la v2 |
|---|---|
| **1. Comparar jugadas** | Errores → "Comparar jugadas", o pulsar la rama 12. d4 en el árbol. El tablero muestra 12. d4 (verde) y tu 12. h3 (gris) a la vez. "Comparar con" pasa a 12. Ae3. |
| **2. Aclarar mi plan** | Errores → "Aclarar mi plan". Elegir qué buscabas, añadir o quitar un criterio, ver la evidencia en el tablero y confirmar. Si después cambias algo, el nodo vuelve a quedar pendiente. |
| **3. Probar en el tablero** | Pestaña Aprende: mover d3 → d4 o h2 → h3. La flecha muestra la jugada probada y, si se pide, la respuesta …d5. |

## Cómo verlo

```powershell
cd tarea-19-noviembre\iajedrez_v2
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python -m uvicorn app:app --host 127.0.0.1 --port 8766
```

Abrir http://127.0.0.1:8766/prototype. El archivo también se abre directo en el navegador: no necesita el servidor.

## Límites

- El contenido de ajedrez es de ejemplo. No se evaluó con un motor.
- Faltan en el repositorio `static/review.js`, `static/chat-input.js`, `static/roni-example.json` y `data/history/` (versión con Stockfish de Mauricio). La v2 parte del prototipo del 5 de noviembre.
- El análisis jerárquico de las 3 tareas (3 niveles como mínimo) y la evaluación con usuarios son el paso siguiente.
