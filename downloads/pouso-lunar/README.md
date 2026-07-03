# Projeto: Pouso Lunar Interativo (Mostra de Ciências)

Este projeto simula o pouso do Módulo Lunar na Lua usando um Arduino, um motor de passo para controlar a descida física do módulo, e um botão que atua como o propulsor (combustão/freio).

---

## 🚀 Conceito do Brinquedo / Experimento

Para tornar a apresentação na Mostra de Ciências altamente interativa e educativa, sugerimos transformar o experimento em um **jogo físico em tempo real**:

1. **O Desafio**: O jogador deve pousar o módulo lunar suavemente na superfície da Lua.
2. **A Física**:
   - Há uma **gravidade lunar simulada** que puxa o módulo para baixo (aceleração constante).
   - Ao apertar o botão, o jogador ativa os **propulsores**, gerando uma força contrária que desacelera a queda (ou até faz o módulo subir).
3. **Combustível Limitado**: O jogador tem uma quantidade limitada de combustível. Se gastar tudo antes de chegar ao chão, o módulo cairá livremente.
4. **Condição de Vitória/Derrota**:
   - **Pouso Suave (Sucesso)**: O módulo atinge o solo com velocidade baixa (ex: menor que 2 m/s simulados).
   - **Colisão (Crash)**: O módulo atinge o solo com velocidade alta.

---

## 🛠️ Sugestões de Hardware e Estrutura Física

### 1. Motor de Passo e Carretel
* **Escolha do Motor**:
  * **28BYJ-48 com driver ULN2003**: É muito barato, fácil de programar e consome pouca energia. É ideal se o seu módulo lunar for leve (feito de papelão, PET ou impressão 3D leve).
  * **NEMA 17 com driver A4988 ou CNC Shield**: Recomendado se o módulo lunar for mais pesado ou se você quiser movimentos muito rápidos e precisos.
* **Carretel (Spool)**: Cole uma bobina de linha (pode ser carretel de costura ou impresso em 3D) diretamente no eixo do motor para enrolar/desenrolar a linha de pesca.
* **Linha de Pesca**: Use uma linha fina de nylon ou multifilamento (que não estique muito) para evitar oscilações.

### 2. O Módulo Lunar (Maquete)
* Faça um módulo leve usando **papel machê, garrafa PET, palitos ou impressão 3D**.
* **Dica de Efeito Visual**: Coloque um **LED de alto brilho (laranja/amarelo)** ou um pedaço de fita LED na base do módulo lunar. Passe os fios do LED junto com a linha de pesca (ou use fios esmaltados bem finos como a própria linha de suspensão, se forem resistentes o suficiente!) para que o LED acenda simulando o fogo do propulsor toda vez que o botão for pressionado.

### 3. Interface com o Usuário (IHM)
Para atrair a atenção do público na feira, adicione:
* **Botão de Arcade**: Um botão grande e colorido (estilo fliperama) para o controle do propulsor. Ele é robusto e dá uma sensação muito legal ao jogar.
* **Display OLED I2C (SSD1306) ou LCD 16x2**: Para mostrar em tempo real:
  * **Altitude** (metros simulados)
  * **Velocidade de queda** (m/s)
  * **Combustível restante** (%)
* **Buzzer Ativo/Passivo**:
  * Emite um som grave e contínuo simulando o motor quando o botão é pressionado.
  * Toca uma música de vitória (ex: fanfarra) no pouso suave.
  * Toca um som de explosão se colidir.

---

## 💻 Lógica de Programação (Software)

A lógica ideal roda uma simulação de física discreta (Euler Integration) no loop do Arduino:

1. **Leitura do Botão**: Verifica se o botão do propulsor está pressionado e se ainda há combustível.
2. **Cálculo da Física**:
   * Se botão pressionado e combustível > 0: `aceleração = gravidade - empuxo`; reduz combustível.
   * Se não: `aceleração = gravidade`.
   * `velocidade = velocidade + aceleração * dt`.
   * `altitude = altitude - velocidade * dt`.
3. **Controle do Motor de Passo**:
   * O motor deve se mover para a posição física correspondente à `altitude` calculada.
   * Por exemplo: se a altitude máxima é 100m (módulo no topo) e a mínima é 0m (chão), mapeamos isso para `0` a `PASSOS_TOTAIS` no motor.
4. **Verificação de Fim de Jogo**:
   * Se `altitude <= 0`:
     * Se `velocidade < VELOCIDADE_LIMITE` -> Pouso Suave!
     * Senão -> Colisão!

---

## 📂 Estrutura de Arquivos Criada

Para ajudar você a começar imediatamente, criamos os seguintes arquivos no diretório:
1. `README.md`: Este guia com as sugestões.
2. `pouso_lunar.ino`: O código-fonte completo para o Arduino, implementando a física, o motor de passo (usando a biblioteca padrão `Stepper.h`), o botão e um buzzer.
