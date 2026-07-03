/*
 * ============================================================
 *  TEMPO DE REAÇÃO - Marie Curie Edition
 *  Brinquedo Educativo de Tempo de Reação
 * ============================================================
 *  Inspirado na cientista Marie Curie e sua pesquisa em
 *  radioatividade. Uma "amostra radioativa" (LED verde) fica
 *  protegida por duas portinhas servo-controladas.
 *  Quando as portas abrem, o usuário deve pressionar o botão
 *  o mais rápido possível para "se proteger da radiação"!
 *
 *  Hardware necessário:
 *    - Arduino Uno
 *    - 2x Servo Motor SG90
 *    - 1x LED Verde (5mm) - "composto radioativo"
 *    - 1x LED Vermelho (5mm) - sinal de alerta
 *    - 1x LED Amarelo (5mm) - standby
 *    - 1x Botão (push button) com pull-down
 *    - 1x Buzzer passivo
 *    - 1x Display OLED SSD1306 128x64 I2C (opcional)
 *    - Resistores: 220Ω (LEDs), 10kΩ (pull-down botão)
 *
 *  Pinos:
 *    - Servo Esquerdo  -> Pino 9
 *    - Servo Direito   -> Pino 10
 *    - LED Verde       -> Pino 6
 *    - LED Vermelho    -> Pino 7
 *    - LED Amarelo     -> Pino 8
 *    - Botão           -> Pino 2 (interrupt)
 *    - Buzzer          -> Pino 5
 *    - OLED SDA        -> A4
 *    - OLED SCL        -> A5
 *
 *  Versão: 1.0
 * ============================================================
 */

#include <Servo.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ============================================================
// CONFIGURAÇÃO DOS PINOS
// ============================================================
#define PINO_SERVO_ESQ     9
#define PINO_SERVO_DIR     10
#define PINO_LED_VERDE     6
#define PINO_LED_VERMELHO  7
#define PINO_LED_AMARELO   8
#define PINO_BOTAO         2
#define PINO_BUZZER        5

// ============================================================
// CONFIGURAÇÃO DO DISPLAY OLED
// ============================================================
#define LARGURA_OLED  128
#define ALTURA_OLED   64
#define RESET_OLED    -1
#define ADDR_OLED     0x3C

// ============================================================
// ÂNGULOS DOS SERVOS
// ============================================================
#define SERVO_FECHADO_ESQ   90
#define SERVO_ABERTO_ESQ    0
#define SERVO_FECHADO_DIR   90
#define SERVO_ABERTO_DIR    180

// ============================================================
// PARÂMETROS DO JOGO
// ============================================================
#define TEMPO_MIN_ESPERA    2000
#define TEMPO_MAX_ESPERA    7000
#define TEMPO_EXPOSICAO     3000

// Classificação do tempo de reação (ms)
#define REACAO_EXCELENTE    200
#define REACAO_OTIMO        300
#define REACAO_BOM          450
#define REACAO_REGULAR      600

// ============================================================
// VARIÁVEIS GLOBAIS
// ============================================================
Servo servoEsquerdo;
Servo servoDireito;
Adafruit_SSD1306 display(LARGURA_OLED, ALTURA_OLED, &Wire, RESET_OLED);

enum EstadoJogo {
  AGUARDANDO_INICIO,
  CONTAGEM_REGRESSIVA,
  ESPERANDO_ALEATORIA,
  PORTAS_ABERTAS,
  BOTAO_PRESSIONADO,
  MUITO_CEDO,
  TEMPO_ESGOTADO,
  MOSTRANDO_RESULTADO
};

EstadoJogo estadoAtual = AGUARDANDO_INICIO;

unsigned long tempoAbertura = 0;
unsigned long tempoReacao = 0;
unsigned long tempoUltimoEvento = 0;

unsigned long recordeGeral = 99999;
int totalPartidas = 0;
long somaTempos = 0;

volatile bool botaoFoiPressionado = false;
volatile unsigned long tempoPressao = 0;

unsigned long ultimoPiscar = 0;
bool ledAtivo = false;

// ============================================================
// SETUP
// ============================================================
void setup() {
  Serial.begin(9600);

  pinMode(PINO_LED_VERDE, OUTPUT);
  pinMode(PINO_LED_VERMELHO, OUTPUT);
  pinMode(PINO_LED_AMARELO, OUTPUT);
  pinMode(PINO_BOTAO, INPUT);
  pinMode(PINO_BUZZER, OUTPUT);

  servoEsquerdo.attach(PINO_SERVO_ESQ);
  servoDireito.attach(PINO_SERVO_DIR);

  fecharPortas();

  attachInterrupt(digitalPinToInterrupt(PINO_BOTAO), isrBotao, RISING);

  if (!display.begin(SSD1306_SWITCHCAPVCC, ADDR_OLED)) {
    Serial.println(F("OLED nao encontrado!"));
  } else {
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
  }

  animacaoInicio();
  Serial.println(F("=== TEMPO DE REACAO - Marie Curie Edition ==="));
  estadoAtual = AGUARDANDO_INICIO;
  mostrarTelaPrincipal();
}

// ============================================================
// LOOP PRINCIPAL
// ============================================================
void loop() {
  switch (estadoAtual) {

    case AGUARDANDO_INICIO:
      piscarLED(PINO_LED_AMARELO, 500);
      if (botaoFoiPressionado) {
        botaoFoiPressionado = false;
        contagemRegressiva();
        // Após contagem, espera aleatória
        botaoFoiPressionado = false;
        long esperaAleatoria = random(TEMPO_MIN_ESPERA, TEMPO_MAX_ESPERA);
        unsigned long inicioEspera = millis();
        while (millis() - inicioEspera < (unsigned long)esperaAleatoria) {
          if (botaoFoiPressionado) {
            botaoFoiPressionado = false;
            mostrarMuitoCedo();
            return;
          }
        }
        // Abre as portas!
        estadoAtual = PORTAS_ABERTAS;
        abrirPortas();
        tempoAbertura = millis();
        digitalWrite(PINO_LED_VERDE, HIGH);
        alertaRadiacao();
        mostrarPortasAbertas();
      }
      break;

    case PORTAS_ABERTAS:
      if (botaoFoiPressionado) {
        botaoFoiPressionado = false;
        tempoReacao = tempoPressao - tempoAbertura;
        fecharPortas();
        digitalWrite(PINO_LED_VERDE, LOW);
        somSucesso();
        registrarResultado(tempoReacao);
        mostrarResultado(tempoReacao);
        delay(3000);
        estadoAtual = AGUARDANDO_INICIO;
        botaoFoiPressionado = false;
        mostrarTelaPrincipal();
      } else if (millis() - tempoAbertura > TEMPO_EXPOSICAO) {
        fecharPortas();
        digitalWrite(PINO_LED_VERDE, LOW);
        somFalha();
        mostrarTempoEsgotado();
        delay(3000);
        estadoAtual = AGUARDANDO_INICIO;
        botaoFoiPressionado = false;
        mostrarTelaPrincipal();
      }
      break;

    default:
      break;
  }
}

// ============================================================
// SERVOS
// ============================================================
void abrirPortas() {
  Serial.println(F(">>> Abrindo portas!"));
  for (int a = 0; a <= 90; a += 5) {
    servoEsquerdo.write(SERVO_FECHADO_ESQ - a);
    servoDireito.write(SERVO_FECHADO_DIR + a);
    delay(15);
  }
}

void fecharPortas() {
  Serial.println(F("Fechando portas..."));
  for (int a = 90; a >= 0; a -= 5) {
    servoEsquerdo.write(SERVO_FECHADO_ESQ - a);
    servoDireito.write(SERVO_FECHADO_DIR + a);
    delay(15);
  }
  servoEsquerdo.write(SERVO_FECHADO_ESQ);
  servoDireito.write(SERVO_FECHADO_DIR);
}

// ============================================================
// INTERRUPÇÃO
// ============================================================
void isrBotao() {
  botaoFoiPressionado = true;
  tempoPressao = millis();
}

// ============================================================
// SOM
// ============================================================
void tocarNota(int freq, int dur) {
  tone(PINO_BUZZER, freq, dur);
  delay(dur + 20);
  noTone(PINO_BUZZER);
}

void alertaRadiacao() {
  for (int i = 0; i < 3; i++) {
    tone(PINO_BUZZER, 1000);
    digitalWrite(PINO_LED_VERMELHO, HIGH);
    delay(150);
    noTone(PINO_BUZZER);
    digitalWrite(PINO_LED_VERMELHO, LOW);
    delay(100);
  }
  tone(PINO_BUZZER, 1500);
  digitalWrite(PINO_LED_VERMELHO, HIGH);
  delay(500);
  noTone(PINO_BUZZER);
  digitalWrite(PINO_LED_VERMELHO, LOW);
}

void somSucesso() {
  tocarNota(523, 100);
  tocarNota(659, 100);
  tocarNota(784, 100);
  tocarNota(1047, 200);
}

void somFalha() {
  tocarNota(400, 200);
  tocarNota(300, 200);
  tocarNota(200, 400);
}

void somMuitoCedo() {
  tocarNota(200, 100);
  tocarNota(150, 200);
}

// ============================================================
// CONTAGEM REGRESSIVA
// ============================================================
void contagemRegressiva() {
  for (int i = 3; i >= 1; i--) {
    mostrarContagem(i);
    tocarNota(660, 100);
    digitalWrite(PINO_LED_AMARELO, HIGH);
    delay(400);
    digitalWrite(PINO_LED_AMARELO, LOW);
    delay(600);
  }
  mostrarContagem(0);
  tocarNota(880, 200);
  digitalWrite(PINO_LED_AMARELO, LOW);
}

// ============================================================
// LED
// ============================================================
void piscarLED(int pino, int intervalo) {
  if (millis() - ultimoPiscar > intervalo) {
    ultimoPiscar = millis();
    ledAtivo = !ledAtivo;
    digitalWrite(pino, ledAtivo ? HIGH : LOW);
  }
}

// ============================================================
// RESULTADOS
// ============================================================
void registrarResultado(unsigned long tempo) {
  totalPartidas++;
  somaTempos += tempo;
  if (tempo < recordeGeral) {
    recordeGeral = tempo;
    Serial.println(F("*** NOVO RECORDE! ***"));
  }
  Serial.print(F("Tempo: ")); Serial.print(tempo); Serial.println(F(" ms"));
  Serial.print(F("Recorde: ")); Serial.print(recordeGeral); Serial.println(F(" ms"));
}

String classificarTempo(unsigned long tempo) {
  if (tempo < REACAO_EXCELENTE) return "EXCELENTE!";
  if (tempo < REACAO_OTIMO)     return "OTIMO!";
  if (tempo < REACAO_BOM)       return "BOM!";
  if (tempo < REACAO_REGULAR)   return "REGULAR";
  return "LENTO...";
}

// ============================================================
// DISPLAY OLED
// ============================================================
void mostrarTelaPrincipal() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(10, 0);
  display.println(F("* MARIE CURIE *"));
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);
  display.setCursor(15, 14);
  display.println(F("TEMPO DE REACAO"));
  display.setCursor(20, 30);
  display.println(F("Pressione para"));
  display.setCursor(30, 42);
  display.println(F("iniciar!"));
  if (recordeGeral < 99999) {
    display.setCursor(0, 54);
    display.print(F("REC: "));
    display.print(recordeGeral);
    display.print(F("ms"));
  }
  display.display();
}

void mostrarContagem(int numero) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(20, 0);
  display.println(F("PREPARE-SE!"));
  display.drawLine(0, 12, 128, 12, SSD1306_WHITE);
  display.setTextSize(4);
  if (numero == 0) {
    display.setCursor(35, 22);
    display.println(F("JA!"));
  } else {
    display.setCursor(52, 22);
    display.println(numero);
  }
  display.display();
}

void mostrarPortasAbertas() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(10, 0);
  display.println(F("! RADIACAO !"));
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);
  display.setTextSize(2);
  display.setCursor(15, 18);
  display.println(F("APERTE O"));
  display.setCursor(20, 38);
  display.println(F("BOTAO!"));
  display.setTextSize(1);
  display.setCursor(25, 56);
  display.println(F(">> AGORA! <<"));
  display.display();
}

void mostrarResultado(unsigned long tempo) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(20, 0);
  display.println(F("RESULTADO:"));
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);
  display.setTextSize(2);
  display.setCursor(10, 14);
  display.print(tempo);
  display.setTextSize(1);
  display.println(F(" ms"));
  display.setCursor(5, 36);
  display.println(classificarTempo(tempo));
  if (tempo <= recordeGeral) {
    display.setCursor(10, 48);
    display.println(F(">> NOVO RECORDE! <<"));
  } else {
    display.setCursor(0, 48);
    display.print(F("REC: "));
    display.print(recordeGeral);
    display.print(F("ms"));
  }
  display.display();
}

void mostrarMuitoCedo() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(20, 0);
  display.println(F("MUITO CEDO!"));
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);
  display.setCursor(5, 20);
  display.println(F("Espere as portas"));
  display.setCursor(5, 32);
  display.println(F("abrirem antes de"));
  display.setCursor(5, 44);
  display.println(F("pressionar!"));
  display.display();
  somMuitoCedo();
  delay(2000);
  estadoAtual = AGUARDANDO_INICIO;
  botaoFoiPressionado = false;
  mostrarTelaPrincipal();
}

void mostrarTempoEsgotado() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(10, 0);
  display.println(F("CONTAMINADO!"));
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);
  display.setCursor(5, 18);
  display.println(F("Voce ficou exposto"));
  display.setCursor(5, 30);
  display.println(F("por muito tempo!"));
  display.setCursor(5, 44);
  display.println(F("Tente mais rapido!"));
  display.display();
  for (int i = 0; i < 3; i++) {
    digitalWrite(PINO_LED_VERMELHO, HIGH);
    delay(300);
    digitalWrite(PINO_LED_VERMELHO, LOW);
    delay(300);
  }
}

// ============================================================
// ANIMAÇÃO INICIAL
// ============================================================
void animacaoInicio() {
  digitalWrite(PINO_LED_AMARELO, HIGH); delay(300);
  digitalWrite(PINO_LED_VERMELHO, HIGH); delay(300);
  digitalWrite(PINO_LED_VERDE, HIGH); delay(300);
  abrirPortas();
  delay(500);
  fecharPortas();
  digitalWrite(PINO_LED_AMARELO, LOW);
  digitalWrite(PINO_LED_VERMELHO, LOW);
  digitalWrite(PINO_LED_VERDE, LOW);
  tocarNota(262, 150);
  tocarNota(294, 150);
  tocarNota(330, 150);
  tocarNota(349, 150);
  tocarNota(392, 300);

  display.clearDisplay();
  display.setTextSize(2);
  display.setCursor(5, 5);
  display.println(F("MARIE"));
  display.setCursor(5, 25);
  display.println(F("CURIE"));
  display.setTextSize(1);
  display.setCursor(5, 50);
  display.println(F("Reaction Time v1.0"));
  display.display();
  delay(2000);
}
