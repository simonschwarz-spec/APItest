// ============================================
// CONSULTA DO CLIMA - OPEN-METEO
// ============================================

// URLs das APIs
const GEO_URL =
    "https://geocoding-api.open-meteo.com/v1/search";

const CLIMA_URL =
    "https://api.open-meteo.com/v1/forecast";


// ============================================
// ELEMENTOS DA PÁGINA
// ============================================

const botaoBuscar = document.getElementById("buscar");

const campoCidade = document.getElementById("cidade");

const resultado = document.getElementById("resultado");


// ============================================
// LIGA O BOTÃO À FUNÇÃO
// ============================================

botaoBuscar.addEventListener("click", buscarClima);


// ============================================
// MELHORIA 1:
// Permite pesquisar pressionando ENTER
// ============================================

campoCidade.addEventListener("keydown", function (evento) {

    if (evento.key === "Enter") {
        buscarClima();
    }

});


// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

async function buscarClima() {

    // Captura o nome da cidade
    const cidade = campoCidade.value.trim();


    // ============================================
    // VALIDAÇÃO DO CAMPO
    // ============================================

    if (cidade === "") {

        resultado.innerHTML = `
            <p>Digite o nome de uma cidade.</p>
        `;

        campoCidade.focus();

        return;
    }


    // ============================================
    // MOSTRA MENSAGEM DE CARREGAMENTO
    // ============================================

    resultado.innerHTML = `
        <p>Consultando o clima de <strong>${cidade}</strong>...</p>
    `;


    try {

        // ============================================
        // 1. GEOCODIFICAÇÃO
        // Descobre latitude e longitude da cidade
        // ============================================

        const urlBusca =
            `${GEO_URL}?name=${encodeURIComponent(cidade)}` +
            `&count=1` +
            `&language=pt` +
            `&format=json`;


        const respostaCidade = await fetch(urlBusca);


        if (!respostaCidade.ok) {
            throw new Error(
                "Não foi possível localizar a cidade."
            );
        }


        const dadosCidade = await respostaCidade.json();


        // Verifica se a API encontrou alguma cidade
        if (
            !dadosCidade.results ||
            dadosCidade.results.length === 0
        ) {
            throw new Error(
                "Cidade não encontrada."
            );
        }


        // Pega os dados da primeira cidade encontrada
        const local = dadosCidade.results[0];

        const latitude = local.latitude;

        const longitude = local.longitude;

        const nomeCidade = local.name;

        const pais = local.country;


        // ============================================
        // 2. CONSULTA DO CLIMA
        // ============================================

        const urlClima =
            `${CLIMA_URL}?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,` +
            `apparent_temperature,wind_speed_10m,weather_code` +
            `&temperature_unit=celsius` +
            `&wind_speed_unit=kmh` +
            `&timezone=auto`;


        const respostaClima = await fetch(urlClima);


        if (!respostaClima.ok) {
            throw new Error(
                "Não foi possível consultar o clima."
            );
        }


        const dadosClima = await respostaClima.json();


        // ============================================
        // 3. EXTRAI OS DADOS DO JSON
        // ============================================

        const clima = dadosClima.current;


        const temperatura = clima.temperature_2m;

        const umidade = clima.relative_humidity_2m;

        const sensacao = clima.apparent_temperature;

        const vento = clima.wind_speed_10m;

        const codigoClima = clima.weather_code;


        // ============================================
        // MELHORIA 2:
        // Converte o código da API para texto
        // ============================================

        const condicao = interpretarClima(codigoClima);


        // ============================================
        // 4. MOSTRA OS DADOS NA PÁGINA
        // ============================================

        resultado.innerHTML = `
            <div class="card-clima">

                <h2>${nomeCidade}</h2>

                <p>${pais}</p>

                <p>
                    Condição:
                    <strong>${condicao}</strong>
                </p>

                <p>
                    Temperatura:
                    <strong>${temperatura} °C</strong>
                </p>

                <p>
                    Sensação térmica:
                    <strong>${sensacao} °C</strong>
                </p>

                <p>
                    Umidade:
                    <strong>${umidade}%</strong>
                </p>

                <p>
                    Vento:
                    <strong>${vento} km/h</strong>
                </p>

            </div>
        `;


    } catch (erro) {

        // ============================================
        // TRATAMENTO DE ERROS
        // ============================================

        console.error("Erro:", erro);


        resultado.innerHTML = `
            <p>
                ${erro.message}
            </p>
        `;

    }

}


// ============================================
// MELHORIA 3:
// Interpreta o weather_code do Open-Meteo
// ============================================

function interpretarClima(codigo) {

    if (codigo === 0) {
        return "Céu limpo";
    }

    if (codigo === 1) {
        return "Principalmente limpo";
    }

    if (codigo === 2) {
        return "Parcialmente nublado";
    }

    if (codigo === 3) {
        return "Nublado";
    }

    if (
        codigo === 45 ||
        codigo === 48
    ) {
        return "Neblina";
    }

    if (
        codigo >= 51 &&
        codigo <= 57
    ) {
        return "Chuvisco";
    }

    if (
        codigo >= 61 &&
        codigo <= 67
    ) {
        return "Chuva";
    }

    if (
        codigo >= 71 &&
        codigo <= 77
    ) {
        return "Neve";
    }

    if (
        codigo >= 80 &&
        codigo <= 82
    ) {
        return "Pancadas de chuva";
    }

    if (
        codigo === 85 ||
        codigo === 86
    ) {
        return "Pancadas de neve";
    }

    if (
        codigo === 95 ||
        codigo === 96 ||
        codigo === 99
    ) {
        return "Tempestade";
    }

    return "Condição desconhecida";
}