/* ========================================
   WIDGET DEL TIEMPO (API Open-Meteo)
   ======================================== */

// Esperamos a que todo el HTML esté cargado
document.addEventListener("DOMContentLoaded", function () {
  // Ciudad que se muestra al abrir la web: Albaida, mi ciudad.
  const ciudadInicial = { nombre: "Albaida", latitud: 38.8381, longitud: -0.5219 };

  // Buscamos en el HTML el hueco del widget y los controles del formulario.
  const contenedor = document.getElementById("widget-tiempo");
  const formulario = document.getElementById("form-tiempo");
  const campoCiudad = document.getElementById("ciudad");
  const botonUbicacion = document.getElementById("boton-ubicacion");

  // Si la página no tiene el widget, no hacemos nada.
  if (!contenedor) {
    return;
  }

  /* ----------------------------------------
     TRADUCIR EL CÓDIGO DEL TIEMPO
     ---------------------------------------- */

  // Open-Meteo devuelve un número (weather_code); aquí lo pasamos a icono y texto.
  function describirTiempo(codigo) {
    if (codigo === 0) return { icono: "☀️", texto: "Despejado" };
    if (codigo <= 2) return { icono: "🌤️", texto: "Poco nuboso" };
    if (codigo === 3) return { icono: "☁️", texto: "Nublado" };
    if (codigo <= 48) return { icono: "🌫️", texto: "Niebla" };
    if (codigo <= 57) return { icono: "🌦️", texto: "Llovizna" };
    if (codigo <= 67) return { icono: "🌧️", texto: "Lluvia" };
    if (codigo <= 77) return { icono: "❄️", texto: "Nieve" };
    if (codigo <= 82) return { icono: "🌦️", texto: "Chubascos" };
    if (codigo <= 86) return { icono: "🌨️", texto: "Chubascos de nieve" };
    return { icono: "⛈️", texto: "Tormenta" };
  }

  /* ----------------------------------------
     PEDIR EL TIEMPO A LA API
     ---------------------------------------- */

  // Pide el tiempo actual de un lugar (nombre + coordenadas) y lo pinta.
  async function cargarTiempo(lugar) {
    contenedor.textContent = "Cargando el tiempo de " + lugar.nombre + "…";

    try {
      // 1) Montamos la URL con las coordenadas del lugar.
      const url =
        "https://api.open-meteo.com/v1/forecast?latitude=" +
        lugar.latitud +
        "&longitude=" +
        lugar.longitud +
        "&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto";

      // 2) Hacemos la petición.
      const respuesta = await fetch(url);

      // 3) Si la API responde con error, lo lanzamos al catch.
      if (!respuesta.ok) {
        throw new Error("Open-Meteo ha respondido con el código " + respuesta.status);
      }

      // 4) Convertimos el JSON y pintamos solo la parte "current" (el tiempo de ahora).
      const datos = await respuesta.json();
      pintarTiempo(lugar.nombre, datos.current);
    } catch (error) {
      mostrarAviso("No se ha podido cargar el tiempo ahora. Inténtalo más tarde.");
      console.warn("Widget del tiempo:", error.message);
    }
  }

  // Busca las coordenadas de una ciudad a partir de su nombre (buscador de Open-Meteo).
  async function buscarCiudad(nombre) {
    const url =
      "https://geocoding-api.open-meteo.com/v1/search?name=" +
      encodeURIComponent(nombre) +
      "&count=1&language=es&format=json";

    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      throw new Error("El buscador de ciudades ha respondido con el código " + respuesta.status);
    }

    const datos = await respuesta.json();

    // Si no hay resultados, devolvemos null para avisar al usuario.
    if (!datos.results || datos.results.length === 0) {
      return null;
    }

    // Nos quedamos con el primer resultado: nombre, provincia/región y coordenadas.
    const resultado = datos.results[0];
    return {
      nombre: resultado.admin1 ? resultado.name + ", " + resultado.admin1 : resultado.name,
      latitud: resultado.latitude,
      longitud: resultado.longitude,
    };
  }

  /* ----------------------------------------
     PINTAR EL RESULTADO
     ---------------------------------------- */

  // Construye la tarjeta con icono, temperatura, lugar, estado y viento.
  function pintarTiempo(nombreLugar, actual) {
    const descripcion = describirTiempo(actual.weather_code);

    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta-tiempo";

    const icono = document.createElement("span");
    icono.className = "tiempo-icono";
    icono.setAttribute("aria-hidden", "true");
    icono.textContent = descripcion.icono;

    const textos = document.createElement("div");

    const temperatura = document.createElement("p");
    temperatura.className = "tiempo-temperatura";
    temperatura.textContent = Math.round(actual.temperature_2m) + " °C";

    const lugar = document.createElement("p");
    lugar.className = "tiempo-lugar";
    lugar.textContent = "📍 " + nombreLugar;

    const detalle = document.createElement("p");
    detalle.textContent =
      descripcion.texto + " · viento " + Math.round(actual.wind_speed_10m) + " km/h";

    textos.append(temperatura, lugar, detalle);
    tarjeta.append(icono, textos);

    contenedor.replaceChildren(tarjeta);
  }

  // Muestra un aviso amable en el hueco del widget.
  function mostrarAviso(mensaje) {
    const aviso = document.createElement("p");
    aviso.className = "tiempo-error";
    aviso.textContent = mensaje;
    contenedor.replaceChildren(aviso);
  }

  /* ----------------------------------------
     LO QUE HACE EL USUARIO
     ---------------------------------------- */

  // Al pulsar "Buscar": buscamos la ciudad escrita y pedimos su tiempo.
  formulario.addEventListener("submit", async function (evento) {
    // Evitamos que la página se recargue.
    evento.preventDefault();

    const nombre = campoCiudad.value.trim();
    if (nombre === "") {
      return;
    }

    contenedor.textContent = "Buscando «" + nombre + "»…";

    try {
      const lugar = await buscarCiudad(nombre);

      if (lugar === null) {
        mostrarAviso("No encuentro «" + nombre + "». Revisa cómo está escrito.");
        return;
      }

      cargarTiempo(lugar);
    } catch (error) {
      mostrarAviso("No se ha podido buscar la ciudad ahora. Inténtalo más tarde.");
      console.warn("Widget del tiempo:", error.message);
    }
  });

  // Al pulsar "Usar mi ubicación": pedimos permiso al navegador para saber dónde está.
  botonUbicacion.addEventListener("click", function () {
    // Algunos navegadores antiguos no tienen geolocalización.
    if (!("geolocation" in navigator)) {
      mostrarAviso("Tu navegador no permite usar la ubicación. Escribe tu ciudad.");
      return;
    }

    contenedor.textContent = "Pidiendo permiso para usar tu ubicación…";

    navigator.geolocation.getCurrentPosition(
      // Si el usuario acepta, pedimos el tiempo de sus coordenadas.
      function (posicion) {
        cargarTiempo({
          nombre: "Tu ubicación",
          latitud: posicion.coords.latitude.toFixed(4),
          longitud: posicion.coords.longitude.toFixed(4),
        });
      },
      // Si no acepta o falla, avisamos.
      function () {
        mostrarAviso(
          "No he podido obtener tu ubicación. Revisa el permiso del navegador o escribe tu ciudad."
        );
      },
      { timeout: 10000 }
    );
  });

  /* ----------------------------------------
     ARRANQUE
     ---------------------------------------- */

  // Al abrir la web, mostramos el tiempo de Albaida.
  cargarTiempo(ciudadInicial);
});