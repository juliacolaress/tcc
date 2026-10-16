// Validação dinâmica de eventos/campanhas no frontend.
// Um evento é considerado concluído quando a data + horário já passaram
// em relação a new Date(), ou quando o backend já marcou status "Concluído".
export function estaConcluido(evento) {
    if (!evento) return false;
    if (evento.status === "Concluído" || evento.status === "concluido") return true;
    if (!evento.data) return false;

    let ano, mes, dia;
    const data = evento.data;

    if (data instanceof Date) {
        if (isNaN(data.getTime())) return false;
        ano = data.getFullYear();
        mes = data.getMonth() + 1;
        dia = data.getDate();
    } else {
        const texto = String(data).trim();
        const iso = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
        const brasileira = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (iso) {
            ano = Number(iso[1]);
            mes = Number(iso[2]);
            dia = Number(iso[3]);
        } else if (brasileira) {
            ano = Number(brasileira[3]);
            mes = Number(brasileira[2]);
            dia = Number(brasileira[1]);
        } else {
            return false;
        }
    }

    // Fim teórico: dia inteiro (23:59:59), ou o horário informado do evento
    const fim = new Date(ano, mes - 1, dia, 23, 59, 59, 999);
    const horario = String(evento.horario || "").match(/(\d{1,2})[:h](\d{2})/);
    if (horario) {
        const h = Number(horario[1]);
        const min = Number(horario[2]);
        if (h <= 23 && min <= 59) {
            fim.setHours(h, min, 0, 0);
        }
    }

    return fim.getTime() < Date.now();
}
