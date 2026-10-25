/* ========================================
   FORMULARIO DE CONTACTO (Formspree)
   ======================================== */

// Esperamos a que todo el HTML esté cargado
document.addEventListener("DOMContentLoaded", function () {
  // Buscamos el formulario y el párrafo donde mostramos el resultado
  const formulario = document.getElementById("form-contacto");
  const estado = document.getElementById("estado-formulario");

  // Si la página no tiene formulario, no hacemos nada
  if (!formulario) {
    return;
  }

  // Al pulsar "Enviar mensaje" (el navegador ya ha comprobado los campos obligatorios)
  formulario.addEventListener("submit", async function (evento) {
    // Evitamos que el navegador salga de la web: enviamos nosotros los datos
    evento.preventDefault();

    // Desactivamos el botón para que no se envíe dos veces
    const boton = formulario.querySelector('button[type="submit"]');
    boton.disabled = true;
    boton.textContent = "Enviando…";

    // Borramos el mensaje anterior, si había
    estado.className = "estado-formulario";
    estado.textContent = "";

    try {
      // Mandamos los datos del formulario a Formspree
      const respuesta = await fetch(formulario.action, {
        method: "POST",
        body: new FormData(formulario),
        headers: { Accept: "application/json" },
      });

      // Si Formspree responde con error, lo lanzamos al catch
      if (!respuesta.ok) {
        throw new Error("Formspree ha respondido con el código " + respuesta.status);
      }

      // Todo bien: vaciamos el formulario y mostramos el mensaje de éxito
      formulario.reset();
      estado.textContent =
        "¡Gracias! Tu mensaje se ha enviado. Te responderé lo antes posible.";
      estado.classList.add("exito");
    } catch (error) {
      // Algo ha fallado: avisamos con un mensaje amable
      estado.textContent =
        "No se ha podido enviar el mensaje. Inténtalo de nuevo en unos minutos.";
      estado.classList.add("error");

      // Nota en la consola (amarilla, no roja) para poder depurar con F12
      console.warn("Formulario de contacto:", error.message);
    } finally {
      // Pase lo que pase, volvemos a activar el botón
      boton.disabled = false;
      boton.textContent = "Enviar mensaje";
    }
  });
});
