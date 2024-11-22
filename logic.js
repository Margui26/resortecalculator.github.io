// ENTRADAS PARA LEY DE HOOKE
const $massIn = document.querySelector("#mass");
const $dxIn = document.querySelector("#dl");
// BOTÓN DE LEY DE HOOKE
const $btnHooke = document.querySelector("#btn_calc");

// ENTRADAS PARA CONSTANTE POR GEOMÉTRICA DE RESORTE
const $moduloRigidez = document.getElementById("modRigidez");
const $otroModulo = document.getElementById("valorPersonalizado");
const $diametroAlambre = document.getElementById("diametroAla");
const $diametroEspiral = document.getElementById("diametroEspi");
const $numeroEspiras = document.getElementById("numeroEspi");
// BOTÓN PARA CONSTANTE POR GEOMÉTRICA DE RESORTE
const $btnGeo = document.querySelector("#btn_calc_geo");

const $resulH = document.querySelector("#result_h");
const $resulG = document.querySelector("#result_g");
const GRAVITY = 9.8; // Constante de gravedad (m/s^2)
const scale = 100; // Escala para convertir metros a píxeles

// Variables globales para la animación y fuerzas
let showForces = false;
let showRuler = false; // Controlar si se muestra la regla de elongación
let forceSpring = 0; // Fuerza ejercida por el resorte
let weight = 0; // Peso de la masa
let massValue = 0; // Valor de la masa ingresada
let dxValue = 0; // Deformación usada en la animación (puede estar limitada)
let dxValueF = 0; // Deformación real ingresada por el usuario

// Asignar eventos a los botones
$btnHooke.addEventListener("click", calcHooke);
$btnGeo.addEventListener("click", calcGeo);
const scene = document.getElementById("scene");
const ctx = scene.getContext("2d");

const canvasWidth = scene.width;
const canvasHeight = scene.height;

const springRestPos = 60; // Posición inicial del resorte (y)
let massPosY = springRestPos; // Posición inicial de la masa
const massSize = 80; // Tamaño de la masa

const margin = 20; // Margen inferior
const maxDisplacement = canvasHeight - springRestPos - massSize - margin - 10;

let displacement = 160; // Desplazamiento del resorte (se actualizará)
let stretching = false; // Controlar si el resorte se está estirando
let animationFrame; // Para controlar la animación

// Función para calcular constante usando Ley de Hooke
function calcHooke() {
  const mass = parseFloat($massIn.value) / 1000; // Convertir gramos a kg
  const dx = parseFloat($dxIn.value); // Deformación en metros

  // Validaciones
  if (isNaN(mass) || isNaN(dx) || mass <= 0 || dx <= 0) {
    $resulH.innerHTML =
      "Por favor, ingresa valores válidos para la masa y la deformación.";
    return;
  }

  // Fuerza = masa * gravedad
  const force = mass * GRAVITY;

  // Ley de Hooke: k = F / dx
  const k = force / dx;

  // Almacenar valores para la animación
  massValue = mass;
  weight = force;
  forceSpring = force; // En equilibrio, la fuerza del resorte es igual al peso
  displacement = dx * scale; // Convertir deformación a píxeles para la animación
  dxValueF = dx; // Guardar la deformación real ingresada por el usuario

  // Limitar el desplazamiento si es mayor que el máximo permitido
  if (displacement > maxDisplacement) {
    displacement = maxDisplacement;
    dxValue = displacement / scale; // Ajustar dxValue para la animación
    // Mantener dxValueF como el valor real ingresado por el usuario
    $resulH.innerHTML = `La constante del resorte (Ley de Hooke) es: k = ${k.toFixed(
      2
    )} N/m.<span class="nota"><br>Nota: La deformación ingresada es demasiado grande para ser mostrada completamente en la animación.</span>`;
  } else {
    dxValue = dxValueF; // Usar la deformación real si no se excede el máximo
    // Mostrar resultado
    $resulH.innerHTML = `La constante del resorte (Ley de Hooke) es: k = ${k.toFixed(
      2
    )} N/m.`;
  }

  // Reiniciar posición de la masa y detener animación anterior
  massPosY = springRestPos;
  stretching = true;
  showForces = false; // Reiniciar el indicador de fuerzas
  showRuler = true; // Mostrar la regla de elongación
  cancelAnimationFrame(animationFrame);
  animate();
}

// Función para calcular constante usando fórmula geométrica del resorte
function calcGeo() {
  const G =
    $moduloRigidez.value === "otro"
      ? parseFloat($otroModulo.value) * 1000000000
      : parseFloat($moduloRigidez.value);
  const d = parseFloat($diametroAlambre.value);
  const D = parseFloat($diametroEspiral.value);
  const N = parseFloat($numeroEspiras.value);

  // Validaciones
  if (
    isNaN(G) ||
    isNaN(d) ||
    isNaN(D) ||
    isNaN(N) ||
    G <= 0 ||
    d <= 0 ||
    D <= 0 ||
    N <= 0
  ) {
    $resulG.innerHTML =
      "Por favor, ingresa valores válidos para todos los parámetros geométricos.";
    return;
  }

  // Fórmula geométrica: k = (G * d^4) / (8 * D^3 * N)
  const k = (G * Math.pow(d, 4)) / (8 * Math.pow(D, 3) * N);

  // Mostrar resultado
  $resulG.innerHTML = `La constante del resorte (Fórmula geométrica) es: k = ${k.toFixed(
    2
  )} N/m.`;

  // Reiniciar posición de la masa y detener animación anterior
  massPosY = springRestPos;
  stretching = true;
  showForces = false; // No mostrar fuerzas en este caso
  showRuler = false; // No mostrar la regla de elongación
  // Reiniciar valores de masa y fuerzas para evitar que se muestren
  massValue = 0;
  weight = 0;
  forceSpring = 0;
  dxValueF = 0; // Reiniciar dxValueF
  dxValue = 0; // Reiniciar dxValue

  cancelAnimationFrame(animationFrame);
  animate();
}

// Botón de valor de Módulo Personalizado
$moduloRigidez.addEventListener("change", function () {
  if (this.value === "otro") {
    $otroModulo.style.display = "block";
    $otroModulo.value = ""; // Limpiar el input si se selecciona "Otro"
  } else {
    $otroModulo.style.display = "none";
  }
});

function drawSpringAndMass() {
  ctx.clearRect(0, 0, scene.width, scene.height);
  ctx.strokeStyle = "#000"; // Color del resorte
  ctx.lineWidth = 2;

  // Dibujar el resorte
  ctx.beginPath();
  ctx.moveTo(scene.width / 2, 0); // Fijo arriba
  const coils = 10; // Número de espirales
  const coilHeight = (massPosY - 20) / coils; // Altura de cada espiral
  for (let i = 0; i <= coils; i++) {
    const x = scene.width / 2 + (i % 2 === 0 ? -10 : 10); // Oscilar a los lados
    const y = 20 + i * coilHeight; // Espirales
    ctx.lineTo(x, y);
  }
  ctx.lineTo(scene.width / 2, massPosY); // Llega hasta la masa
  ctx.stroke();

  // Dibujar la masa (cuadrado)
  ctx.fillStyle = "#000";
  ctx.fillRect(scene.width / 2 - massSize / 2, massPosY, massSize, massSize);

  // Mostrar fuerzas y masa si corresponde
  if (showForces) {
    // Dibujar vector de peso (hacia abajo)
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(scene.width / 2, massPosY + massSize);
    ctx.lineTo(scene.width / 2, massPosY + massSize + 40);
    ctx.stroke();
    // Flecha del peso
    ctx.beginPath();
    ctx.moveTo(scene.width / 2 - 5, massPosY + massSize + 35);
    ctx.lineTo(scene.width / 2, massPosY + massSize + 40);
    ctx.lineTo(scene.width / 2 + 5, massPosY + massSize + 35);
    ctx.stroke();

    // Etiqueta del peso
    ctx.fillStyle = "red";
    ctx.font = "12px Arial";
    ctx.fillText(
      `Peso = ${weight.toFixed(2)} N`,
      scene.width / 2 + 10,
      massPosY + massSize + 25
    );

    // Dibujar vector de fuerza del resorte (hacia arriba)
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(scene.width / 2, massPosY);
    ctx.lineTo(scene.width / 2, massPosY - 40);
    ctx.stroke();
    // Flecha de la fuerza del resorte
    ctx.beginPath();
    ctx.moveTo(scene.width / 2 - 5, massPosY - 35);
    ctx.lineTo(scene.width / 2, massPosY - 40);
    ctx.lineTo(scene.width / 2 + 5, massPosY - 35);
    ctx.stroke();

    // Etiqueta de la fuerza del resorte
    ctx.fillStyle = "blue";
    ctx.font = "12px Arial";

    // Primera línea
    ctx.fillText(`Fuerza del`, scene.width / 2 + 10, massPosY - 25);

    // Segunda línea
    ctx.fillText(
      `resorte = ${forceSpring.toFixed(2)} N`,
      scene.width / 2 + 10,
      massPosY - 10 // Ajusta esta posición según sea necesario para alinearlo debajo de la primera línea
    );

    // Mostrar valor de la masa sobre la masa
    ctx.fillStyle = "#fff";
    ctx.font = "14px Arial";
    ctx.fillText(
      `${(massValue * 1000).toFixed(2)} g`,
      scene.width / 2 - massSize / 2 + 10,
      massPosY + massSize / 2 + 5
    );
  }

  // Mostrar regla de elongación si corresponde
  if (showRuler) {
    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;

    // Posición de la regla a la izquierda del resorte
    const x = scene.width / 2 - massSize / 2 - 50;
    const yStart = springRestPos;
    const yEnd = massPosY;

    // Dibujar la línea vertical
    ctx.beginPath();
    ctx.moveTo(x, yStart);
    ctx.lineTo(x, yEnd);
    ctx.stroke();

    // Dibujar flechas en ambos extremos
    // Flecha superior
    ctx.beginPath();
    ctx.moveTo(x - 5, yStart + 5);
    ctx.lineTo(x, yStart);
    ctx.lineTo(x + 5, yStart + 5);
    ctx.stroke();

    // Flecha inferior
    ctx.beginPath();
    ctx.moveTo(x - 5, yEnd - 5);
    ctx.lineTo(x, yEnd);
    ctx.lineTo(x + 5, yEnd - 5);
    ctx.stroke();

    // Etiquetar la elongación
    ctx.fillStyle = "green";
    ctx.font = "12px Arial";
    ctx.fillText(
      `                    Δx = ${dxValueF.toFixed(2)} m`,
      x - 60, // Ajusta esta posición para que la etiqueta se vea bien
      (yStart + yEnd) / 2
    );
  }
}

function animate() {
  if (stretching) {
    const totalFrames = 60;
    const increment = displacement / totalFrames;

    // Simular caída de la masa y estiramiento del resorte
    if (massPosY < springRestPos + displacement) {
      massPosY += increment; // Velocidad de caída
      drawSpringAndMass();
      animationFrame = requestAnimationFrame(animate);
    } else {
      // Asegurar que la masa llegue exactamente a la posición final
      massPosY = springRestPos + displacement;
      drawSpringAndMass();
      // Detener la animación cuando llega a la posición final
      cancelAnimationFrame(animationFrame);
      stretching = false;
      // Mostrar fuerzas y masa solo si es cálculo de Hooke
      if (massValue > 0) {
        showForces = true; // Mostrar fuerzas y masa
        drawSpringAndMass(); // Dibujar nuevamente para mostrar las fuerzas
      }
    }
  }
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", drawSpringAndMass);

//Xd

// Obtener el canvas y su contexto
const canvas = document.getElementById("canvas_lab");
const ctx2 = canvas.getContext("2d");

// Ajustar dimensiones del canvas
canvas.width = 800;
canvas.height = 500;

// Constantes
const GRAVEDAD = 9.8; // m/s^2
const ORIGEN_RESORTE = { x: canvas.width / 2, y: 100 }; // Punto fijo del resorte
let CONSTANTE_RESORTE = 50; // N/m (ajustable por el usuario)
const ESCALA = 100; // píxeles por metro

// Variables
let masas = [];
let masaColgada = null;
let elongacion = 0;

// Variables del deslizador
const SLIDER_X = 520;
const SLIDER_Y = 50;
const SLIDER_WIDTH = 200;
const SLIDER_HEIGHT = 10;
const SLIDER_KNOB_WIDTH = 10;
let sliderKnobX = SLIDER_X; // Posición inicial
let sliderDragging = false;

// Inicializar las masas en el suelo
function initMasas() {
  masas = [
    {
      id: 1,
      masa: 0.1,
      x: 100,
      y: canvas.height - 70,
      ancho: 80,
      alto: 50,
      arrastrando: false,
      inicialX: 100,
      inicialY: canvas.height - 70,
    },
    {
      id: 2,
      masa: 0.2,
      x: 200,
      y: canvas.height - 70,
      ancho: 80,
      alto: 50,
      arrastrando: false,
      inicialX: 200,
      inicialY: canvas.height - 70,
    },
    {
      id: 3,
      masa: 0.5,
      x: 300,
      y: canvas.height - 70,
      ancho: 80,
      alto: 50,
      arrastrando: false,
      inicialX: 300,
      inicialY: canvas.height - 70,
    },
    {
      id: 4,
      masa: 1.0,
      x: 400,
      y: canvas.height - 70,
      ancho: 80,
      alto: 50,
      arrastrando: false,
      inicialX: 400,
      inicialY: canvas.height - 70,
    },
    {
      id: 5,
      masa: 0.3,
      x: 500,
      y: canvas.height - 70,
      ancho: 100,
      alto: 50,
      arrastrando: false,
      inicialX: 500,
      inicialY: canvas.height - 70,
      modificable: true,
    },
  ];
}

initMasas();

// Eventos para arrastrar y soltar
let arrastrando = false;
let offsetX = 0;
let offsetY = 0;

canvas.addEventListener("mousedown", function (e) {
  const posMouse = obtenerPosicionMouse(canvas, e);
  let objetoSeleccionado = null;

  // Verificar si se ha hecho clic en el deslizador
  if (estaSobreKnob(posMouse)) {
    sliderDragging = true;
    offsetX = posMouse.x - sliderKnobX;
    return;
  }

  // Verificar masas en el suelo
  masas.forEach(function (masa) {
    if (estaDentro(posMouse, masa)) {
      objetoSeleccionado = masa;
    }
  });

  // Verificar masa colgada
  if (!objetoSeleccionado && masaColgada && estaDentroMasaColgada(posMouse)) {
    objetoSeleccionado = masaColgada;
  }

  if (objetoSeleccionado) {
    arrastrando = true;
    objetoSeleccionado.arrastrando = true;
    offsetX = posMouse.x - objetoSeleccionado.x;
    offsetY = posMouse.y - objetoSeleccionado.y;
  }
});

canvas.addEventListener("mousemove", function (e) {
  const posMouse = obtenerPosicionMouse(canvas, e);

  if (sliderDragging) {
    sliderKnobX = posMouse.x - offsetX;
    // Asegurar que el knob se mantenga dentro del deslizador
    if (sliderKnobX < SLIDER_X) sliderKnobX = SLIDER_X;
    if (sliderKnobX > SLIDER_X + SLIDER_WIDTH)
      sliderKnobX = SLIDER_X + SLIDER_WIDTH;
    // Actualizar la constante del resorte
    actualizarConstanteResorte();
    dibujar();
  } else if (arrastrando) {
    if (masaColgada && masaColgada.arrastrando) {
      masaColgada.x = posMouse.x - offsetX;
      masaColgada.y = posMouse.y - offsetY;
    } else {
      masas.forEach(function (masa) {
        if (masa.arrastrando) {
          masa.x = posMouse.x - offsetX;
          masa.y = posMouse.y - offsetY;
        }
      });
    }
    dibujar();
  }
});

canvas.addEventListener("mouseup", function (e) {
  if (sliderDragging) {
    sliderDragging = false;
  } else if (arrastrando) {
    if (masaColgada && masaColgada.arrastrando) {
      masaColgada.arrastrando = false;
      if (!estaCercaDelResorte(masaColgada)) {
        // Devolver masa al suelo
        masaColgada.x = masaColgada.inicialX;
        masaColgada.y = masaColgada.inicialY;
        masas.push(masaColgada);
        masaColgada = null;
        elongacion = 0;
      } else {
        masaColgada.x = ORIGEN_RESORTE.x - masaColgada.ancho / 2;
        masaColgada.y = ORIGEN_RESORTE.y + elongacion * ESCALA + 50;
      }
    } else {
      masas.forEach(function (masa) {
        if (masa.arrastrando) {
          masa.arrastrando = false;
          if (estaCercaDelResorte(masa)) {
            if (masaColgada) {
              masaColgada.x = masaColgada.inicialX;
              masaColgada.y = masaColgada.inicialY;
              masas.push(masaColgada);
            }
            masaColgada = masa;
            masas = masas.filter((m) => m.id !== masa.id);
            calcularElongacion();
            masaColgada.x = ORIGEN_RESORTE.x - masaColgada.ancho / 2;
            masaColgada.y = ORIGEN_RESORTE.y + elongacion * ESCALA + 50;
          } else {
            masa.x = masa.inicialX;
            masa.y = masa.inicialY;
          }
        }
      });
    }
    arrastrando = false;
    dibujar();
  }
});

// Funciones auxiliares
function obtenerPosicionMouse(canvas, evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (evt.clientX - rect.left) * (canvas.width / rect.width),
    y: (evt.clientY - rect.top) * (canvas.height / rect.height),
  };
}

function estaDentro(pos, rect) {
  return (
    pos.x > rect.x &&
    pos.x < rect.x + rect.ancho &&
    pos.y > rect.y &&
    pos.y < rect.y + rect.alto
  );
}

function estaDentroMasaColgada(pos) {
  const masa = masaColgada;
  const masaX = masa.x;
  const masaY = masa.y;
  return (
    pos.x > masaX &&
    pos.x < masaX + masa.ancho &&
    pos.y > masaY &&
    pos.y < masaY + masa.alto
  );
}

function estaSobreKnob(pos) {
  return (
    pos.x > sliderKnobX - SLIDER_KNOB_WIDTH / 2 &&
    pos.x < sliderKnobX + SLIDER_KNOB_WIDTH / 2 &&
    pos.y > SLIDER_Y - 10 &&
    pos.y < SLIDER_Y + SLIDER_HEIGHT + 20
  );
}

function estaCercaDelResorte(masa) {
  const dx = masa.x + masa.ancho / 2 - ORIGEN_RESORTE.x;
  const dy = masa.y - ORIGEN_RESORTE.y;
  const distancia = Math.sqrt(dx * dx + dy * dy);
  return distancia < 80;
}

function calcularElongacion() {
  if (masaColgada) {
    const peso = masaColgada.masa * GRAVEDAD;
    elongacion = peso / CONSTANTE_RESORTE;
  }
}

function actualizarConstanteResorte() {
  // Mapear la posición del deslizador a un valor de constante de resorte
  let sliderValue = (sliderKnobX - SLIDER_X) / SLIDER_WIDTH; // entre 0 y 1
  CONSTANTE_RESORTE = 20 + sliderValue * (200 - 20); // De 20 N/m a 200 N/m
  // Recalcular elongación si hay una masa colgada
  calcularElongacion();
}

// Funciones de dibujo
function dibujarResorte() {
  ctx2.strokeStyle = "#8B0000";
  ctx2.lineWidth = 4;
  ctx2.beginPath();
  ctx2.moveTo(ORIGEN_RESORTE.x, ORIGEN_RESORTE.y);

  const elongacionPx = elongacion * ESCALA;
  const longitudInicial = 50;
  const finResorteY = ORIGEN_RESORTE.y + longitudInicial + elongacionPx;

  const numEspirales = 15;
  const anchoEspiral = 20;
  const alturaEspiral = (finResorteY - ORIGEN_RESORTE.y) / numEspirales;

  for (let i = 0; i < numEspirales; i++) {
    const x = ORIGEN_RESORTE.x + (i % 2 === 0 ? -anchoEspiral : anchoEspiral);
    const y = ORIGEN_RESORTE.y + i * alturaEspiral;
    ctx2.lineTo(x, y);
  }
  ctx2.lineTo(ORIGEN_RESORTE.x, finResorteY);
  ctx2.stroke();

  ctx2.strokeStyle = "#000";
  ctx2.lineWidth = 5;
  ctx2.beginPath();
  ctx2.moveTo(ORIGEN_RESORTE.x - 50, ORIGEN_RESORTE.y);
  ctx2.lineTo(ORIGEN_RESORTE.x + 50, ORIGEN_RESORTE.y);
  ctx2.stroke();
}

function dibujarMasas() {
  masas.forEach(function (masa) {
    // Cambiar color si es modificable
    if (masa.modificable) {
      ctx2.fillStyle = "#0000FF"; // Azul para la masa modificable
    } else {
      ctx2.fillStyle = "#555";
    }
    ctx2.fillRect(masa.x, masa.y, masa.ancho, masa.alto);

    ctx2.strokeStyle = "#000";
    ctx2.lineWidth = 2;
    ctx2.beginPath();
    ctx2.arc(masa.x + masa.ancho / 2, masa.y - 10, 10, 0, Math.PI * 2);
    ctx2.stroke();

    ctx2.beginPath();
    ctx2.moveTo(masa.x + masa.ancho / 2, masa.y - 10);
    ctx2.lineTo(masa.x + masa.ancho / 2, masa.y);
    ctx2.stroke();

    ctx2.fillStyle = "#fff";
    ctx2.font = "16px Arial";
    const texto = masa.modificable
      ? `m = ${masa.masa * 1000}g`
      : `${masa.masa * 1000}g`;
    ctx2.fillText(
      texto,
      masa.x + masa.ancho / 2 - ctx2.measureText(texto).width / 2,
      masa.y + masa.alto / 2 + 5
    );
  });
}

function dibujarMasaColgada() {
  if (masaColgada) {
    // Cambiar color si es modificable
    if (masaColgada.modificable) {
      ctx2.fillStyle = "#0000FF"; // Azul para la masa modificable
    } else {
      ctx2.fillStyle = "#555";
    }
    ctx2.fillRect(
      masaColgada.x,
      masaColgada.y,
      masaColgada.ancho,
      masaColgada.alto
    );

    ctx2.strokeStyle = "#000";
    ctx2.lineWidth = 2;
    ctx2.beginPath();
    ctx2.arc(
      masaColgada.x + masaColgada.ancho / 2,
      masaColgada.y - 10,
      10,
      0,
      Math.PI * 2
    );
    ctx2.stroke();

    ctx2.beginPath();
    ctx2.moveTo(masaColgada.x + masaColgada.ancho / 2, masaColgada.y - 10);
    ctx2.lineTo(masaColgada.x + masaColgada.ancho / 2, masaColgada.y);
    ctx2.stroke();

    ctx2.fillStyle = "#fff";
    ctx2.font = "16px Arial";
    const texto = masaColgada.modificable
      ? `m = ${masaColgada.masa * 1000}g`
      : `${masaColgada.masa * 1000}g`;
    ctx2.fillText(
      texto,
      masaColgada.x + masaColgada.ancho / 2 - ctx2.measureText(texto).width / 2,
      masaColgada.y + masaColgada.alto / 2 + 5
    );
  }
}

function dibujarSuelo() {
  ctx2.fillStyle = "#654321";
  ctx2.fillRect(0, canvas.height - 20, canvas.width, 20);
}

function dibujarElongacion() {
  if (masaColgada) {
    ctx2.strokeStyle = "green";
    ctx2.lineWidth = 2;
    const x = ORIGEN_RESORTE.x + 60;
    const yInicio = ORIGEN_RESORTE.y + 50;
    const yFin =
      ORIGEN_RESORTE.y + elongacion * ESCALA + 50 + masaColgada.alto / 2;

    ctx2.beginPath();
    ctx2.moveTo(x, yInicio);
    ctx2.lineTo(x, yFin);
    ctx2.stroke();

    ctx2.beginPath();
    ctx2.moveTo(x - 5, yInicio + 5);
    ctx2.lineTo(x, yInicio);
    ctx2.lineTo(x + 5, yInicio + 5);
    ctx2.stroke();

    ctx2.beginPath();
    ctx2.moveTo(x - 5, yFin - 5);
    ctx2.lineTo(x, yFin);
    ctx2.lineTo(x + 5, yFin - 5);
    ctx2.stroke();

    ctx2.fillStyle = "green";
    ctx2.font = "14px Arial";
    ctx2.fillText(
      `Δx = ${elongacion.toFixed(3)} m`,
      x + 10,
      (yInicio + yFin) / 2
    );
  }
}

function dibujarSlider() {
  // Dibujar etiqueta del deslizador
  ctx2.fillStyle = "#000";
  ctx2.font = "16px Arial";
  ctx2.fillText("Constante del resorte [N/m]", SLIDER_X, SLIDER_Y - 10);

  // Dibujar la barra del deslizador
  ctx2.fillStyle = "#ccc";
  ctx2.fillRect(SLIDER_X, SLIDER_Y, SLIDER_WIDTH, SLIDER_HEIGHT);

  // Dibujar el knob del deslizador
  ctx2.fillStyle = "#888";
  ctx2.fillRect(
    sliderKnobX - SLIDER_KNOB_WIDTH / 2,
    SLIDER_Y - 5,
    SLIDER_KNOB_WIDTH,
    SLIDER_HEIGHT + 10
  );

  // Dibujar marcas y valores
  const numMarcas = 9; // Ahora tenemos 9 marcas para 10 valores (de 20 en 20)
  for (let i = 0; i <= numMarcas; i++) {
    const x = SLIDER_X + (i * SLIDER_WIDTH) / numMarcas;
    ctx2.strokeStyle = "#000";
    ctx2.lineWidth = 1;
    ctx2.beginPath();
    ctx2.moveTo(x, SLIDER_Y + SLIDER_HEIGHT);
    ctx2.lineTo(x, SLIDER_Y + SLIDER_HEIGHT + 10);
    ctx2.stroke();

    // Etiquetas de los valores (de 20 N/m a 200 N/m)
    const etiqueta = 20 + i * 20; // Incrementos de 20 N/m
    ctx2.fillStyle = "#000";
    ctx2.font = "12px Arial";
    ctx2.fillText(
      etiqueta,
      x - ctx2.measureText(etiqueta).width / 2,
      SLIDER_Y + SLIDER_HEIGHT + 25
    );
  }

  // Flechas para indicar dirección
  ctx2.fillStyle = "#000";
  ctx2.beginPath();
  // Flecha izquierda
  ctx2.moveTo(SLIDER_X - 15, SLIDER_Y + SLIDER_HEIGHT / 2);
  ctx2.lineTo(SLIDER_X - 5, SLIDER_Y + SLIDER_HEIGHT / 2 - 5);
  ctx2.lineTo(SLIDER_X - 5, SLIDER_Y + SLIDER_HEIGHT / 2 + 5);
  ctx2.fill();
  ctx2.fillText("Menor k", SLIDER_X - 60, SLIDER_Y + SLIDER_HEIGHT / 2 + 5);

  // Flecha derecha
  ctx2.beginPath();
  ctx2.moveTo(SLIDER_X + SLIDER_WIDTH + 15, SLIDER_Y + SLIDER_HEIGHT / 2);
  ctx2.lineTo(SLIDER_X + SLIDER_WIDTH + 5, SLIDER_Y + SLIDER_HEIGHT / 2 - 5);
  ctx2.lineTo(SLIDER_X + SLIDER_WIDTH + 5, SLIDER_Y + SLIDER_HEIGHT / 2 + 5);
  ctx2.fill();
  ctx2.fillText(
    "Mayor k",
    SLIDER_X + SLIDER_WIDTH + 20,
    SLIDER_Y + SLIDER_HEIGHT / 2 + 5
  );
}

function dibujarRecomendacion() {
  ctx2.fillStyle = "#000";
  ctx2.font = "14px Arial";
  ctx2.fillText("Doble clic en la masa azul para modificar su valor", 10, 20);
}

function dibujar() {
  ctx2.clearRect(0, 0, canvas.width, canvas.height);
  dibujarResorte();
  dibujarMasaColgada();
  dibujarMasas();
  dibujarSuelo();
  dibujarElongacion();
  dibujarSlider();
  dibujarRecomendacion();
}

dibujar();

// Agregar funcionalidad para modificar la masa personalizable
canvas.addEventListener("dblclick", function (e) {
  const posMouse = obtenerPosicionMouse(canvas, e);
  masas.forEach(function (masa) {
    if (masa.modificable && estaDentro(posMouse, masa)) {
      const nuevaMasa = prompt(
        "Ingrese el valor de la masa en gramos:",
        masa.masa * 1000
      );
      if (nuevaMasa !== null) {
        const valorMasa = parseFloat(nuevaMasa);
        if (!isNaN(valorMasa) && valorMasa > 0) {
          masa.masa = valorMasa / 1000;
          // Recalcular elongación si es la masa colgada
          if (masaColgada && masaColgada.id === masa.id) {
            calcularElongacion();
            masaColgada.y = ORIGEN_RESORTE.y + elongacion * ESCALA + 50;
          }
          dibujar();
        } else {
          alert("Por favor, ingrese un valor válido.");
        }
      }
    }
  });
});
