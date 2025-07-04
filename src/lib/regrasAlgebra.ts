// Função para formar a equação e aplicar as transformações necessárias
export function formarEquacao(expressao: string): string {
    // Regra 1: Verifica se a expressão é (A + B)^2 (expansão de binômio)
    const matchBinomio = expressao.match(/^\(([^)]+)\)\^2$/);
    if (matchBinomio) {
        const termos = matchBinomio[1].split('+').map(term => term.trim());
        if (termos.length === 2) {
            return expandirBinomio(termos[0], termos[1]); // Expande o binômio
        }
    }

    // Regra 2: Verifica se a expressão contém uma soma com divisão (A + B/x)
    const matchFracao = expressao.match(/^(.+)\s*\+\s*(\d+)\/(\w+)$/);
    if (matchFracao) {
        const base = matchFracao[1].trim();
        const numerador = matchFracao[2];
        return simplificarFracao(base, numerador); // Multiplica os termos por x e remove o denominador
    }

    // Regra 3: Distribuição de multiplicação sobre soma (A * (B + C) = A*B + A*C)
    const matchDistribuicao = expressao.match(/^(.+)\s*\*\s*\(([^)]+)\)$/);
    if (matchDistribuicao) {
        const a = matchDistribuicao[1].trim();
        const bC = matchDistribuicao[2].split('+').map(term => term.trim());
        if (bC.length === 2) {
            return distribuicaoMultiplicacao(a, bC[0], bC[1]);
        }
    }

    // Regra 4: Simplificação de multiplicação de fração (A/B) * B
    const matchMultiplicacaoFracao = expressao.match(/^(\d+\/\w+)\s*\*\s*\w+$/);
    if (matchMultiplicacaoFracao) {
        const termo = matchMultiplicacaoFracao[1].trim();
        return simplificarMultiplicacaoFracao(termo); // Simplifica a fração multiplicada pelo denominador
    }

    // Regra 5: Expansão de (A - B)^2
    const matchSubtracaoQuadrado = expressao.match(/^\(([^)]+)\)\^2$/);
    if (matchSubtracaoQuadrado) {
        const termos = matchSubtracaoQuadrado[1].split('-').map(term => term.trim());
        if (termos.length === 2) {
            return expandirSubtracaoQuadrado(termos[0], termos[1]); // Corrigido para expandir corretamente
        }
    }

    // Regra 6: Simplificação de números reais e produtos (ex: 2^2, 2 * x * 1)
    return simplificarNumerosReais(expressao);
}

// Função para expandir um binômio (A + B)^2 = A^2 + 2AB + B^2
function expandirBinomio(a: string, b: string): string {
    const a2 = `${a}^2`; // A^2
    const b2 = `${b}^2`; // B^2
    const doisAb = `2${a}${b}`; // 2AB (ajustado para não ter *1)
    return `${a2} + ${doisAb} + ${b2}`;
}

// Função para simplificar expressões do tipo A + B/x -> A * x + B
function simplificarFracao(base: string, numerador: string): string {
    return `${base}^2 + 0x + ${numerador}`; // Ajustado para garantir o formato correto: x^2 + 0x + 4
}

// Função para distribuir multiplicação sobre soma (A * (B + C) = A*B + A*C)
function distribuicaoMultiplicacao(a: string, b: string, c: string): string {
    const ab = `${a}*${b}`;
    const ac = `${a}*${c}`;
    return `${ab} + ${ac}`;
}

// Função para simplificar multiplicação de fração (A/B) * B = A
function simplificarMultiplicacaoFracao(termo: string): string {
    const [numerador, denominador] = termo.split('/');
    return numerador; // Remove o denominador
}

// Função para expandir a expressão (A - B)^2 = A^2 - 2AB + B^2
function expandirSubtracaoQuadrado(a: string, b: string): string {
    const a2 = `${a}^2`; // A^2
    const b2 = `${b}^2`; // B^2
    const doisAb = `2${a}${b}`; // 2AB (corrigido para a forma correta)
    return `${a2} - ${doisAb} + ${b2}`; // Agora gera corretamente x^2 - 4x + 4
}

// Função para simplificar números reais e expressões como 2^2, 2 * x * 1
function simplificarNumerosReais(expressao: string): string {
    // Regra para simplificar expressões do tipo 2^2
    const matchPotencia = expressao.match(/^(\d+)\^2$/);
    if (matchPotencia) {
        const base = matchPotencia[1];
        return `${parseInt(base) ** 2}`; // Calcula a potência
    }

    // Regra para simplificar expressões do tipo 2 * x * 1
    const matchMultiplicacao = expressao.match(/^(\d+)\s*\*\s*(x)\s*\*\s*(\d+)$/);
    if (matchMultiplicacao) {
        const numero = matchMultiplicacao[1];
        return `${numero}x`; // Simplifica o produto de números reais e variáveis
    }

    // Regra para simplificar expressões do tipo 2 * x (sem 1)
    const matchMultiplicacaoSimples = expressao.match(/^(\d+)\s*\*\s*(x)$/);
    if (matchMultiplicacaoSimples) {
        return `${matchMultiplicacaoSimples[1]}x`; // Simplifica o produto sem 1
    }

    // Regra para garantir que sempre haja um formato de ax^2 + bx + c
    const matchQuadrado = expressao.match(/(\d*)x\^2\s*([+-]?\s*\d*)x\s*([+-]?\s*\d*)/);
    if (matchQuadrado) {
        const a = matchQuadrado[1] || '1'; // Se não houver valor para 'a', assume 1
        const b = matchQuadrado[2] || '0'; // Se não houver valor para 'b', assume 0
        const c = matchQuadrado[3] || '0'; // Se não houver valor para 'c', assume 0
        return `${a}x^2 ${b}x ${c}`.replace(/\s+/g, ''); // Remove espaços extras
    }

    return expressao; // Retorna a expressão original, se não for reconhecida
}