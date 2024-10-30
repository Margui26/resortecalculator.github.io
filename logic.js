// ENTRADAS PARA LEY DE HOOKE
const $massIn = document.querySelector("#mass");
const $dxIn = document.querySelector("#dl");
// BOTON DE LEY DE HOOKE
const $btnHooke = document.querySelector("#btn_calc");

// ENTRADAS PARA Constante por geometrica de Resorte
const $moduloRigidez = document.getElementById("modRigidez");
const $otroModulo = document.getElementById("valorPersonalizado");
const $diametroAlambre = document.getElementById("diametroAla");
const $diametroEspiral = document.getElementById("diametroEspi");
const $numeroEspiras = document.getElementById("numeroEspi");
// BOTON PARA Constante por geometrica de Resorte
const $btnGeo = document.querySelector("#btn_calc_geo");

const $resOn = document.querySelector("#result");
const GRAVITY = 9.8; // Constante de gravedad (m/s^2)

// Función para calcular constante usando Ley de Hooke
function calcHooke() {
  const mass = parseFloat($massIn.value) / 1000;
  const dx = parseFloat($dxIn.value);

  // Validaciones
  if (isNaN(mass) || isNaN(dx) || mass <= 0 || dx <= 0) {
    $resOn.innerHTML =
      "Por favor, ingresa valores válidos para la masa y la deformación.";
    return;
  }

  // Fuerza = masa * gravedad
  const force = mass * GRAVITY;

  // Ley de Hooke: k = F / dx
  const k = force / dx;

  // Mostrar resultado
  $resOn.innerHTML = `La constante del resorte (Ley de Hooke) es: k = ${k.toFixed(
    2
  )} N/m.`;

  // Desplazarse automáticamente al resultado
  $resOn.scrollIntoView({ behavior: "smooth" });

  // Reiniciar posición de la masa y detener animación anterior
  massPosY = springRestPos;
  stretching = true;
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
    $resOn.innerHTML =
      "Por favor, ingresa valores válidos para todos los parámetros geométricos.";
    return;
  }

  // Fórmula geométrica: k = (G * d^4) / (8 * D^3 * N)
  const k = (G * Math.pow(d, 4)) / (8 * Math.pow(D, 3) * N);

  // Mostrar resultado
  $resOn.innerHTML = `La constante del resorte (Fórmula geométrica) es: k = ${k.toFixed(
    2
  )} N/m.`;

  // Desplazarse automáticamente al resultado
  $resOn.scrollIntoView({ behavior: "smooth" });

  // Reiniciar posición de la masa y detener animación anterior
  massPosY = springRestPos;
  stretching = true;
  cancelAnimationFrame(animationFrame);
  animate();
}

// Asignar eventos a los botones
$btnHooke.addEventListener("click", calcHooke);
$btnGeo.addEventListener("click", calcGeo);
const scene = document.getElementById("scene");
const ctx = scene.getContext("2d");

const springRestPos = 60; // Posición inicial del resorte (y)
let massPosY = springRestPos; // Posición inicial de la masa
const massSize = 80; // Tamaño de la masa

const duration = 1000; // Duración en milisegundos
let displacement = 160; // Desplazamiento del resorte
let stretching = false; // Controlar si el resorte se está estirando
let animationFrame; // Para controlar la animación

// Boton de valor de Modulo Personalizado
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
}

function animate() {
  if (stretching) {
    // Simular caída de la masa y estiramiento del resorte
    if (massPosY < springRestPos + displacement) {
      massPosY += 2; // Velocidad de caída
      drawSpringAndMass();
      animationFrame = requestAnimationFrame(animate);
    } else {
      // Detener la animación cuando llega a la posición final
      cancelAnimationFrame(animationFrame);
      stretching = false;
    }
  }
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", drawSpringAndMass);
