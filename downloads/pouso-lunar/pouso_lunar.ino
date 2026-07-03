/**
 * @file pouso_lunar.ino
 * @brief Código do jogo físico "Pouso Lunar" para Mostra de Ciências.
 * 
 * Simula física de gravidade lunar, empuxo do motor e combustível.
 * Controla um motor de passo (ex: 28BYJ-48) para mover fisicamente o módulo lunar.
 */

#include <Stepper.h>

// --- Configurações do Motor de Passo (28BYJ-48) ---
// O 28BYJ-48 precisa de 2048 passos por rotação completa.
const int PASSOS_POR_VOLTA = 2048;
// Pinos conectados ao driver ULN2003 (padrão IN1, IN2, IN3, IN4)
// ATENÇÃO: A biblioteca Stepper do Arduino funciona melhor com a ordem 1-3-2-4 para o 28BYJ-48:
Stepper meuMotor(PASSOS_POR_VOLTA, 8, 10, 9, 11);

// --- Configurações Físicas do Jogo ---
// Ajuste este valor baseado no tamanho do seu brinquedo (tamanho do carretel e curso de descida).
// Exemplo: se o carretel der 4 voltas completas para descer todo o módulo: 4 * 2048 = 8192 passos.
const long PASSOS_CURSO_TOTAL = 8192; 

// --- Configurações de Pinos ---
const int PIN_BOTAO_PROPULSOR = 2; // Botão de empuxo (conectar ao GND)
const int PIN_LED_FOGO = 7;        // LED na base do módulo (fogo do motor)
const int PIN_BUZZER = 6;          // Buzzer para efeitos sonoros

// --- Constantes da Simulação de Física ---
const float GRAVIDADE = 1.62;      // Gravidade lunar (m/s^2)
const float EMPUXO = 3.5;          // Aceleração para cima com o propulsor (m/s^2)
const float VELOCIDADE_LIMITE = 2.5; // Velocidade máxima (m/s) para um pouso seguro
const float FUEL_MAX = 100.0;      // Combustível máximo
const float TAXA_CONSUMO = 15.0;   // Quanto de combustível consome por segundo (%)

// --- Variáveis de Estado do Jogo ---
float altitude = 100.0;            // Altitude inicial simulada (100% no topo)
float velocidade = 0.0;            // Velocidade inicial (positiva para baixo)
float combustivel = FUEL_MAX;      // Combustível restante
long passosAtuais = 0;             // Posição física atual do motor (0 = topo)

enum EstadoJogo {
  PREPARANDO,
  DESCENTE,
  POUSOU_SUAVE,
  COLIDIU,
  REBOBINANDO
};
EstadoJogo estado = PREPARANDO;

unsigned long ultimoTempo = 0;

void setup() {
  Serial.begin(9600);
  
  pinMode(PIN_BOTAO_PROPULSOR, INPUT_PULLUP); // Usa resistor pull-up interno (botão conecta ao GND)
  pinMode(PIN_LED_FOGO, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  
  meuMotor.setSpeed(10); // Velocidade do motor em RPM (ajuste se necessário)
  
  Serial.println("--- POUSO LUNAR INICIADO ---");
  Serial.println("Aperte o botao para iniciar a descida!");
  
  // Efeito sonoro de inicialização
  tocarSomInicio();
}

void loop() {
  unsigned long tempoAtual = millis();
  float dt = (tempoAtual - ultimoTempo) / 1000.0; // tempo decorrido em segundos
  ultimoTempo = tempoAtual;
  
  // Evita saltos gigantescos se o loop demorar a iniciar
  if (dt > 0.1) dt = 0.1;

  switch (estado) {
    case PREPARANDO:
      // Espera o jogador apertar o botão pela primeira vez para iniciar
      if (digitalRead(PIN_BOTAO_PROPULSOR) == LOW) {
        delay(200); // Debounce rápido
        estado = DESCENTE;
        altitude = 100.0;
        velocidade = 0.0;
        combustivel = FUEL_MAX;
        passosAtuais = 0;
        Serial.println("Descendo...");
        tocarSomPropulsor(100);
      }
      break;

    case DESCENTE:
      simularFisica(dt);
      atualizarMotorFisico();
      verificarFimDeJogo();
      break;

    case POUSOU_SUAVE:
      Serial.println("PARABENS! Pouso suave realizado com sucesso!");
      digitalWrite(PIN_LED_FOGO, LOW);
      tocarSomVitoria();
      delay(3000); // Espera 3 segundos exibindo o resultado
      estado = REBOBINANDO;
      break;

    case COLIDIU:
      Serial.println("CRASH! Colisao detectada no solo lunar!");
      digitalWrite(PIN_LED_FOGO, LOW);
      tocarSomExplosao();
      delay(3000); // Espera 3 segundos exibindo o resultado
      estado = REBOBINANDO;
      break;

    case REBOBINANDO:
      Serial.println("Rebobinando modulo para o topo...");
      rebobinarModulo();
      estado = PREPARANDO;
      Serial.println("Pronto para o proximo piloto!");
      tocarSomInicio();
      break;
  }
}

// --- Funções Auxiliares ---

/**
 * @brief Executa a física de gravidade e propulsão.
 */
void simularFisica(float dt) {
  bool botaoPressionado = (digitalRead(PIN_BOTAO_PROPULSOR) == LOW);
  float aceleracao = GRAVIDADE;

  if (botaoPressionado && combustivel > 0.0) {
    aceleracao = GRAVIDADE - EMPUXO; // Empuxo age contra a gravidade
    combustivel -= TAXA_CONSUMO * dt;
    if (combustivel < 0) combustivel = 0;
    
    digitalWrite(PIN_LED_FOGO, HIGH); // Acende o fogo do motor
    tocarSomPropulsor(30);            // Ruído do motor
  } else {
    digitalWrite(PIN_LED_FOGO, LOW);
  }

  // Atualiza velocidade e altitude
  velocidade += aceleracao * dt;
  altitude -= velocidade * dt;

  // Limita a altitude para não subir acima do topo simulado
  if (altitude > 100.0) {
    altitude = 100.0;
    velocidade = 0.0; // Zera a velocidade se bater no teto
  }

  // Debug Serial - útil para depurar no computador ou conectar a um display
  Serial.print("Alt: "); Serial.print(altitude);
  Serial.print("m | Vel: "); Serial.print(velocidade);
  Serial.print("m/s | Comb: "); Serial.print(combustivel);
  Serial.println("%");
}

/**
 * @brief Move o motor de passo físico para corresponder à altitude simulada.
 */
void atualizarMotorFisico() {
  // Mapeia altitude (100 a 0) para passos físicos (0 a PASSOS_CURSO_TOTAL)
  // Se altitude é 100, passos alvo = 0. Se altitude é 0, passos alvo = PASSOS_CURSO_TOTAL.
  long passosAlvo = map(constrain(altitude, 0, 100), 100, 0, 0, PASSOS_CURSO_TOTAL);
  long diferenca = passosAlvo - passosAtuais;

  if (diferenca != 0) {
    // Move o motor um pouco na direção correta
    // Para não travar a simulação física, movemos em pequenos incrementos
    long passosParaMover = constrain(diferenca, -50, 50); 
    meuMotor.step(passosParaMover);
    passosAtuais += passosParaMover;
  }
}

/**
 * @brief Verifica se o módulo tocou o solo.
 */
void verificarFimDeJogo() {
  if (altitude <= 0.0) {
    altitude = 0.0;
    // Garante que o motor vá até o limite físico do chão
    long passosRestantes = PASSOS_CURSO_TOTAL - passosAtuais;
    if (passosRestantes > 0) {
      meuMotor.step(passosRestantes);
      passosAtuais = PASSOS_CURSO_TOTAL;
    }

    if (velocidade <= VELOCIDADE_LIMITE) {
      estado = POUSOU_SUAVE;
    } else {
      estado = COLIDIU;
    }
  }
}

/**
 * @brief Retorna o motor de passo lentamente ao ponto de partida (passosAtuais = 0).
 */
void rebobinarModulo() {
  // Move o motor de volta para a posição inicial 0
  // Rodando no sentido contrário (negativo)
  long passosParaSubir = -passosAtuais;
  
  // Rebobina em blocos pequenos para poder piscar um LED ou fazer som de subida
  while (passosAtuais > 0) {
    long bloco = min(passosAtuais, 100);
    meuMotor.step(-bloco);
    passosAtuais -= bloco;
    
    // Som suave de rebobinamento
    tone(PIN_BUZZER, 800, 10);
    delay(20);
  }
  
  passosAtuais = 0;
  digitalWrite(PIN_LED_FOGO, LOW);
}

// --- Efeitos Sonoros com Buzzer ---

void tocarSomInicio() {
  tone(PIN_BUZZER, 440, 100);
  delay(150);
  tone(PIN_BUZZER, 554, 100);
  delay(150);
  tone(PIN_BUZZER, 659, 300);
}

void tocarSomPropulsor(int duracao) {
  // Gera um ruído áspero de baixa frequência para simular combustão
  int freq = random(60, 120);
  tone(PIN_BUZZER, freq, duracao);
}

void tocarSomVitoria() {
  int melodia[] = {659, 659, 0, 659, 0, 523, 659, 0, 784};
  int duracoes[] = {100, 100, 50, 100, 50, 100, 100, 50, 200};
  for (int i = 0; i < 9; i++) {
    if (melodia[i] == 0) {
      delay(duracoes[i]);
    } else {
      tone(PIN_BUZZER, melodia[i], duracoes[i]);
      delay(duracoes[i] * 1.2);
    }
  }
}

void tocarSomExplosao() {
  for (int i = 0; i < 50; i++) {
    int freq = random(40, 150);
    tone(PIN_BUZZER, freq, 30);
    delay(20);
  }
  noTone(PIN_BUZZER);
}
