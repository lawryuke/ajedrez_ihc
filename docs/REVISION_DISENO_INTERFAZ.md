# Aplicación de las guías de Johnson en IAjedrez

Esta revisión contrasta la pantalla de análisis de la partida de Roni con el resumen de los capítulos 1–8 de *Designing with the Mind in Mind*, de Jeff Johnson (2010). La numeración corresponde a la [guía del curso](guia.pdf). Se revisó la interfaz en escritorio, con Stockfish y Ollama activos.

## De una imprecisión a una variante

Al encontrar **2. Cc3 · Imprecisión** en el árbol, el jugador puede reconocer la misma etiqueta ámbar en la tabla de errores. Al señalar la notación, ve el caballo moverse hacia c3. Puede seleccionar la jugada, pulsar **¿Qué pasaría si…?** y probar otra decisión desde la posición anterior. Stockfish evalúa el intento y **Guardar variante** añade una rama bajo la jugada original. En este recorrido, la persona puede comparar dos decisiones sin memorizar ni reconstruir el tablero.

## Cómo se aplica la guía

| Guías del resumen | Decisión observable | Efecto en la tarea |
| --- | --- | --- |
| 1.1–1.3 · Interpretación, consistencia y objetivos | En escritorio, el árbol, el tablero y el análisis mantienen su ubicación al cambiar de pestaña. En Nodo se puede escribir el objetivo de estudio. | El jugador aprende dónde mirar y puede dirigir la explicación hacia una duda concreta, como la amenaza que pasó por alto. |
| 2.1–2.3 · Proximidad, semejanza y continuidad | Una línea vertical conecta las jugadas. Las variantes aparecen con sangría, junto a su jugada de origen y con la etiqueta «Variante». | La disposición ayuda a identificar el punto en el que una alternativa se aparta de la partida. |
| 3.1, 3.3 y 3.4 · Estructura y prioridad | Errores es la vista inicial. La tabla agrupa jugada, evaluación y alternativa en cada fila. En Cadena aparece primero la comparación de Stockfish. | Se puede localizar qué decisión merece atención antes de leer su explicación. |
| 4.3, 4.4, 5.1 y 5.3 · Color y ubicación de señales | Las palabras «Imprecisión» y «Error» aparecen en ámbar y rojo, respectivamente, tanto en el árbol como en la tabla. La flecha indica la dirección del movimiento y tiene una leyenda bajo el tablero. | El color ayuda a encontrar incidencias y el texto permite interpretar la gravedad incluso si cuesta distinguir los tonos. |
| 6.3, 6.4 y 6.6 · Lectura y detalle a pedido | Cadena organiza la respuesta del tutor con títulos. «Ver variantes del motor» despliega la secuencia técnica. Señalar una referencia reconocida en el texto muestra la jugada o resalta la casilla en el tablero. | El jugador puede seguir una explicación breve y abrir la línea de Stockfish cuando quiera comprobarla. |
| 7.2–7.4 · Memoria y estado visible | El árbol marca la selección, el tablero identifica lo que muestra y la consulta indica a qué jugada queda vinculada. Al retirar el cursor de una referencia, la vista previa devuelve el tablero a la selección original. | Se puede explorar la explicación sin perder el punto de la partida en el que surgió la pregunta. |
| 8.3–8.6 · Descubrimiento y retroalimentación | «¿Qué pasaría si…?» aparece al lado de la selección. Tras elegir una jugada legal, Aprende presenta su evaluación y permite guardar la rama en el árbol. | El jugador descubre qué puede hacer a continuación y ve el resultado en el lugar donde comenzó la exploración. |

## Aspectos que conviene mejorar

1. **Distinguir el objetivo de estudio de una rama** (1.1 y 8.3). «Nodo» puede referirse al elemento del árbol o a la pestaña que orienta al tutor. «Objetivo de análisis» describiría mejor la pestaña. «Variante» seguiría identificando la jugada alternativa.
2. **Hacer coincidir la leyenda con las filas** (4.4 y 5.2). La leyenda del árbol utiliza un triángulo y una cruz. Las filas indican la gravedad mediante texto y color. Repetir esos símbolos en las etiquetas permitiría usar la leyenda como referencia directa.
3. **Facilitar la comparación y la vista previa** (3.1 y 6.3). En la ventana de escritorio revisada apareció desplazamiento horizontal en la tabla de tres columnas. Conviene ajustar sus anchos para mantener visibles los tres valores de una decisión. Ofrecer la vista previa mediante foco de teclado o toque ampliaría el acceso al mismo detalle.
4. **Aclarar la duración del guardado** (7.2, 8.5 y 8.6). La rama aparece de inmediato, pero desaparece al recargar. «Guardar variante» puede crear una expectativa de permanencia. Se podría conservar entre sesiones o indicar su duración junto al botón.

Esta es una inspección de la interfaz. Para comprobar la guía 1.1 con usuarios, una tarea concreta sería pedirles que encuentren una imprecisión, prueben una alternativa y vuelvan a abrirla. Observar dónde buscan la acción y qué esperan que ocurra al recargar permitiría evaluar tanto los nombres como el comportamiento del guardado.
