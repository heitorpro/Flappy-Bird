// Obtém o elemento canvas e seu contexto 2D
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Variáveis do Pássaro ---
const bird = {
    x: 50,          // Posição horizontal inicial
    y: canvas.height / 2, // Posição vertical (metade da tela)
    radius: 15,     // Tamanho do pássaro
    vy: 0,          // Velocidade vertical (inicia em 0)
    gravity: 0.8,   // Força da gravidade
    lift: -12       // Força do pulo (negativo para subir)
};

// --- Funções de Desenho ---

/** Desenha o pássaro (por enquanto, um círculo) */
function drawBird() {
    ctx.beginPath();
    // Desenha um círculo: x, y, raio, ângulo inicial, ângulo final
    ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2); 
    ctx.fillStyle = 'yellow';
    ctx.fill();
    ctx.closePath();
}

// --- Funções de Lógica do Jogo ---

/** Atualiza a posição do pássaro com gravidade */
function updateBird() {
    // 1. Aplica a gravidade à velocidade vertical
    bird.vy += bird.gravity; 
    
    // 2. Atualiza a posição Y
    bird.y += bird.vy; 

    // 3. Limita o movimento (colisão com o chão/teto) - Ação Game Over será adicionada depois
    if (bird.y + bird.radius > canvas.height) {
        // Bateu no chão
        bird.y = canvas.height - bird.radius;
        bird.vy = 0;
        // console.log("Game Over - Bateu no chão!"); // (Para teste inicial)
    }
    if (bird.y - bird.radius < 0) {
        // Bateu no teto
        bird.y = bird.radius;
        bird.vy = 0;
    }
}

/** Lida com o pulo do pássaro ao clicar/teclar */
function flap() {
    bird.vy = bird.lift;
}

// Escuta eventos de clique ou barra de espaço para fazer o pássaro pular
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { // 'Space' é a tecla de espaço
        flap();
    }
});
canvas.addEventListener('click', flap); // Faz pular com o clique do mouse

// --- O Loop Principal do Jogo ---

/** A função principal que roda repetidamente (o loop do jogo) */
function gameLoop() {
    // 1. Limpa a tela a cada quadro
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    
    // 2. Atualiza a lógica do jogo (posição do pássaro)
    updateBird();
    
    // 3. Desenha os elementos na tela
    drawBird();

    // Pede ao navegador para chamar 'gameLoop' novamente no próximo quadro
    requestAnimationFrame(gameLoop); 
}

// Inicia o jogo
gameLoop();