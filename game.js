// Obtém o elemento canvas e seu contexto 2D
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');


// --- Variáveis do Pássaro ---
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 34,      // Largura da imagem do pássaro
    height: 24,     // Altura da imagem do pássaro
    radius: 15,     // Raio do círculo (fallback/colisão)
    vy: 0,
    gravity: 0.8,
    lift: -12
};


// --- Estado do Jogo ---
let isGameOver = true; // Começa como TRUE para esperar o primeiro pulo
let score = 0;


// --- Variáveis dos Canos ---
const pipes = [];
const pipeWidth = 50;
const pipeGap = 150;
const pipeSpeed = 2;
let frameCount = 0;
const pipeInterval = 120;


// --- Variáveis do Cenário ---
const groundHeight = 100; // Altura reservada para o chão (usada na colisão)
let groundX = 0;


// --- Carregando Imagens e Lógica de Início ---

const birdImage = new Image();
birdImage.src = 'assets/bird.png'; 

const bgImage = new Image();
// CORREÇÃO: Usando a extensão .jpg para o background
bgImage.src = 'assets/background.jpg'; 

// Lógica para garantir que o jogo só inicie após carregar as imagens
let imagesLoadedCount = 0;
const totalImages = 2;

function imageLoadComplete() {
    imagesLoadedCount++;
    if (imagesLoadedCount === totalImages) {
        gameLoop(); 
    }
}

// Atribui o handler de carregamento
birdImage.onload = imageLoadComplete;
bgImage.onload = imageLoadComplete;

// Fallback para caso as imagens já estejam em cache
if (birdImage.complete && bgImage.complete) {
    imageLoadComplete();
}


// ------------------- FUNÇÕES DE DESENHO -------------------

/** Desenha o fundo com a imagem ou uma cor sólida como fallback */
function drawBackground() {
    // Cor sólida como fallback
    ctx.fillStyle = '#70c5ce'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height); 

    // Desenha a imagem de fundo se estiver carregada
    if (bgImage.complete) {
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    }
}

/** Desenha o pássaro usando a imagem ou um círculo como fallback */
function drawBird() {
    if (birdImage.complete) {
        // Usa a imagem do pássaro
        ctx.drawImage(birdImage, 
            bird.x - bird.width / 2, 
            bird.y - bird.height / 2, 
            bird.width, 
            bird.height
        );
    } else {
        // Fallback: desenha um círculo amarelo
        ctx.beginPath();
        ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2); 
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.closePath();
    }
}

/** Desenha todos os canos com estilo (Correção/Ajuste Visual) */
function drawPipes() {
    for (let i = 0; i < pipes.length; i++) {
        const p = pipes[i];
        
        // 1. Cor principal do cano (verde)
        ctx.fillStyle = 'green';
        ctx.fillRect(p.x, p.y, pipeWidth, p.height);

        // 2. Borda do cano (preto)
        ctx.strokeStyle = '#000'; // Preto
        ctx.lineWidth = 3;        // Espessura da borda
        ctx.strokeRect(p.x, p.y, pipeWidth, p.height);
        
        // 3. Desenha a tampa do cano
        const capHeight = 15; // Altura da tampa
        const capWidth = pipeWidth + 6; // Largura um pouco maior que o cano
        const capX = p.x - 3; // Posição X um pouco para a esquerda
        
        ctx.fillStyle = 'darkgreen';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        
        if (p.isTop) {
            // Tampa do cano de cima (na parte inferior)
            ctx.fillRect(capX, p.y + p.height - capHeight, capWidth, capHeight);
            ctx.strokeRect(capX, p.y + p.height - capHeight, capWidth, capHeight);
        } else {
            // Tampa do cano de baixo (na parte superior)
            ctx.fillRect(capX, p.y, capWidth, capHeight);
            ctx.strokeRect(capX, p.y, capWidth, capHeight);
        }
    }
}

/** Desenha a pontuação na tela */
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText('Pontos: ' + score, 10, 30);
}

/** Desenha a mensagem de Game Over */
function drawGameOver() {
    ctx.fillStyle = 'red';
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 25);
    
    ctx.fillStyle = 'white';
    ctx.font = '25px Arial';
    ctx.fillText('Pontuação Final: ' + score, canvas.width / 2, canvas.height / 2 + 25);
    
    let message = (score === 0) ? 'Pressione ESPAÇO ou Clique para começar' : 'Pressione ESPAÇO para reiniciar';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2 + 65);

    ctx.textAlign = 'left'; 
}


// ------------------- FUNÇÕES DE LÓGICA E CONTROLE -------------------

/** Atualiza a posição do pássaro com gravidade */
function updateBird() {
    bird.vy += bird.gravity; 
    bird.y += bird.vy; 

    // Colisão com o teto
    if (bird.y - bird.height / 2 < 0) {
        bird.y = bird.height / 2;
        bird.vy = 0;
    }
}

/** Verifica se o pássaro colidiu com canos ou chão */
function checkCollision() {
    // 1. Colisão com o chão
    if (bird.y + bird.height / 2 >= canvas.height - groundHeight) { 
        isGameOver = true;
        return;
    }
    
    // 2. Colisão com os Canos
    for (let i = 0; i < pipes.length; i++) {
        const p = pipes[i];

        const birdLeft = bird.x - bird.width / 2;
        const birdRight = bird.x + bird.width / 2;
        const birdTop = bird.y - bird.height / 2;
        const birdBottom = bird.y + bird.height / 2;
        
        const pipeLeft = p.x;
        const pipeRight = p.x + pipeWidth;
        const pipeTop = p.y;
        const pipeBottom = p.y + p.height;

        if (birdRight > pipeLeft && birdLeft < pipeRight &&
            birdBottom > pipeTop && birdTop < pipeBottom) {
            
            isGameOver = true;
            return;
        }
    }
}


/** Calcula a pontuação */
function updateScore() {
    for (let i = 0; i < pipes.length; i++) {
        const p = pipes[i];
        if (!p.isTop && !p.scored) {
            if (bird.x > p.x + pipeWidth) {
                score++;
                p.scored = true;
            }
        }
    }
}

/** Reseta o jogo para o estado inicial */
function resetGame() {
    bird.y = canvas.height / 2;
    bird.vy = 0;
    pipes.length = 0;
    score = 0;
    frameCount = 0;
    isGameOver = false;
}

/** Cria um novo par de canos */
function createPipe() {
    const minHeight = 100;
    const maxHeight = canvas.height - groundHeight - pipeGap;
    const bottomPipeHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    // Cano de baixo
    pipes.push({
        x: canvas.width, 
        y: canvas.height - bottomPipeHeight, 
        height: bottomPipeHeight, 
        isTop: false, 
        scored: false 
    });
    
    // Cano de cima
    pipes.push({
        x: canvas.width,
        y: 0, 
        height: canvas.height - bottomPipeHeight - pipeGap, 
        isTop: true, 
        scored: false
    });
}

/** Move os canos e gerencia a criação/remoção */
function updatePipes() {
    frameCount++;
    
    if (frameCount % pipeInterval === 0) {
        createPipe();
    }
    
    for (let i = pipes.length - 1; i >= 0; i--) {
        const p = pipes[i];
        p.x -= pipeSpeed;
        
        if (p.x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }
}

/** Lida com o pulo do pássaro */
function flap() {
    if (!isGameOver) {
        bird.vy = bird.lift;
    }
}


// --- Lógica de Input ---

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (isGameOver) {
            resetGame();
        } else {
            flap();
        }
    }
});

canvas.addEventListener('click', () => {
    if (isGameOver) {
        resetGame();
    } else {
        flap();
    }
}); 


// --- O LOOP PRINCIPAL DO JOGO ---

function gameLoop() {
    requestAnimationFrame(gameLoop); 
    
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    
    drawBackground(); 

    if (isGameOver) {
        drawGameOver(); 
        if (score === 0) {
             drawBird();
        }
        return; 
    }
    
    // LÓGICA DO JOGO
    updateBird();
    updatePipes(); 
    checkCollision(); 
    updateScore();    
    
    // DESENHO ATIVO
    drawPipes();      
    drawBird();
    drawScore();
}