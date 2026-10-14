"use strict";

const datos = window.CONFIGURACION_BODA;
const fechaBoda = new Date(datos.fecha);

for (const [selector, valor] of Object.entries({
  "[data-novia]": datos.novia,
  "[data-novio]": datos.novio,
  "[data-fecha]": datos.fechaTexto,
  "[data-lugar]": datos.lugar,
  "[data-ciudad]": datos.ciudad
})) {
  document.querySelectorAll(selector).forEach(elemento => {
    elemento.textContent = valor;
  });
}

document.title = `${datos.novia} & ${datos.novio} · Nuestra boda`;
document.getElementById("mapa").href = datos.mapa;
document.getElementById("abrir").addEventListener("click", () => {
  document.getElementById("abrir").disabled = true;
  window.scrollTo(0, 0);
  document.getElementById("sobre").classList.add("abierto");
  iniciarPetalos();
  document.body.classList.remove("invitacion-cerrada");
  document.querySelector(".scroll").focus({ preventScroll: true });
});

const observador = new IntersectionObserver(entradas => {
  entradas.forEach(entrada => {
    if (entrada.isIntersecting) {
      entrada.target.classList.add("visible");
      observador.unobserve(entrada.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".revelar").forEach(elemento => observador.observe(elemento));

function actualizarCuenta() {
  const segundos = Math.max(0, Math.floor((fechaBoda - Date.now()) / 1000));
  const valores = {
    dias: Math.floor(segundos / 86400),
    horas: Math.floor(segundos / 3600) % 24,
    minutos: Math.floor(segundos / 60) % 60,
    segundos: segundos % 60
  };
  for (const [id, valor] of Object.entries(valores)) {
    document.getElementById(id).textContent = String(valor).padStart(2, "0");
  }
}
actualizarCuenta();
setInterval(actualizarCuenta, 1000);

function fechaCalendario(fecha) {
  return fecha.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}
// Google Calendar muestra el evento preparado; el invitado confirma con Guardar.
const finBoda = new Date(fechaBoda.getTime() + 8 * 3600000);
const parametrosCalendario = new URLSearchParams({
  action: "TEMPLATE",
  text: `Boda de ${datos.novia} y ${datos.novio}`,
  dates: `${fechaCalendario(fechaBoda)}/${fechaCalendario(finBoda)}`,
  location: `${datos.lugar}, ${datos.ciudad}`,
  details: "¡Nos encantará celebrar contigo! Fecha de ejemplo, pendiente de confirmar."
});
document.getElementById("calendario").href =
  `https://calendar.google.com/calendar/render?${parametrosCalendario}`;

document.getElementById("formulario").addEventListener("submit", evento => {
  evento.preventDefault();
  const campoNinos = document.getElementById("ninos");
  const ninos = Number(campoNinos.value);
  if (campoNinos.value === "" || !Number.isInteger(ninos) || ninos < 0 || ninos > 5) {
    campoNinos.setCustomValidity("El número de niños debe ser un entero entre 0 y 5.");
    campoNinos.reportValidity();
    return;
  }
  campoNinos.setCustomValidity("");
  const formulario = new FormData(evento.currentTarget);
  const mensaje = [
    `Invitación de ${datos.novia} y ${datos.novio}`,
    `Nombre: ${formulario.get("nombre")}`,
    `Asistencia: ${formulario.get("asiste")}`,
    `Acompañantes: ${formulario.get("acompanantes")}`,
    `Niños: ${formulario.get("ninos")}`,
    `Mensaje: ${formulario.get("mensaje") || "—"}`
  ].join("\n");
  const estado = document.getElementById("estado");
  if (!datos.whatsapp) {
    estado.textContent = "Modo de ejemplo: tu respuesta no se ha enviado. Falta configurar el WhatsApp de los novios.";
    return;
  }
  const numero = datos.whatsapp.replace(/\D/g, "");
  window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, "_blank", "noopener");
  estado.textContent = "Tu respuesta está preparada. Pulsa Enviar en WhatsApp para completar la confirmación.";
});

// Fotografías: los espacios de ejemplo desaparecen al cargar una imagen real.
const fotos = datos.fotos || {};
for (const [id, ruta] of Object.entries({
  "foto-portada": fotos.portada,
  "foto-recuerdo-1": fotos.recuerdo1,
  "foto-recuerdo-2": fotos.recuerdo2
})) {
  if (!ruta) continue;
  const imagen = document.getElementById(id);
  imagen.addEventListener("load", () => {
    imagen.hidden = false;
    imagen.parentElement.classList.remove("foto-pendiente");
    const marcador = imagen.parentElement.querySelector(".foto-placeholder");
    if (marcador) marcador.hidden = true;
  });
  imagen.src = ruta;
}

// Una caída breve de pétalos al abrir; sin bloquear enlaces ni formularios.
function iniciarPetalos() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const capa = document.getElementById("petalos");
  for (let i = 0; i < 32; i++) {
    const petalo = document.createElement("span");
    petalo.className = "petalo";
    petalo.style.setProperty("--x", `${Math.random() * 100}vw`);
    petalo.style.setProperty("--deriva", `${Math.random() * 160 - 80}px`);
    petalo.style.setProperty("--giro", `${Math.random() * 500 - 250}deg`);
    petalo.style.setProperty("--duracion", `${9 + Math.random() * 6}s`);
    petalo.style.setProperty("--espera", `${Math.random() * 6}s`);
    petalo.style.setProperty("--tamano", `${12 + Math.random() * 13}px`);
    petalo.addEventListener("animationend", () => petalo.remove(), { once: true });
    capa.appendChild(petalo);
  }
}

// Evita desplazar la página mientras la portada de apertura está visible.
document.body.classList.add("invitacion-cerrada");

// Audio local: sin video ni servicios de reproducción incrustados.
const tocadiscos = document.getElementById("tocadiscos");
const audioBoda = document.getElementById("cancion");
const estadoMusica = document.getElementById("estado-musica");
let deseaReproducir = false;

function actualizarDisco(activo) {
  tocadiscos.classList.toggle("reproduciendo", activo);
  tocadiscos.setAttribute("aria-pressed", String(activo));
  tocadiscos.setAttribute("aria-label", activo ? "Pausar canción" : "Reproducir canción");
}
function pausarMusica() {
  deseaReproducir = false;
  audioBoda.pause();
  actualizarDisco(false);
}
if (datos.cancion) audioBoda.src = datos.cancion;

tocadiscos.addEventListener("click", async () => {
  if (!datos.cancion) {
    estadoMusica.textContent = "La canción estará disponible cuando se incorpore el MP3.";
    return;
  }
  if (deseaReproducir) {
    pausarMusica();
    estadoMusica.textContent = "Música en pausa · toca el disco para continuar";
    return;
  }
  deseaReproducir = true;
  try {
    await audioBoda.play();
    if (!deseaReproducir) { audioBoda.pause(); return; }
    actualizarDisco(true);
    estadoMusica.textContent = "Escuchando canción · toca el disco para pausar";
  } catch {
    pausarMusica();
    estadoMusica.textContent = "No se pudo reproducir el audio. Toca de nuevo para intentar.";
  }
});
audioBoda.addEventListener("pause", () => actualizarDisco(false));
const observadorMusica = new IntersectionObserver(entradas => {
  if (!entradas[0].isIntersecting) {
    pausarMusica();
    estadoMusica.textContent = "Toca el disco para escuchar nuestra canción";
  }
}, { threshold: 0 });
observadorMusica.observe(document.getElementById("cuenta-regresiva"));
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pausarMusica();
});
document.getElementById("ninos").addEventListener("input", evento => {
  evento.target.setCustomValidity("");
});

// Fondo de PC: imágenes alternadas con bordes coincidentes, sin deformación.
const lienzoEscritorio = document.getElementById("fondo-escritorio");
const paginaInvitacion = document.querySelector("main");
const imagenEscritorio = new Image();
imagenEscritorio.src = "assets/fondo-escritorio.png";

function ajustarFondoEscritorio() {
  if (innerWidth < 900 || !imagenEscritorio.naturalWidth) return;
  const alturaPieza = paginaInvitacion.clientWidth *
    imagenEscritorio.naturalHeight / imagenEscritorio.naturalWidth;
  const piezas = Math.ceil(paginaInvitacion.scrollHeight / alturaPieza) + 1;
  if (lienzoEscritorio.children.length === piezas) return;
  const fragmento = document.createDocumentFragment();
  for (let indice = 0; indice < piezas; indice++) {
    const imagen = document.createElement("img");
    imagen.src = imagenEscritorio.src;
    imagen.alt = "";
    imagen.decoding = "async";
    fragmento.appendChild(imagen);
  }
  lienzoEscritorio.replaceChildren(fragmento);
}
imagenEscritorio.addEventListener("load", ajustarFondoEscritorio);
new ResizeObserver(ajustarFondoEscritorio).observe(paginaInvitacion);
window.addEventListener("resize", ajustarFondoEscritorio);
