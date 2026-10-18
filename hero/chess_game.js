/**
 * ── CHESS.COM AUTHENTIC WEB CLIENT WITH HUGGING FACE AI INTEGRATION ──
 * Model Host: Hugging Face (FlameF0X/ChessSLM)
 * Models: ChessSLM-PM (2000+ Elo Fine-Tuned), ChessSLM-RL, ChessSLM, ChessSLM-Neo, ChessSLM-Nano, OMLCheT
 * + High-Speed Local Engine Fallback (Minimax with Alpha-Beta Pruning)
 * Features: Authentic Chess.com Board, High-Res Vector SVGs, Web Audio FX, Move Tree, Timers, Material Advantage
 */

(function () {
  'use strict';

  // ── SOUND SYNTHESIZER (Pure Web Audio API — Zero latency, no external mp3s needed) ──
  class ChessAudio {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playMove() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.06);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.07);
    }

    playCapture() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Low thud
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.1);

      gain.gain.setValueAtTime(0.65, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.11);

      // Wood click on top
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(400, t);
      clickOsc.frequency.exponentialRampToValueAtTime(120, t + 0.04);
      clickGain.gain.setValueAtTime(0.5, t);
      clickGain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
      clickOsc.connect(clickGain);
      clickGain.connect(this.ctx.destination);
      clickOsc.start(t);
      clickOsc.stop(t + 0.05);
    }

    playCheck() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      [780, 1170].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.07);
        gain.gain.setValueAtTime(0.28, t + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.07 + 0.14);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.07);
        osc.stop(t + idx * 0.07 + 0.15);
      });
    }

    playCastle() {
      this.playMove();
      setTimeout(() => this.playMove(), 80);
    }

    playGameEnd(isWin) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = isWin ? [523.25, 659.25, 783.99, 1046.50] : [440, 415.3, 392, 349.23];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + i * 0.12);
        gain.gain.setValueAtTime(0.3, t + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + i * 0.12);
        osc.stop(t + i * 0.12 + 0.38);
      });
    }
  }

  // ── LOCAL MINIMAX ENGINE (High-Speed Fallback / Offline Play) ──
  const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
  const PST_PAWN = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 27, 27, 10,  5,  5],
    [0,  0,  0, 25, 25,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ];
  const PST_KNIGHT = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ];
  const PST_BISHOP = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ];

  function evaluatePosition(game) {
    if (game.in_checkmate()) {
      return game.turn() === 'w' ? -99999 : 99999;
    }
    if (game.in_draw()) return 0;

    let score = 0;
    const board = game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p) continue;
        const val = PIECE_VALUES[p.type] || 0;
        let posVal = 0;
        const tableRow = p.color === 'w' ? r : 7 - r;
        if (p.type === 'p') posVal = PST_PAWN[tableRow][c];
        else if (p.type === 'n') posVal = PST_KNIGHT[tableRow][c];
        else if (p.type === 'b') posVal = PST_BISHOP[tableRow][c];

        const total = val + posVal;
        score += p.color === 'w' ? total : -total;
      }
    }
    return score;
  }

  function getBestLocalMove(game, depth = 2) {
    const isMaximizing = game.turn() === 'w';
    let bestMove = null;
    let bestScore = isMaximizing ? -Infinity : Infinity;

    const moves = game.moves({ verbose: true });
    // Sort captures first for alpha-beta efficiency
    moves.sort((a, b) => (b.captured ? 1 : 0) - (a.captured ? 1 : 0));

    for (const move of moves) {
      game.move(move);
      const score = minimax(game, depth - 1, -Infinity, Infinity, !isMaximizing);
      game.undo();

      if (isMaximizing ? score > bestScore : score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove ? bestMove.san : (moves[0] ? moves[0].san : null);
  }

  function minimax(game, depth, alpha, beta, isMaximizing) {
    if (depth === 0 || game.game_over()) {
      return evaluatePosition(game);
    }
    const moves = game.moves({ verbose: true });
    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const m of moves) {
        game.move(m);
        maxScore = Math.max(maxScore, minimax(game, depth - 1, alpha, beta, false));
        game.undo();
        alpha = Math.max(alpha, maxScore);
        if (beta <= alpha) break;
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (const m of moves) {
        game.move(m);
        minScore = Math.min(minScore, minimax(game, depth - 1, alpha, beta, true));
        game.undo();
        beta = Math.min(beta, minScore);
        if (beta <= alpha) break;
      }
      return minScore;
    }
  }

  // ── CHESS OPENINGS DIRECTORY ──
  const OPENINGS = [
    { pgn: 'e4 c5', name: 'Sicilian Defense' },
    { pgn: 'e4 e5 Nf3 Nc6 Bb5', name: 'Ruy Lopez' },
    { pgn: 'e4 e5 Nf3 Nc6 Bc4', name: 'Italian Game' },
    { pgn: 'e4 e6', name: 'French Defense' },
    { pgn: 'e4 c6', name: 'Caro-Kann Defense' },
    { pgn: 'd4 d5 c4', name: "Queen's Gambit" },
    { pgn: 'd4 Nf6 c4 g6', name: "King's Indian Defense" },
    { pgn: 'e4 e5', name: "Open Game" },
    { pgn: 'd4 d5', name: "Queen's Pawn Opening" },
    { pgn: 'c4', name: 'English Opening' },
    { pgn: 'Nf3', name: 'Réti Opening' }
  ];

  function detectOpening(moves) {
    const pgnSoFar = moves.map(m => m.san).join(' ');
    for (let i = OPENINGS.length - 1; i >= 0; i--) {
      if (pgnSoFar.startsWith(OPENINGS[i].pgn)) {
        return OPENINGS[i].name;
      }
    }
    return moves.length > 0 ? 'Standard Opening' : 'Starting Position';
  }

  // ── MAIN CHESS CLIENT CLASS ──
  class ChessComApp {
    constructor() {
      this.sound = new ChessAudio();
      this.game = new Chess();
      this.playerColor = 'w'; // 'w' or 'b'
      this.isFlipped = false;
      this.selectedSquare = null;
      this.legalMovesFromSelected = [];
      this.lastMove = null; // { from, to }
      this.isAiThinking = false;
      this.pendingPromotion = null; // { from, to }

      // Hugging Face Space configuration
      this.SPACE_ID = 'FlameF0X/ChessSLM';
      this.currentModel = 'ChessSLM-PM';
      this.hfClient = null;
      this.isConnectingHf = false;
      this.hfConnected = false;

      // Clocks & Timers
      this.timeControlSeconds = 600; // 10 min
      this.playerSeconds = 600;
      this.opponentSeconds = 600;
      this.timerInterval = null;

      // Drag & Drop tracking
      this.draggedSquare = null;
      this.dragGhost = null;

      this.initDom();
      this.connectHuggingFace();
    }

    // ── Build DOM ──
    initDom() {
      if (document.getElementById('chess-modal-overlay')) return;

      const overlay = document.createElement('div');
      overlay.id = 'chess-modal-overlay';
      overlay.innerHTML = `
        <div id="chess-modal-window">
          <!-- Header -->
          <div class="chess-header">
            <div class="chess-header-left">
              <div class="chess-logo-badge">
                <div class="chess-logo-icon">
                  <svg viewBox="0 0 24 24"><path d="M19 22H5v-2h14v2M17.5 13c-.9 0-1.7.5-2.1 1.2-.8-.4-1.9-.7-3.4-.7-1.5 0-2.6.3-3.4.7-.4-.7-1.2-1.2-2.1-1.2C5.1 13 4 14.1 4 15.5c0 1.2.8 2.2 2 2.4V19h12v-1.1c1.2-.2 2-1.2 2-2.4 0-1.4-1.1-2.5-2.5-2.5M12 2C9.8 2 8 3.8 8 6c0 1.5.8 2.8 2 3.5V11h4V9.5c1.2-.7 2-2 2-3.5 0-2.2-1.8-4-4-4z"/></svg>
                </div>
                <span>CHESS</span>
              </div>
              <div class="chess-hf-pill" id="chess-hf-badge" title="Powered by Hugging Face AI">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <span>HUGGING FACE AI</span>
              </div>
            </div>
            <div class="chess-header-right">
              <button class="chess-icon-btn" id="chess-sound-btn" title="Toggle Sound">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
              </button>
              <button class="chess-icon-btn chess-close-btn" id="chess-close-x" title="Close [Esc]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>

          <!-- Main Body -->
          <div class="chess-body">
            <!-- Left Stage: Board and Player Bars -->
            <div class="chess-stage">
              <!-- Top Opponent Card -->
              <div class="chess-player-strip" id="chess-top-player">
                <div class="chess-player-info">
                  <div class="chess-avatar bot-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                      <circle cx="12" cy="5" r="2"></circle>
                      <path d="M12 7v4"></path>
                      <line x1="8" y1="16" x2="8" y2="16"></line>
                      <line x1="16" y1="16" x2="16" y2="16"></line>
                    </svg>
                    <div class="chess-status-dot" id="chess-bot-dot"></div>
                  </div>
                  <div class="chess-name-col">
                    <div class="chess-name-row">
                      <span class="chess-player-name" id="chess-bot-name">ChessSLM-PM</span>
                      <span class="chess-badge-bot">BOT</span>
                      <span class="chess-player-rating" id="chess-bot-rating">(2050)</span>
                    </div>
                    <div class="chess-captured-box" id="chess-top-captured"></div>
                  </div>
                </div>
                <div class="chess-clock" id="chess-top-clock">10:00</div>
              </div>

              <!-- 8x8 Board Container -->
              <div class="chess-board-frame" id="chess-board-frame">
                <div class="chess-board-grid" id="chess-board-grid"></div>

                <!-- Pawn Promotion Overlay -->
                <div class="chess-promo-dialog" id="chess-promo-dialog" style="display:none;"></div>

                <!-- Game Over Overlay -->
                <div class="chess-gameover-overlay" id="chess-gameover-overlay">
                  <div class="chess-gameover-card">
                    <div class="chess-gameover-title" id="chess-gameover-title">Game Over</div>
                    <div class="chess-gameover-sub" id="chess-gameover-sub">Checkmate</div>
                    <button class="chess-btn-primary" id="chess-rematch-btn">New Game</button>
                  </div>
                </div>
              </div>

              <!-- Bottom Player Card -->
              <div class="chess-player-strip" id="chess-bottom-player">
                <div class="chess-player-info">
                  <div class="chess-avatar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div class="chess-name-col">
                    <div class="chess-name-row">
                      <span class="chess-player-name">You</span>
                      <span class="chess-player-rating">(1500)</span>
                    </div>
                    <div class="chess-captured-box" id="chess-bottom-captured"></div>
                  </div>
                </div>
                <div class="chess-clock active" id="chess-bottom-clock">10:00</div>
              </div>
            </div>

            <!-- Right Sidebar: Move List & Controls -->
            <div class="chess-sidebar">
              <!-- Status Header -->
              <div class="chess-status-banner">
                <div class="chess-status-headline">
                  <span id="chess-turn-status">Your turn (White)</span>
                </div>
                <div class="chess-opening-badge" id="chess-opening-badge">Starting Position</div>
              </div>

              <!-- Move History List -->
              <div class="chess-history-container" id="chess-history-list"></div>

              <!-- AI Commentary -->
              <div class="chess-ai-commentary" id="chess-commentary-box">
                <span class="chess-ai-commentary-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </span>
                <span id="chess-commentary-text">Select a piece to make your first move. Hugging Face neural chess model ready.</span>
              </div>

              <!-- Controls & Settings -->
              <div class="chess-controls-pane">
                <div class="chess-setting-row">
                  <span class="chess-setting-label">Opponent</span>
                  <select class="chess-select" id="chess-model-select">
                    <option value="ChessSLM-PM">ChessSLM-PM (~2050 Elo)</option>
                    <option value="ChessSLM-RL">ChessSLM-RL (RL-Tuned)</option>
                    <option value="ChessSLM">ChessSLM (Base 30M)</option>
                    <option value="ChessSLM-Neo">ChessSLM-Neo</option>
                    <option value="ChessSLM-Nano">ChessSLM-Nano</option>
                    <option value="OMLCheT">OMLCheT (Transformer)</option>
                    <option value="local">Local Engine (Instant)</option>
                  </select>
                </div>

                <div class="chess-setting-row">
                  <span class="chess-setting-label">Play As</span>
                  <select class="chess-select" id="chess-color-select">
                    <option value="w">White (Move First)</option>
                    <option value="b">Black (Move Second)</option>
                  </select>
                </div>

                <div class="chess-setting-row">
                  <span class="chess-setting-label">Timer</span>
                  <select class="chess-select" id="chess-timer-select">
                    <option value="600">10 Min (Rapid)</option>
                    <option value="300">5 Min (Blitz)</option>
                    <option value="180">3 Min (Bullet)</option>
                    <option value="0">Casual (No Clock)</option>
                  </select>
                </div>

                <div class="chess-action-bar">
                  <button class="chess-btn-primary" id="chess-new-game-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    <span>New Game</span>
                  </button>
                  <button class="chess-btn-secondary" id="chess-flip-btn" title="Flip Board">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                    <span>Flip</span>
                  </button>
                  <button class="chess-btn-secondary" id="chess-resign-btn" title="Resign">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                    <span>Resign</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="chess-drag-ghost"></div>
      `;

      document.body.appendChild(overlay);
      this.dragGhost = document.getElementById('chess-drag-ghost');

      // Bind events
      document.getElementById('chess-close-x').onclick = () => this.close();
      document.getElementById('chess-new-game-btn').onclick = () => this.startNewGame();
      document.getElementById('chess-rematch-btn').onclick = () => this.startNewGame();
      document.getElementById('chess-flip-btn').onclick = () => this.flipBoard();
      document.getElementById('chess-resign-btn').onclick = () => this.resign();

      document.getElementById('chess-sound-btn').onclick = () => {
        this.sound.enabled = !this.sound.enabled;
        document.getElementById('chess-sound-btn').style.opacity = this.sound.enabled ? '1' : '0.4';
      };

      document.getElementById('chess-model-select').onchange = (e) => {
        this.currentModel = e.target.value;
        const nameMap = {
          'ChessSLM-PM': { name: 'ChessSLM-PM', rating: '(2050)' },
          'ChessSLM-RL': { name: 'ChessSLM-RL', rating: '(2000)' },
          'ChessSLM': { name: 'ChessSLM', rating: '(1850)' },
          'ChessSLM-Neo': { name: 'ChessSLM-Neo', rating: '(1700)' },
          'ChessSLM-Nano': { name: 'ChessSLM-Nano', rating: '(1600)' },
          'OMLCheT': { name: 'OMLCheT', rating: '(1900)' },
          'local': { name: 'StockMinimax (Local)', rating: '(1800)' }
        };
        const info = nameMap[this.currentModel] || { name: this.currentModel, rating: '' };
        document.getElementById('chess-bot-name').textContent = info.name;
        document.getElementById('chess-bot-rating').textContent = info.rating;
      };

      document.getElementById('chess-color-select').onchange = (e) => {
        this.playerColor = e.target.value;
        this.isFlipped = (this.playerColor === 'b');
      };

      document.getElementById('chess-timer-select').onchange = (e) => {
        this.timeControlSeconds = parseInt(e.target.value, 10);
      };

      // Close on Esc
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
          this.close();
        }
      });

      // Drag global events
      window.addEventListener('pointermove', (e) => this.onPointerMove(e));
      window.addEventListener('pointerup', (e) => this.onPointerUp(e));
      window.addEventListener('pointercancel', (e) => this.onPointerUp(e));

      this.renderBoard();
    }

    // ── Hugging Face Client Connection ──
    async connectHuggingFace() {
      if (this.isConnectingHf || this.hfConnected) return;
      this.isConnectingHf = true;
      const statusPill = document.getElementById('chess-hf-badge');
      if (statusPill) statusPill.innerHTML = `<span>CONNECTING...</span>`;

      try {
        let ClientModule;
        try {
          ClientModule = await import('./gradio_client.js');
        } catch (e1) {
          ClientModule = await import('https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js');
        }
        const { Client } = ClientModule;
        this.hfClient = await Client.connect(this.SPACE_ID, {
          fetch: (url, opts = {}) => fetch(url, { ...opts, credentials: 'omit' })
        });
        this.hfConnected = true;
        if (statusPill) statusPill.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg><span>HUGGING FACE AI</span>`;
        this.setCommentary('Connected to Hugging Face neural chess engine. Ready to play!');
      } catch (err) {
        console.warn('Hugging Face connect failed, falling back to local engine:', err);
        this.hfConnected = false;
        if (statusPill) statusPill.innerHTML = `<span>LOCAL ENGINE</span>`;
        this.setCommentary('Hugging Face model connecting in background; local engine active.');
      } finally {
        this.isConnectingHf = false;
      }
    }

    open() {
      const overlay = document.getElementById('chess-modal-overlay');
      if (overlay) {
        overlay.classList.add('active');
        this.sound.init();
        const playBubble = document.getElementById('chessPlayBubble');
        if (playBubble) playBubble.style.display = 'none';
        if (this.game.history().length === 0) {
          this.startNewGame();
        } else {
          this.renderBoard();
        }
      }
    }

    close() {
      const overlay = document.getElementById('chess-modal-overlay');
      if (overlay) overlay.classList.remove('active');
      const playBubble = document.getElementById('chessPlayBubble');
      if (playBubble) playBubble.style.display = 'block';
      this.selectedSquare = null;
      this.legalMovesFromSelected = [];
      this.renderBoard();
    }

    // ── Start New Game ──
    async startNewGame() {
      this.game.reset();
      this.selectedSquare = null;
      this.legalMovesFromSelected = [];
      this.lastMove = null;
      this.isAiThinking = false;
      this.pendingPromotion = null;

      // Color choice
      const colorVal = document.getElementById('chess-color-select').value;
      this.playerColor = colorVal;
      this.isFlipped = (this.playerColor === 'b');

      // Hide game over overlay
      document.getElementById('chess-gameover-overlay').classList.remove('show');
      document.getElementById('chess-promo-dialog').style.display = 'none';

      // Reset clocks
      this.playerSeconds = this.timeControlSeconds;
      this.opponentSeconds = this.timeControlSeconds;
      this.startClockTimer();

      this.sound.playMove();
      this.updateStatus();
      this.renderBoard();
      this.renderHistory();

      // If player is Black, Hugging Face AI opens first as White
      if (this.playerColor === 'b') {
        await this.triggerAiMove(true);
      }
    }

    flipBoard() {
      this.isFlipped = !this.isFlipped;
      this.renderBoard();
    }

    resign() {
      if (this.game.game_over()) return;
      const winner = this.playerColor === 'w' ? 'Black' : 'White';
      this.showGameOver('Resignation', `${winner} wins by resignation.`);
      this.sound.playGameEnd(false);
    }

    // ── Clock Engine ──
    startClockTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.updateClocks();
      if (this.timeControlSeconds <= 0) return; // Untimed

      this.timerInterval = setInterval(() => {
        if (this.game.game_over() || !document.getElementById('chess-modal-overlay').classList.contains('active')) {
          return;
        }
        const isPlayerTurn = (this.game.turn() === this.playerColor);
        if (isPlayerTurn) {
          this.playerSeconds = Math.max(0, this.playerSeconds - 1);
          if (this.playerSeconds === 0) {
            this.showGameOver('Time Out', 'You ran out of time! Opponent wins.');
            this.sound.playGameEnd(false);
          }
        } else {
          this.opponentSeconds = Math.max(0, this.opponentSeconds - 1);
          if (this.opponentSeconds === 0) {
            this.showGameOver('Time Out', 'Opponent ran out of time! You win!');
            this.sound.playGameEnd(true);
          }
        }
        this.updateClocks();
      }, 1000);
    }

    updateClocks() {
      const fmt = (sec) => {
        if (sec <= 0 && this.timeControlSeconds <= 0) return '--:--';
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
      };

      const topClock = document.getElementById('chess-top-clock');
      const bottomClock = document.getElementById('chess-bottom-clock');
      if (!topClock || !bottomClock) return;

      topClock.textContent = fmt(this.opponentSeconds);
      bottomClock.textContent = fmt(this.playerSeconds);

      const isPlayerTurn = (this.game.turn() === this.playerColor);
      bottomClock.className = `chess-clock ${isPlayerTurn ? 'active' : ''} ${this.playerSeconds < 30 && this.timeControlSeconds > 0 ? 'low-time' : ''}`;
      topClock.className = `chess-clock ${!isPlayerTurn ? 'active' : ''} ${this.opponentSeconds < 30 && this.timeControlSeconds > 0 ? 'low-time' : ''}`;
    }

    // ── Render Board ──
    renderBoard() {
      const grid = document.getElementById('chess-board-grid');
      if (!grid) return;
      grid.innerHTML = '';

      const board = this.game.board(); // 8x8 array (r: 0-7, c: 0-7)
      const isPlayerTurn = (this.game.turn() === this.playerColor);

      // Find in-check King square if in check
      let inCheckSquare = null;
      if (this.game.in_check()) {
        const turn = this.game.turn();
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.type === 'k' && p.color === turn) {
              const file = String.fromCharCode(97 + c);
              const rank = 8 - r;
              inCheckSquare = `${file}${rank}`;
            }
          }
        }
      }

      // 8 ranks, 8 files
      for (let rIdx = 0; rIdx < 8; rIdx++) {
        for (let cIdx = 0; cIdx < 8; cIdx++) {
          const row = this.isFlipped ? 7 - rIdx : rIdx;
          const col = this.isFlipped ? 7 - cIdx : cIdx;
          const file = String.fromCharCode(97 + col);
          const rank = 8 - row;
          const sqId = `${file}${rank}`;

          const isLight = (row + col) % 2 === 0;
          const sqEl = document.createElement('div');
          sqEl.className = `chess-square ${isLight ? 'chess-sq-light' : 'chess-sq-dark'}`;
          sqEl.style.background = isLight ? '#ffffff' : '#9b6338';
          sqEl.style.backgroundColor = isLight ? '#ffffff' : '#9b6338';
          sqEl.dataset.square = sqId;

          // Highlights
          if (this.selectedSquare === sqId) {
            sqEl.classList.add('selected');
            sqEl.style.background = '#dab25a';
            sqEl.style.backgroundColor = '#dab25a';
          }
          if (this.lastMove && (this.lastMove.from === sqId || this.lastMove.to === sqId)) {
            sqEl.classList.add('last-move');
            sqEl.style.background = isLight ? '#ebd79b' : '#ab7242';
            sqEl.style.backgroundColor = isLight ? '#ebd79b' : '#ab7242';
          }
          if (inCheckSquare === sqId) {
            sqEl.classList.add('check-alert');
            sqEl.style.background = '#d13222';
            sqEl.style.backgroundColor = '#d13222';
          }

          // Coordinates on edge squares
          const showRankCoord = (cIdx === 0);
          const showFileCoord = (rIdx === 7);
          if (showRankCoord) {
            const rCoord = document.createElement('span');
            rCoord.className = 'chess-coord chess-coord-rank';
            rCoord.textContent = rank;
            sqEl.appendChild(rCoord);
          }
          if (showFileCoord) {
            const fCoord = document.createElement('span');
            fCoord.className = 'chess-coord chess-coord-file';
            fCoord.textContent = file;
            sqEl.appendChild(fCoord);
          }

          // Move hint indicators
          const isLegalTarget = this.legalMovesFromSelected.some(m => m.to === sqId);
          const piece = board[row][col];

          if (isLegalTarget) {
            if (piece) {
              const ring = document.createElement('div');
              ring.className = 'chess-hint-ring';
              sqEl.appendChild(ring);
            } else {
              const dot = document.createElement('div');
              dot.className = 'chess-hint-dot';
              sqEl.appendChild(dot);
            }
          }

          // Piece rendering
          if (piece) {
            const pieceKey = `${piece.color}${piece.type.toUpperCase()}`;
            const pieceEl = document.createElement('div');
            pieceEl.className = 'chess-piece';
            pieceEl.dataset.square = sqId;
            pieceEl.dataset.color = piece.color;
            pieceEl.innerHTML = window.CHESS_PIECE_SVGS ? (window.CHESS_PIECE_SVGS[pieceKey] || '') : '';

            // Interactive pointer handlers
            pieceEl.addEventListener('pointerdown', (e) => this.onPiecePointerDown(e, sqId));
            sqEl.appendChild(pieceEl);
          }

          // Square click handler
          sqEl.addEventListener('click', () => this.onSquareClick(sqId));

          grid.appendChild(sqEl);
        }
      }

      this.updateCapturedPieces();
    }

    // ── Square & Piece Interactions ──
    onSquareClick(sqId) {
      if (this.isAiThinking || this.game.game_over()) return;

      const piece = this.game.get(sqId);
      const isPlayerPiece = piece && piece.color === this.playerColor;

      // 1. If clicking already selected square, deselect
      if (this.selectedSquare === sqId) {
        this.selectedSquare = null;
        this.legalMovesFromSelected = [];
        this.renderBoard();
        return;
      }

      // 2. If clicking a destination square for a legal move
      const targetMove = this.legalMovesFromSelected.find(m => m.to === sqId);
      if (targetMove) {
        this.tryExecuteMove(targetMove);
        return;
      }

      // 3. If clicking a player piece, select it
      if (isPlayerPiece) {
        this.selectedSquare = sqId;
        this.legalMovesFromSelected = this.game.moves({ square: sqId, verbose: true });
        this.renderBoard();
        return;
      }

      // 4. Clicking empty square or opponent piece without move
      this.selectedSquare = null;
      this.legalMovesFromSelected = [];
      this.renderBoard();
    }

    onPiecePointerDown(e, sqId) {
      if (this.isAiThinking || this.game.game_over()) return;
      const piece = this.game.get(sqId);
      if (!piece || piece.color !== this.playerColor) return;

      // Select piece
      this.selectedSquare = sqId;
      this.legalMovesFromSelected = this.game.moves({ square: sqId, verbose: true });
      this.renderBoard();

      // Setup drag ghost
      this.draggedSquare = sqId;
      const pieceKey = `${piece.color}${piece.type.toUpperCase()}`;
      if (this.dragGhost && window.CHESS_PIECE_SVGS) {
        this.dragGhost.innerHTML = window.CHESS_PIECE_SVGS[pieceKey] || '';
        this.dragGhost.style.display = 'block';
        this.dragGhost.style.left = `${e.clientX}px`;
        this.dragGhost.style.top = `${e.clientY}px`;
      }

      const activeEl = document.querySelector(`.chess-piece[data-square="${sqId}"]`);
      if (activeEl) activeEl.classList.add('dragging-active');
    }

    onPointerMove(e) {
      if (!this.draggedSquare || !this.dragGhost) return;
      this.dragGhost.style.left = `${e.clientX}px`;
      this.dragGhost.style.top = `${e.clientY}px`;
    }

    onPointerUp(e) {
      if (!this.draggedSquare) return;
      const fromSq = this.draggedSquare;
      this.draggedSquare = null;
      if (this.dragGhost) this.dragGhost.style.display = 'none';

      // Find drop square under cursor
      const dropEl = document.elementFromPoint(e.clientX, e.clientY);
      const squareEl = dropEl ? dropEl.closest('.chess-square') : null;

      if (squareEl && squareEl.dataset.square) {
        const toSq = squareEl.dataset.square;
        if (toSq !== fromSq) {
          const targetMove = this.legalMovesFromSelected.find(m => m.to === toSq);
          if (targetMove) {
            this.tryExecuteMove(targetMove);
            return;
          }
        }
      }
      this.renderBoard();
    }

    // ── Execute Move & Promotion ──
    tryExecuteMove(moveObj) {
      // Check for pawn promotion (pawn moving to 8th rank for White or 1st rank for Black)
      if (moveObj.flags.includes('p') || (moveObj.piece === 'p' && (moveObj.to.endsWith('8') || moveObj.to.endsWith('1')))) {
        this.showPromotionDialog(moveObj);
        return;
      }
      this.applyPlayerMove(moveObj);
    }

    showPromotionDialog(moveObj) {
      const dialog = document.getElementById('chess-promo-dialog');
      const boardFrame = document.getElementById('chess-board-frame');
      if (!dialog || !boardFrame) return;

      dialog.innerHTML = '';
      const color = this.playerColor;
      const promoTypes = ['q', 'n', 'r', 'b'];

      promoTypes.forEach(t => {
        const opt = document.createElement('div');
        opt.className = 'chess-promo-opt';
        const key = `${color}${t.toUpperCase()}`;
        opt.innerHTML = window.CHESS_PIECE_SVGS ? window.CHESS_PIECE_SVGS[key] : t;
        opt.onclick = () => {
          dialog.style.display = 'none';
          this.applyPlayerMove({ ...moveObj, promotion: t });
        };
        dialog.appendChild(opt);
      });

      // Position dialog near the target square
      const targetSqEl = document.querySelector(`.chess-square[data-square="${moveObj.to}"]`);
      if (targetSqEl) {
        const rect = targetSqEl.getBoundingClientRect();
        const frameRect = boardFrame.getBoundingClientRect();
        dialog.style.left = `${rect.left - frameRect.left}px`;
        dialog.style.top = `${rect.top - frameRect.top}px`;
      }
      dialog.style.display = 'flex';
    }

    async applyPlayerMove(moveObj) {
      const move = this.game.move(moveObj);
      if (!move) return;

      this.selectedSquare = null;
      this.legalMovesFromSelected = [];
      this.lastMove = { from: move.from, to: move.to };

      // Play audio
      if (move.captured) this.sound.playCapture();
      else if (move.flags.includes('k') || move.flags.includes('q')) this.sound.playCastle();
      else this.sound.playMove();

      if (this.game.in_check()) this.sound.playCheck();

      this.renderBoard();
      this.renderHistory();
      this.updateStatus();

      if (this.checkGameTermination()) return;

      // Trigger AI Move
      await this.triggerAiMove(false, move.san);
    }

    // ── AI Engine Turn (Hugging Face with Local Fallback) ──
    async triggerAiMove(isNewGame = false, playerLastSan = null) {
      this.isAiThinking = true;
      const botDot = document.getElementById('chess-bot-dot');
      if (botDot) botDot.classList.add('thinking');
      this.setTurnStatus(`${document.getElementById('chess-bot-name').textContent} is thinking...`);

      let aiSan = null;

      // If user chose local engine or offline mode
      if (this.currentModel === 'local') {
        await new Promise(r => setTimeout(r, 260 + Math.random() * 200));
        aiSan = getBestLocalMove(this.game, 2);
      } else {
        // Attempt Hugging Face Space call
        try {
          if (!this.hfConnected && !this.isConnectingHf) {
            await this.connectHuggingFace();
          }

          if (this.hfClient) {
            // Setup a 9-second timeout promise to guarantee responsiveness
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('HF inference timeout')), 9000)
            );

            let predictPromise;
            if (isNewGame) {
              predictPromise = this.hfClient.predict('/new_game', {
                player_color_choice: this.playerColor === 'w' ? '⬜ White (move first)' : '⬛ Black (move second)',
                model_key: this.currentModel
              });
            } else {
              predictPromise = this.hfClient.predict('/make_player_move', {
                move_san: playerLastSan
              });
            }

            const result = await Promise.race([predictPromise, timeoutPromise]);
            aiSan = this.extractAiMove(result.data);

            if (result.data && result.data[4]) {
              const cleanMsg = result.data[4].replace(/<[^>]+>/g, '').trim();
              if (cleanMsg) this.setCommentary(cleanMsg);
            }
          }
        } catch (hfErr) {
          console.warn('Hugging Face model call encountered issue, using fast fallback engine:', hfErr);
          this.setCommentary('Hugging Face model took a moment; instant tactical engine responded.');
        }

        // If Hugging Face failed or returned null, use our high-speed minimax engine fallback
        if (!aiSan) {
          aiSan = getBestLocalMove(this.game, 2);
        }
      }

      // Execute AI Move on Board
      if (aiSan) {
        const move = this.game.move(aiSan);
        if (move) {
          this.lastMove = { from: move.from, to: move.to };
          if (move.captured) this.sound.playCapture();
          else if (move.flags.includes('k') || move.flags.includes('q')) this.sound.playCastle();
          else this.sound.playMove();

          if (this.game.in_check()) this.sound.playCheck();
        }
      }

      this.isAiThinking = false;
      if (botDot) botDot.classList.remove('thinking');

      this.renderBoard();
      this.renderHistory();
      this.updateStatus();
      this.checkGameTermination();
    }

    // ── Extract AI Move from Hugging Face Gradio output ──
    extractAiMove(data) {
      if (!data || !Array.isArray(data)) return null;
      const legalMoves = this.game.moves();

      // Strategy 1: regex from message in data[4]
      const msg = typeof data[4] === 'string' ? data[4] : '';
      const match = msg.match(/(?:plays|moves|opens with)\s+\*\*([a-zA-Z0-9+#=\-]+)\*\*/i);
      if (match && legalMoves.includes(match[1])) {
        return match[1];
      }

      // Strategy 2: parse board rows from data[0] (ASCII board)
      if (typeof data[0] === 'string') {
        const preMatch = data[0].match(/<pre>([\s\S]*?)<\/pre>/);
        if (preMatch) {
          const lines = preMatch[1].trim().split('\n');
          let fenRows = [];
          for (let i = 0; i < 8; i++) {
            if (!lines[i]) continue;
            let row = lines[i].trim().replace(/\s+/g, '');
            let fenRow = '', emptyCount = 0;
            for (let char of row) {
              if (char === '.') { emptyCount++; }
              else {
                if (emptyCount > 0) { fenRow += emptyCount; emptyCount = 0; }
                fenRow += char;
              }
            }
            if (emptyCount > 0) fenRow += emptyCount;
            fenRows.push(fenRow);
          }
          const targetFenRows = fenRows.join('/');
          for (const m of this.game.moves({ verbose: true })) {
            this.game.move(m);
            const matches = (this.game.fen().split(' ')[0] === targetFenRows);
            this.game.undo();
            if (matches) return m.san;
          }
        }
      }

      // Strategy 3: Check data[3] (HTML move table) for the latest SAN
      if (typeof data[3] === 'string') {
        const spans = data[3].match(/<span[^>]*>([a-zA-Z0-9+#=\-]+)<\/span>/g);
        if (spans && spans.length > 0) {
          const lastSpan = spans[spans.length - 1];
          const candidate = lastSpan.replace(/<[^>]+>/g, '').trim();
          if (legalMoves.includes(candidate)) return candidate;
        }
      }

      return null;
    }

    // ── Status & History Updates ──
    updateStatus() {
      const isPlayerTurn = (this.game.turn() === this.playerColor);
      let text = isPlayerTurn ? `Your turn (${this.playerColor === 'w' ? 'White' : 'Black'})` : `${document.getElementById('chess-bot-name').textContent}'s turn`;
      if (this.game.in_check()) text += ' — Check!';
      this.setTurnStatus(text);

      const opening = detectOpening(this.game.history({ verbose: true }));
      document.getElementById('chess-opening-badge').textContent = opening;
    }

    setTurnStatus(msg) {
      const el = document.getElementById('chess-turn-status');
      if (el) el.textContent = msg;
    }

    setCommentary(msg) {
      const el = document.getElementById('chess-commentary-text');
      if (el) el.textContent = msg;
    }

    checkGameTermination() {
      if (!this.game.game_over()) return false;
      if (this.timerInterval) clearInterval(this.timerInterval);

      if (this.game.in_checkmate()) {
        const winner = this.game.turn() === 'w' ? 'Black' : 'White';
        const isPlayerWin = (this.game.turn() !== this.playerColor);
        this.showGameOver('Checkmate!', `${winner} wins by checkmate.`);
        this.sound.playGameEnd(isPlayerWin);
      } else if (this.game.in_stalemate()) {
        this.showGameOver('Draw', 'Game drawn by stalemate.');
        this.sound.playGameEnd(false);
      } else if (this.game.in_threefold_repetition()) {
        this.showGameOver('Draw', 'Draw by threefold repetition.');
        this.sound.playGameEnd(false);
      } else if (this.game.insufficient_material()) {
        this.showGameOver('Draw', 'Draw by insufficient material.');
        this.sound.playGameEnd(false);
      } else if (this.game.in_draw()) {
        this.showGameOver('Draw', 'Game drawn.');
        this.sound.playGameEnd(false);
      }
      return true;
    }

    showGameOver(title, subtitle) {
      const overlay = document.getElementById('chess-gameover-overlay');
      const titleEl = document.getElementById('chess-gameover-title');
      const subEl = document.getElementById('chess-gameover-sub');
      if (overlay && titleEl && subEl) {
        titleEl.textContent = title;
        subEl.textContent = subtitle;
        overlay.classList.add('show');
      }
    }

    renderHistory() {
      const historyList = document.getElementById('chess-history-list');
      if (!historyList) return;
      historyList.innerHTML = '';

      const moves = this.game.history();
      for (let i = 0; i < moves.length; i += 2) {
        const row = document.createElement('div');
        row.className = 'chess-move-row';

        const numSpan = document.createElement('span');
        numSpan.className = 'chess-move-num';
        numSpan.textContent = `${Math.floor(i / 2) + 1}.`;
        row.appendChild(numSpan);

        const whiteMove = document.createElement('span');
        whiteMove.className = 'chess-move-san';
        whiteMove.textContent = moves[i];
        if (i === moves.length - 1) whiteMove.classList.add('active-move');
        row.appendChild(whiteMove);

        if (moves[i + 1]) {
          const blackMove = document.createElement('span');
          blackMove.className = 'chess-move-san';
          blackMove.textContent = moves[i + 1];
          if (i + 1 === moves.length - 1) blackMove.classList.add('active-move');
          row.appendChild(blackMove);
        }

        historyList.appendChild(row);
      }
      historyList.scrollTop = historyList.scrollHeight;
    }

    updateCapturedPieces() {
      const whiteCaptured = [];
      const blackCaptured = [];
      let whiteScore = 0;
      let blackScore = 0;

      const initialPieces = { p: 8, n: 2, b: 2, r: 2, q: 1 };
      const currentPieces = { w: { p: 0, n: 0, b: 0, r: 0, q: 0 }, b: { p: 0, n: 0, b: 0, r: 0, q: 0 } };

      const board = this.game.board();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = board[r][c];
          if (p && p.type !== 'k') {
            currentPieces[p.color][p.type]++;
            const val = PIECE_VALUES[p.type] / 100;
            if (p.color === 'w') whiteScore += val;
            else blackScore += val;
          }
        }
      }

      const types = ['p', 'n', 'b', 'r', 'q'];
      types.forEach(t => {
        // Pieces captured by White (missing Black pieces)
        const bLost = initialPieces[t] - currentPieces.b[t];
        for (let i = 0; i < bLost; i++) whiteCaptured.push(`b${t.toUpperCase()}`);

        // Pieces captured by Black (missing White pieces)
        const wLost = initialPieces[t] - currentPieces.w[t];
        for (let i = 0; i < wLost; i++) blackCaptured.push(`w${t.toUpperCase()}`);
      });

      const topCapturedBox = document.getElementById('chess-top-captured');
      const bottomCapturedBox = document.getElementById('chess-bottom-captured');

      const isBotWhite = (this.playerColor === 'b');
      const botCaptured = isBotWhite ? whiteCaptured : blackCaptured;
      const playerCaptured = isBotWhite ? blackCaptured : whiteCaptured;
      const diff = (isBotWhite ? whiteScore - blackScore : blackScore - whiteScore);

      const renderTray = (box, pieceKeys, diffAdv) => {
        if (!box) return;
        box.innerHTML = '';
        pieceKeys.forEach(k => {
          const span = document.createElement('span');
          span.className = 'chess-captured-icon';
          span.innerHTML = window.CHESS_PIECE_SVGS ? window.CHESS_PIECE_SVGS[k] : '';
          box.appendChild(span);
        });
        if (diffAdv > 0) {
          const d = document.createElement('span');
          d.className = 'diff';
          d.textContent = `+${diffAdv}`;
          box.appendChild(d);
        }
      };

      renderTray(topCapturedBox, botCaptured, diff);
      renderTray(bottomCapturedBox, playerCaptured, -diff);
    }
  }

  // ── Global Singleton & Public API ──
  let chessApp = null;

  function initApp() {
    if (!chessApp) {
      chessApp = new ChessComApp();
    }
  }

  window.openChessModal = function () {
    initApp();
    if (chessApp) chessApp.open();
  };

  window.closeChessModal = function () {
    if (chessApp) chessApp.close();
  };

  // Pre-initialize on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
