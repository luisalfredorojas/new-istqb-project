let preguntas = [];
let respuestasUsuario = [];
let paginaActual = 0;
const preguntasPorPagina = 2;
let tiempoRestante = 120 * 60;
let temporizador;

window.addEventListener("DOMContentLoaded", async () => {
    const tituloElemento = document.getElementById("titulo-examen");
    const contenedor = document.getElementById("contenedor-preguntas");
    const btnAnterior = document.getElementById("btn-anterior");
    const btnSiguiente = document.getElementById("btn-siguiente");
    const btnFinalizar = document.getElementById("btn-finalizar");
    const temporizadorElemento = document.getElementById("temporizador");

    const params = new URLSearchParams(window.location.search);
    const archivo = params.get("archivo");

    if (!archivo) {
        alert("No se especificó el archivo del examen.");
        return;
    }

    try {
        const res = await fetch(`examenes/${archivo}`);
        const data = await res.json();
        const examenInfo = data[0];

        tituloElemento.textContent = examenInfo.titulo;
        preguntas = examenInfo.examen;
        respuestasUsuario = new Array(preguntas.length).fill([]);

        mostrarPreguntas();
        iniciarTemporizador(temporizadorElemento);

        btnAnterior.onclick = () => {
            if (paginaActual > 0) {
                paginaActual--;
                mostrarPreguntas();
            }
        };

        btnSiguiente.onclick = () => {
            if ((paginaActual + 1) * preguntasPorPagina < preguntas.length) {
                paginaActual++;
                mostrarPreguntas();
            }
        };

        btnFinalizar.onclick = finalizarExamen;
    } catch (error) {
        console.error("Error al cargar el examen:", error);
        alert("Error al cargar el examen.");
    }
});

function mostrarPreguntas() {
    const contenedor = document.getElementById("contenedor-preguntas");
    contenedor.innerHTML = "";
    const inicio = paginaActual * preguntasPorPagina;
    const fin = Math.min(inicio + preguntasPorPagina, preguntas.length);

    for (let i = inicio; i < fin; i++) {
        const p = preguntas[i];
        const div = document.createElement("div");
        div.classList.add("pregunta");

        const esMultiple = Array.isArray(p.respuesta_correcta);
        const tipo = esMultiple ? "checkbox" : "radio";

        const opciones = p.opciones
            .map((op, idx) => {
                const checked = esMultiple
                    ? (respuestasUsuario[i] || []).includes(idx)
                        ? "checked"
                        : ""
                    : respuestasUsuario[i] === idx
                        ? "checked"
                        : "";
                return `<label><input type="${tipo}" name="pregunta-${i}" value="${idx}" ${checked}> ${op}</label>`;
            })
            .join("<br>");

        div.innerHTML = `
      <h3>Pregunta ${p.numero}</h3>
      <p>${p.pregunta.replace(/\\n/g, "<br>")}</p>
      ${opciones}`
      if(esMultiple) {
          div.innerHTML += `<p><strong>Select ${p.numero_respuestas} options</strong></p>`;
      }else{
          div.innerHTML += `<p><strong>Select ${p.numero_respuestas} option</strong></p>`;
      }
      
    

        contenedor.appendChild(div);
    }

    preguntas.forEach((_, i) => {
        const tipo = Array.isArray(preguntas[i].respuesta_correcta) ? "checkbox" : "radio";
        const inputs = document.querySelectorAll(`input[name='pregunta-${i}']`);
        inputs.forEach(input => {
            input.addEventListener("change", () => {
                if (tipo === "checkbox") {
                    const seleccionados = Array.from(inputs)
                        .filter(inp => inp.checked)
                        .map(inp => parseInt(inp.value));
                    respuestasUsuario[i] = seleccionados;
                } else {
                    respuestasUsuario[i] = parseInt(input.value);
                }
            });
        });
    });
}

function iniciarTemporizador(elemento) {
    actualizarTemporizador(elemento);
    temporizador = setInterval(() => {
        tiempoRestante--;
        if (tiempoRestante <= 0) {
            clearInterval(temporizador);
            finalizarExamen();
        }
        actualizarTemporizador(elemento);
    }, 1000);
}

function actualizarTemporizador(elemento) {
    const min = Math.floor(tiempoRestante / 60).toString().padStart(2, '0');
    const seg = (tiempoRestante % 60).toString().padStart(2, '0');
    elemento.textContent = `Tiempo restante: ${min}:${seg}`;
}

function finalizarExamen() {
    clearInterval(temporizador);
    localStorage.setItem("respuestas", JSON.stringify(respuestasUsuario));
    localStorage.setItem("examenData", JSON.stringify(preguntas));
    window.location.href = "resultados.html";
}
