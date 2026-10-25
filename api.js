/* ========================================
   WIDGET DE GITHUB (datos vivos de una API)
   ======================================== */

// Usuario de GitHub del que queremos mostrar los datos.
const usuarioGitHub = "JosepVidal1";

// Dirección de la API pública de GitHub (no necesita clave).
const urlApi = "https://api.github.com/users/" + usuarioGitHub;

// Tiempo entre actualizaciones, en segundos.
// Pon 0 para desactivar la actualización automática.
// En el wifi del instituto conviene subirlo (GitHub da ~60 peticiones/hora por IP).
const segundosActualizacion = 600;

// Hueco del HTML donde se pinta el widget.
const widget = document.getElementById("widget");

// Aquí guardamos si ya se ha pintado la tarjeta alguna vez.
let tarjetaPintada = false;

/* ----------------------------------------
   ESTADO DE CARGA: esqueleto mientras llega el dato
   ---------------------------------------- */

// Pinta una tarjeta "fantasma" gris que parpadea mientras esperamos a GitHub.
function mostrarCargando() {
  const esqueleto = document.createElement("div");
  esqueleto.className = "tarjeta-github esqueleto";
  esqueleto.setAttribute("aria-busy", "true");

  const textoOculto = document.createElement("span");
  textoOculto.className = "solo-lectores";
  textoOculto.textContent = "Cargando datos de GitHub…";

  esqueleto.innerHTML =
    '<div class="esqueleto-cabecera">' +
    '<div class="esqueleto-bloque esqueleto-avatar"></div>' +
    '<div class="esqueleto-textos">' +
    '<div class="esqueleto-bloque esqueleto-linea"></div>' +
    '<div class="esqueleto-bloque esqueleto-linea corta"></div>' +
    "</div></div>" +
    '<div class="github-metricas">' +
    '<div class="esqueleto-bloque esqueleto-metrica"></div>' +
    '<div class="esqueleto-bloque esqueleto-metrica"></div>' +
    "</div>";

  esqueleto.prepend(textoOculto);
  widget.replaceChildren(esqueleto);
}

/* ----------------------------------------
   PEDIR LOS DATOS A LA API
   ---------------------------------------- */

// Pide los datos a GitHub y decide qué pintar según la respuesta.
async function cargarDatosGitHub() {
  // Solo enseñamos el esqueleto la primera vez; en las recargas se queda la tarjeta anterior.
  if (!tarjetaPintada) {
    mostrarCargando();
  }

  try {
    // 1) Hacemos la petición a la URL de la API.
    const respuesta = await fetch(urlApi);

    // 2) Si GitHub responde con error (403 = límite de peticiones, 404 = usuario no existe...), lo lanzamos.
    if (!respuesta.ok) {
      throw new Error("GitHub ha respondido con el código " + respuesta.status);
    }

    // 3) Convertimos el texto JSON en un objeto que JavaScript entiende.
    const datos = await respuesta.json();

    // 4) Pintamos la tarjeta con los campos que nos interesan.
    pintarTarjeta(datos);
    tarjetaPintada = true;
  } catch (error) {
    // Si algo falla, avisamos con un mensaje amable en vez de dejar el hueco colgado.
    mostrarError(error);
  }
}

/* ----------------------------------------
   PINTAR LA TARJETA CON LOS DATOS
   ---------------------------------------- */

// Construye la tarjeta usando los campos del JSON: avatar_url, name, login, public_repos, followers, html_url.
function pintarTarjeta(datos) {
  const tarjeta = document.createElement("article");
  tarjeta.className = "tarjeta-github";

  // Cabecera: foto de perfil de GitHub + nombre + usuario.
  const cabecera = document.createElement("div");
  cabecera.className = "github-cabecera";

  const avatar = document.createElement("img");
  avatar.className = "github-avatar";
  avatar.src = datos.avatar_url;
  avatar.alt = "Avatar de GitHub de " + datos.login;
  avatar.width = 64;
  avatar.height = 64;

  const textosCabecera = document.createElement("div");

  const titulo = document.createElement("h3");
  titulo.textContent = datos.name || datos.login;

  const usuario = document.createElement("p");
  usuario.className = "github-usuario";
  usuario.textContent = "@" + datos.login;

  textosCabecera.append(titulo, usuario);
  cabecera.append(avatar, textosCabecera);

  // Descripción corta de la tarjeta.
  const descripcion = document.createElement("p");
  descripcion.className = "github-descripcion";
  descripcion.textContent = "Mi actividad como desarrollador.";

  // Métricas: repositorios públicos y seguidores.
  const metricas = document.createElement("div");
  metricas.className = "github-metricas";
  metricas.append(
    crearMetrica(datos.public_repos, "Repositorios públicos"),
    crearMetrica(datos.followers, "Seguidores"),
  );

  // Pie de la tarjeta: enlace al perfil + hora de la última actualización.
  const pie = document.createElement("div");
  pie.className = "github-pie";

  const enlace = document.createElement("a");
  enlace.href = datos.html_url;
  enlace.textContent = "Visitar mi perfil de GitHub →";
  enlace.target = "_blank";
  enlace.rel = "noopener noreferrer";

  const actualizado = document.createElement("p");
  actualizado.className = "github-actualizado";
  actualizado.textContent =
    "Datos en directo · actualizado a las " + horaActual();

  pie.append(enlace, actualizado);

  tarjeta.append(cabecera, descripcion, metricas, pie);

  // Sustituimos lo que hubiera en el hueco por la tarjeta nueva.
  widget.replaceChildren(tarjeta);
}

// Crea una caja con un número grande y su texto debajo.
function crearMetrica(numero, texto) {
  const caja = document.createElement("div");
  caja.className = "github-metrica";

  const valor = document.createElement("strong");
  valor.textContent = numero;

  const etiqueta = document.createElement("span");
  etiqueta.textContent = texto;

  caja.append(valor, etiqueta);
  return caja;
}

/* ----------------------------------------
   MENSAJE DE ERROR AMABLE
   ---------------------------------------- */

// Muestra un aviso según el tipo de fallo, sin borrar los datos si ya estaban pintados.
function mostrarError(error) {
  // Mensaje distinto si es el límite de peticiones de GitHub (código 403).
  const esLimite = String(error.message).includes("403");
  const mensaje = esLimite
    ? "GitHub ha alcanzado el límite de consultas. Vuelve a intentarlo en unos minutos."
    : "GitHub no responde ahora. Inténtalo de nuevo más tarde.";

  // Si ya había tarjeta, la dejamos y solo cambiamos la línea de "actualizado".
  const lineaActualizado = widget.querySelector(".github-actualizado");
  if (tarjetaPintada && lineaActualizado) {
    lineaActualizado.textContent =
      "No se ha podido actualizar · se muestran los últimos datos";
  } else {
    // Si no había nada, pintamos una caja de aviso con un enlace al perfil como alternativa.
    const aviso = document.createElement("div");
    aviso.className = "tarjeta-github github-error";
    aviso.setAttribute("role", "status");

    const texto = document.createElement("p");
    texto.textContent = mensaje;

    const enlace = document.createElement("a");
    enlace.href = "https://github.com/" + usuarioGitHub;
    enlace.textContent = "Ver mi perfil directamente en GitHub →";
    enlace.target = "_blank";
    enlace.rel = "noopener noreferrer";

    aviso.append(texto, enlace);
    widget.replaceChildren(aviso);
  }

  // Dejamos una nota en la consola (amarilla, no roja) para poder depurar con F12.
  console.warn("Widget de GitHub:", error.message);
}

// Devuelve la hora actual en formato 14:05.
function horaActual() {
  return new Date().toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ----------------------------------------
   ARRANQUE
   ---------------------------------------- */

// Cargamos los datos al abrir la página.
cargarDatosGitHub();

// Actualizamos los datos automáticamente si el intervalo es mayor que 0.
if (segundosActualizacion > 0) {
  setInterval(cargarDatosGitHub, segundosActualizacion * 1000);
}
