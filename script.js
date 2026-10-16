/* ========================================
   CONFIGURACIÓN INICIAL
   ======================================== */

// Esperamos a que todo el HTML esté cargado
document.addEventListener("DOMContentLoaded", function () {
  /* ========================================
       MODO OSCURO
       ======================================== */

  // Buscamos el botón del modo oscuro
  const botonTema = document.getElementById("boton-tema");

  // Comprobamos si el usuario tenía guardada
  // anteriormente una preferencia de tema
  const temaGuardado = localStorage.getItem("tema");

  // Si había un tema guardado, lo aplicamos
  if (temaGuardado === "oscuro") {
    document.body.classList.add("modo-oscuro");
    botonTema.textContent = "☀️ Modo claro";
  }

  // Cambiamos entre modo claro y oscuro al pulsar el botón
  botonTema.addEventListener("click", function () {
    document.body.classList.toggle("modo-oscuro");

    // Comprobamos si el modo oscuro está activo
    const modoOscuroActivo = document.body.classList.contains("modo-oscuro");

    // Guardamos la elección del usuario
    if (modoOscuroActivo) {
      localStorage.setItem("tema", "oscuro");
      botonTema.textContent = "☀️ Modo claro";
    } else {
      localStorage.setItem("tema", "claro");
      botonTema.textContent = "🌙 Modo oscuro";
    }
  });

  /* ========================================
       AÑO AUTOMÁTICO DEL FOOTER
       ======================================== */

  // Obtenemos el año actual
  const añoActual = new Date().getFullYear();

  // Buscamos el elemento donde queremos mostrarlo
  const año = document.getElementById("año");

  // Si existe, mostramos el año actual
  if (año) {
    año.textContent = añoActual;
  }

  /* ========================================
       APARICIÓN SUAVE DE LAS SECCIONES
       ======================================== */

  // Seleccionamos todas las secciones principales
  const secciones = document.querySelectorAll("main section");

  // Añadimos una clase inicial a cada sección
  secciones.forEach(function (seccion) {
    seccion.classList.add("aparecer");
  });
});
