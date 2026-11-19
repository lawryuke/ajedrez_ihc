# Propuesta: análisis compartido sobre los nodos actuales de IAjedrez

Estado: propuesta de diseño. Este documento no implica que las funciones descritas estén implementadas.

## Objetivo

Ampliar los nodos y la vista **Cadena** para que el jugador pueda comprender, corregir y conservar la estructura del análisis de una partida. La propuesta adapta el enfoque de ThinkFlow, presentado en *From Conversation to Human-AI Common Ground: Extracting Cognitive Workflows for Reuse in Sense-making Tasks*, de Chen et al. (2026), especialmente las secciones 4.2 y 4.3.

El análisis compartido explicita objetivos, evidencia, criterios, pasos y resultados. Representa una explicación revisable del trabajo realizado; no se presenta como acceso al razonamiento interno de un modelo.

## Relación con la interfaz actual

Se conserva la organización en lista de jugadas y variantes, tablero y panel de respuestas. La selección de una jugada mantiene sincronizados esos espacios. Las consultas siguen vinculadas a su contexto y se conserva la posibilidad de explorar una variante y regresar.

| Elemento actual | Ampliación propuesta |
| --- | --- |
| Nodo de jugada | Sirve como ancla de la posición y da acceso a sus análisis asociados. |
| Consulta vinculada a una jugada | También identifica el paso del análisis al que se refiere. |
| Vista Cadena | Permite inspeccionar y corregir la estructura del análisis. |
| Variantes en el tablero | Actúan como evidencia de las comparaciones y conclusiones. |
| Regreso al análisis | Recupera la jugada, el paso y la versión del análisis que se estaba revisando. |
| Resumen de errores y Evaluación | Mantienen el acceso a los resultados y permiten abrir su explicación en Cadena. |

Una jugada y una fase de análisis tienen funciones diferentes: una fase puede comparar varias jugadas, y una misma jugada puede tener varios análisis. No se necesita convertir cada movimiento de la partida en un nodo de razonamiento.

## Contenido de un análisis

Cada análisis asociado a una jugada o conjunto de posiciones tendría:

| Campo | Pregunta que responde | Ejemplo |
| --- | --- | --- |
| Objetivo | ¿Qué queremos comprender? | Entender por qué 45.Cc7 pierde el caballo. |
| Entradas y evidencia | ¿Qué estamos examinando? | Posición anterior, jugada real y continuación con …Cxc7. |
| Criterios | ¿Qué vamos a comprobar? | Seguridad del caballo y compensación tras su captura. |
| Actividades | ¿Cómo se realiza la comparación? | Observar amenazas, comprobar la captura y comparar destinos. |
| Resultado | ¿Qué se concluye y con qué respaldo? | Explicación vinculada a la variante comprobada y sus límites. |

La intención del jugador, una hipótesis de la IA y una evaluación calculada deben tener procedencia visible. Confirmar que el sistema entendió la intención del jugador no convierte una conclusión ajedrecística en verdadera.

## Adaptación de los cuatro pasos de Cadena

Se aprovechan los pasos actuales y se amplía su contenido:

1. **Observar la posición:** mostrar la posición de referencia, el objetivo y la intención declarada por el jugador.
2. **Contrastar la jugada:** presentar los criterios y la evidencia de Stockfish, con sus parámetros y límites disponibles.
3. **Comparar alternativas:** recorrer variantes, revisar consecuencias y relacionarlas con los criterios elegidos.
4. **Probar y aprender:** practicar, registrar una conclusión y, si corresponde, guardar el método para otra posición.

El detalle se abre progresivamente dentro del panel actual. La lista de jugadas mantiene su legibilidad y el tablero continúa siendo la referencia visual.

## Interacción propuesta

El ciclo sería **proponer → revisar → corregir → conservar lo acordado**:

1. El sistema presenta una estructura de análisis vinculada a una jugada y a las consultas que la originaron.
2. El jugador puede modificar el objetivo, añadir un criterio o corregir una interpretación, mediante controles o texto.
3. El sistema muestra qué entendió de la corrección y qué partes del análisis necesitan actualizarse.
4. La interpretación confirmada se guarda con su contexto y versión. Las conclusiones pendientes de recalcular quedan señaladas.
5. El jugador puede volver al punto anterior sin perder la consulta ni sus correcciones.

Acciones posibles en el panel: **Corregir objetivo**, **Añadir criterio**, **Confirmar interpretación** y **Ver evidencia**. No es necesario pedir confirmación en cada clic; se utiliza cuando hace falta establecer una interpretación compartida.

### Ejemplo: intención de activar la torre

Ante una explicación de 21.Te2, el jugador indica: «Mi intención era activar la torre».

El sistema incorpora esa intención al análisis y responde con una interpretación visible: «Evaluaremos si Te2 facilita la activación de la torre y qué consecuencias tiene». El jugador puede corregirla o confirmarla. Después se contrastan las variantes pertinentes, conservando separadas la intención declarada, la evaluación del motor y la conclusión explicativa.

Este ejemplo mantiene el criterio documentado en el proyecto: el tiempo consumido no basta para declarar que la jugada fue un error.

## Relaciones entre análisis

Cuando sea necesario conectar fases, se utilizarían relaciones explícitas:

- **Secuencia:** una fase usa el resultado de otra.
- **Exploración de alternativas:** se abren comparaciones paralelas.
- **Síntesis:** se reúnen los resultados de varias comparaciones.
- **Revisión:** nueva evidencia obliga a volver a una fase anterior.

Estas relaciones deben distinguirse de las conexiones que representan movimientos y variantes de ajedrez. Para una primera versión pueden mostrarse dentro de Cadena mediante enlaces y etiquetas; un lienzo adicional es una ampliación posible.

## Persistencia y reutilización

Se propone guardar el análisis con su partida, posiciones, consultas de origen, fuentes, criterios, correcciones, estado y versión. Al cambiar una premisa, los resultados dependientes se marcan como pendientes de revisión para evitar mostrar una conclusión anterior como si ya estuviera actualizada.

La reutilización transfiere el método, por ejemplo «comprobar seguridad de una pieza», a otra posición. La evidencia y las conclusiones se vuelven a calcular para esa posición. Guardar solo el texto de una respuesta no cubre esta función.

## Alcance recomendado para la primera versión

Implementar posteriormente un recorrido completo sobre una sola jugada:

1. Abrir el análisis desde el nodo existente.
2. Ver objetivo, evidencia, criterios y resultado en Cadena.
3. Corregir la intención mediante una consulta vinculada.
4. Ver la interpretación actualizada y confirmar o corregirla.
5. Consultar la variante en el tablero, regresar y recuperar el mismo contexto.
6. Guardar y recuperar el análisis con sus correcciones.

La extracción automática desde conversaciones extensas, las dependencias entre múltiples fases y la reutilización entre partidas quedarían para una etapa posterior. Si la primera demostración utiliza contenido preparado, debe identificarlo como tal.

## Cómo evaluar la propuesta

Comprobar con un jugador si puede identificar qué se analiza, corregir una intención mal interpretada, encontrar la evidencia de una conclusión y volver a su contexto después de explorar una variante. Comprobar también que una corrección guardada reaparece al recuperar el análisis.

Los resultados del paper respaldan su propuesta en tareas de trabajo del conocimiento; su utilidad para aprender ajedrez debe evaluarse en este contexto.

## Referencias

- Chen, X., Manjunatha, V., Wang, X. y Siu, A. (2026). *From Conversation to Human-AI Common Ground: Extracting Cognitive Workflows for Reuse in Sense-making Tasks*. CHI '26. DOI: 10.1145/3772318.3791669. [PDF local](papers/From%20Conversation%20to%20Human-AI%20Common%20Ground.pdf).
- [Investigación a interfaz](INVESTIGACION_A_INTERFAZ.md): decisiones de diseño, trazabilidad y límites de las explicaciones.
- [Continuidad para agentes](CONTINUIDAD_PARA_AGENTES.md): organización de la interfaz, consultas y navegación existentes. Sus notas reflejan distintas etapas del desarrollo y deben contrastarse con el código vigente al implementar.
