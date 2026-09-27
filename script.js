// ========================================
// VILELA FINANCE
// ASSISTENTE FINANCEIRO PESSOAL
// ========================================

let lancamentos = JSON.parse(
    localStorage.getItem("vilelaFinanceLancamentos")
) || [];

// ========================================
// ELEMENTOS
// ========================================

const balanceAmount = document.getElementById("balance-amount");
const totalIncome = document.getElementById("total-income");
const totalExpense = document.getElementById("total-expense");
const todayExpense = document.getElementById("today-expense");
const todayCount = document.getElementById("today-count");
const historyList = document.getElementById("history-list");
const currentDateLabel = document.getElementById("current-date-label");

const chatInput = document.getElementById("chat-input");
const btnSend = document.getElementById("btn-send");
const btnVoice = document.getElementById("btn-voice");
const chatBox = document.getElementById("chat-box");

const modalOverlay = document.getElementById("modal-overlay");
const manualForm = document.getElementById("manual-form");

const formType = document.getElementById("form-type");
const formValue = document.getElementById("form-value");
const formDescription = document.getElementById("form-description");
const formCategory = document.getElementById("form-category");
const formDate = document.getElementById("form-date");
const modalTitle = document.getElementById("modal-title");

const voiceStatus = document.getElementById("voice-status");

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    atualizarData();

    formDate.value = obterDataLocal();

    atualizarTela();

});

// ========================================
// DATA
// ========================================

function obterDataLocal() {

    const agora = new Date();

    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function formatarData(data) {

    if (!data) return "";

    const partes = data.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function atualizarData() {

    const agora = new Date();

    currentDateLabel.textContent =
        agora.toLocaleDateString("pt-BR");
}

// ========================================
// MOEDA
// ========================================

function formatarMoeda(valor) {

    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// ========================================
// ATUALIZAR TELA
// ========================================

function atualizarTela() {

    atualizarResumo();

    atualizarHistorico();

    salvarDados();
}

// ========================================
// RESUMO FINANCEIRO
// ========================================

function atualizarResumo() {

    let receitas = 0;
    let despesas = 0;

    const hoje = obterDataLocal();

    let gastosHoje = 0;
    let lancamentosHoje = 0;

    lancamentos.forEach(item => {

        const valor = Number(item.valor) || 0;

        if (item.tipo === "receita") {

            receitas += valor;

        } else {

            despesas += valor;

            if (item.data === hoje) {

                gastosHoje += valor;

            }
        }

        if (item.data === hoje) {

            lancamentosHoje++;

        }

    });

    const saldo = receitas - despesas;

    balanceAmount.textContent = formatarMoeda(saldo);

    totalIncome.textContent = formatarMoeda(receitas);

    totalExpense.textContent = formatarMoeda(despesas);

    todayExpense.textContent = formatarMoeda(gastosHoje);

    todayCount.textContent = lancamentosHoje;

    if (saldo < 0) {

        balanceAmount.style.color = "#f87171";

    } else {

        balanceAmount.style.color = "#4ade80";

    }
}

// ========================================
// HISTÓRICO
// ========================================

function atualizarHistorico() {

    if (lancamentos.length === 0) {

        historyList.innerHTML = `
            <div class="empty-state">
                Nenhum lançamento registrado ainda.
            </div>
        `;

        return;
    }

    historyList.innerHTML = "";

    const ordenados = [...lancamentos].reverse();

    ordenados.forEach(item => {

        const div = document.createElement("div");

        div.className = "history-item";

        const sinal = item.tipo === "receita" ? "+" : "-";

        div.innerHTML = `
            <div>
                <div class="history-description">
                    ${escaparHTML(item.descricao)}
                </div>

                <div class="history-category">
                    ${escaparHTML(item.categoria || "Outros")}
                </div>

                <div class="history-date">
                    ${formatarData(item.data)}
                </div>
            </div>

            <div class="history-value ${item.tipo}">
                ${sinal} ${formatarMoeda(Number(item.valor))}
            </div>
        `;

        historyList.appendChild(div);

    });
}

// ========================================
// SEGURANÇA DO TEXTO
// ========================================

function escaparHTML(texto) {

    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// ========================================
// LOCAL STORAGE
// ========================================

function salvarDados() {

    localStorage.setItem(
        "vilelaFinanceLancamentos",
        JSON.stringify(lancamentos)
    );
}

// ========================================
// MODAL
// ========================================

function abrirModal(tipo) {

    formType.value = tipo;

    if (tipo === "receita") {

        modalTitle.textContent = "Nova Receita";

        formCategory.value = "Salário";

    } else {

        modalTitle.textContent = "Novo Gasto";

        formCategory.value = "Alimentação";

    }

    formValue.value = "";

    formDescription.value = "";

    formDate.value = obterDataLocal();

    modalOverlay.classList.add("active");

    setTimeout(() => {

        formValue.focus();

    }, 100);
}

function fecharModal() {

    modalOverlay.classList.remove("active");

}

// Fechar clicando fora do modal

modalOverlay.addEventListener("click", event => {

    if (event.target === modalOverlay) {

        fecharModal();

    }

});

// ========================================
// SALVAR LANÇAMENTO MANUAL
// ========================================

manualForm.addEventListener("submit", event => {

    event.preventDefault();

    const valor = Number(formValue.value);

    const descricao = formDescription.value.trim();

    const categoria = formCategory.value;

    const data = formDate.value || obterDataLocal();

    const tipo = formType.value;

    if (!valor || valor <= 0) {

        alert("Digite um valor válido.");

        return;

    }

    if (!descricao) {

        alert("Digite uma descrição.");

        return;

    }

    const novoLancamento = {

        id: Date.now(),

        tipo: tipo,

        valor: valor,

        descricao: descricao,

        categoria: categoria,

        data: data

    };

    lancamentos.push(novoLancamento);

    atualizarTela();

    fecharModal();

    adicionarMensagem(
        "assistant",
        `Lançamento registrado: ${descricao} de ${formatarMoeda(valor)}.`
    );

});

// ========================================
// CHAT
// ========================================

btnSend.addEventListener("click", enviarMensagem);

chatInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {

        enviarMensagem();

    }

});

function enviarMensagem() {

    const texto = chatInput.value.trim();

    if (!texto) return;

    adicionarMensagem("user", texto);

    chatInput.value = "";

    processarComando(texto);

}

// ========================================
// MENSAGENS DO CHAT
// ========================================

function adicionarMensagem(tipo, texto) {

    const div = document.createElement("div");

    div.className = `message ${tipo}`;

    if (tipo === "assistant") {

        div.innerHTML = `
            <div class="avatar">🤖</div>

            <div class="msg-bubble">
                <strong>Vilela:</strong> ${escaparHTML(texto)}
                <span class="msg-time">Agora</span>
            </div>
        `;

    } else {

        div.innerHTML = `
            <div class="msg-bubble">
                ${escaparHTML(texto)}
                <span class="msg-time">Agora</span>
            </div>
        `;

    }

    chatBox.appendChild(div);

    chatBox.scrollTop = chatBox.scrollHeight;

}

// ========================================
// INTERPRETAÇÃO SIMPLES DE COMANDOS
// ========================================

function processarComando(texto) {

    const textoLower = texto.toLowerCase();

    const valorEncontrado =
        textoLower.match(/(?:r\$)?\s*(\d+(?:[.,]\d{1,2})?)/);

    let valor = 0;

    if (valorEncontrado) {

        valor = parseFloat(
            valorEncontrado[1]
                .replace(".", "")
                .replace(",", ".")
        );

    }

    const ehReceita =
        textoLower.includes("recebi") ||
        textoLower.includes("salário") ||
        textoLower.includes("salario") ||
        textoLower.includes("entrada") ||
        textoLower.includes("ganhei") ||
        textoLower.includes("receita");

    const ehDespesa =
        textoLower.includes("gastei") ||
        textoLower.includes("paguei") ||
        textoLower.includes("compra") ||
        textoLower.includes("despesa") ||
        textoLower.includes("gasto");

    if (valor > 0 && ehReceita) {

        const descricao = gerarDescricao(texto);

        adicionarLancamentoAutomatico(
            "receita",
            valor,
            descricao,
            "Salário"
        );

        return;
    }

    if (valor > 0 && ehDespesa) {

        const categoria = detectarCategoria(textoLower);

        const descricao = gerarDescricao(texto);

        adicionarLancamentoAutomatico(
            "despesa",
            valor,
            descricao,
            categoria
        );

        return;
    }

    if (
        textoLower.includes("saldo") ||
        textoLower.includes("quanto tenho")
    ) {

        responderSaldo();

        return;
    }

    if (
        textoLower.includes("gastei hoje") ||
        textoLower.includes("gastos hoje")
    ) {

        responderGastosHoje();

        return;
    }

    adicionarMensagem(
        "assistant",
        "Posso registrar receitas e gastos. Exemplo: \"Gastei 35 reais no almoço\" ou \"Recebi 3000 reais de salário\"."
    );
}

// ========================================
// LANÇAMENTO AUTOMÁTICO
// ========================================

function adicionarLancamentoAutomatico(
    tipo,
    valor,
    descricao,
    categoria
) {

    lancamentos.push({

        id: Date.now(),

        tipo: tipo,

        valor: valor,

        descricao: descricao,

        categoria: categoria,

        data: obterDataLocal()

    });

    atualizarTela();

    const palavra =
        tipo === "receita"
            ? "receita"
            : "gasto";

    adicionarMensagem(
        "assistant",
        `Entendido! Registrei ${palavra} de ${formatarMoeda(valor)} em ${categoria}.`
    );
}

// ========================================
// CATEGORIA AUTOMÁTICA
// ========================================

function detectarCategoria(texto) {

    if (
        texto.includes("almoço") ||
        texto.includes("almoco") ||
        texto.includes("janta") ||
        texto.includes("comida") ||
        texto.includes("lanche") ||
        texto.includes("mercado")
    ) {

        return "Alimentação";
    }

    if (
        texto.includes("gasolina") ||
        texto.includes("combustível") ||
        texto.includes("combustivel") ||
        texto.includes("uber") ||
        texto.includes("ônibus") ||
        texto.includes("onibus")
    ) {

        return "Transporte";
    }

    if (
        texto.includes("remédio") ||
        texto.includes("remedio") ||
        texto.includes("farmácia") ||
        texto.includes("farmacia")
    ) {

        return "Saúde";
    }

    if (
        texto.includes("faculdade") ||
        texto.includes("curso") ||
        texto.includes("livro")
    ) {

        return "Educação";
    }

    if (
        texto.includes("cinema") ||
        texto.includes("jogo") ||
        texto.includes("festa")
    ) {

        return "Lazer";
    }

    if (
        texto.includes("aluguel") ||
        texto.includes("luz") ||
        texto.includes("água") ||
        texto.includes("agua") ||
        texto.includes("internet")
    ) {

        return "Casa";
    }

    return "Outros";
}

// ========================================
// DESCRIÇÃO AUTOMÁTICA
// ========================================

function gerarDescricao(texto) {

    const textoLimpo = texto.trim();

    if (textoLimpo.length > 60) {

        return textoLimpo.substring(0, 60) + "...";

    }

    return textoLimpo;
}

// ========================================
// RESPOSTA DE SALDO
// ========================================

function responderSaldo() {

    let receitas = 0;
    let despesas = 0;

    lancamentos.forEach(item => {

        if (item.tipo === "receita") {

            receitas += Number(item.valor);

        } else {

            despesas += Number(item.valor);

        }

    });

    const saldo = receitas - despesas;

    adicionarMensagem(
        "assistant",
        `Seu saldo atual é ${formatarMoeda(saldo)}.`
    );
}

// ========================================
// GASTOS DE HOJE
// ========================================

function responderGastosHoje() {

    const hoje = obterDataLocal();

    let total = 0;

    lancamentos.forEach(item => {

        if (
            item.tipo === "despesa" &&
            item.data === hoje
        ) {

            total += Number(item.valor);

        }

    });

    adicionarMensagem(
        "assistant",
        `Hoje você gastou ${formatarMoeda(total)}.`
    );
}

// ========================================
// LIMPAR TUDO
// ========================================

function limparTudo() {

    if (lancamentos.length === 0) {

        alert("Não existem lançamentos para apagar.");

        return;
    }

    const confirmar = confirm(
        "Tem certeza que deseja apagar todos os lançamentos?"
    );

    if (!confirmar) return;

    lancamentos = [];

    salvarDados();

    atualizarTela();

    adicionarMensagem(
        "assistant",
        "Todos os lançamentos foram apagados."
    );
}

// ========================================
// RECONHECIMENTO DE VOZ
// ========================================

let reconhecimento;

if (
    "webkitSpeechRecognition" in window ||
    "SpeechRecognition" in window
) {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    reconhecimento = new SpeechRecognition();

    reconhecimento.lang = "pt-BR";

    reconhecimento.continuous = false;

    reconhecimento.interimResults = false;

    reconhecimento.onstart = () => {

        voiceStatus.textContent = "🎙️ Estou ouvindo...";

        btnVoice.style.background = "#dc2626";

    };

    reconhecimento.onresult = event => {

        const texto =
            event.results[0][0].transcript;

        chatInput.value = texto;

        enviarMensagem();

    };

    reconhecimento.onerror = () => {

        voiceStatus.textContent =
            "Não consegui entender. Tente novamente.";

    };

    reconhecimento.onend = () => {

        voiceStatus.textContent =
            "Toque no microfone para falar";

        btnVoice.style.background = "";

    };

} else {

    btnVoice.disabled = true;

    voiceStatus.textContent =
        "Reconhecimento de voz não disponível neste navegador.";

}

// ========================================
// BOTÃO MICROFONE
// ========================================

btnVoice.addEventListener("click", () => {

    if (!reconhecimento) {

        alert(
            "O reconhecimento de voz não está disponível neste navegador."
        );

        return;
    }

    reconhecimento.start();

});
