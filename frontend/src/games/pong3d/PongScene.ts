import { t } from "../../utils/translator";

import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  DirectionalLight,
  ShadowGenerator,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Color4,
  GlowLayer,
  Texture,
  ParticleSystem,
  Mesh
} from "@babylonjs/core";

export type PongOptions = {
  mode: 'local' | 'ai' | 'tournament';
  speed: number;
  scoreToWin: number;
  paddleSize: number;
  theme: number;
  tournamentContext?: {
    p1: {
      id: string;
      username: string;
      source: 'friend' | 'guest';
      avatar?: string;
    };
    p2: {
      id: string;
      username: string;
      source: 'friend' | 'guest';
      avatar?: string;
    };
    tournamentId: string;
    nextPhase: 'semiFinal' | 'final';
  };
};


// 2205 추가

//  가장 간단한 방법: 브라우저 전역 객체에 guestIndex 저장
if (!(window as any).guestIndex) {
  (window as any).guestIndex = 0;
}

//  1. sessionStorage에서 복원
const storedMap = sessionStorage.getItem("guestIdMap");
const guestIdMap = storedMap
  ? new Map<string, number>(JSON.parse(storedMap))
  : new Map<string, number>();

//  2. guestIndex는 맵의 크기로부터 유도
let guestIndex = guestIdMap.size;

function getGuestNumericId(guestStringId: string | number): number {
  const rawId = guestStringId;
  guestStringId = String(guestStringId);

  if (!guestIdMap.has(guestStringId)) {
    console.log(`[DEBUG] Mapping new guest:`, {
      rawId,
      typeofRawId: typeof rawId,
      stringId: guestStringId,
      guestIndex
    });

    const id = -10000 - guestIndex++;
    guestIdMap.set(guestStringId, id);
    
    //  3. 매핑 결과를 sessionStorage에 다시 저장
    sessionStorage.setItem("guestIdMap", JSON.stringify(Array.from(guestIdMap.entries())));
  } else {
    console.log('[GUEST ID MAP] Existing guest:', guestStringId);
  }

  return guestIdMap.get(guestStringId)!;
}


export async function createPongScene(
  canvas: HTMLCanvasElement,
  options: PongOptions,
  returnButton: HTMLButtonElement, // bouton reçu depuis l'extérieur
): Promise<any> {
  const isAI = options.mode === 'ai';
  const isTournament = options.mode === 'tournament';
  const isLocal = options.mode === 'local';
  console.log("[DEBUG] Game mode:", options.mode); // 2305 디버깅 추가

  // 🎨 Définir les styles selon le thème choisi
  let paddleColor1 = new Color3(0.6, 0.2, 0.8);
  let paddleColor2 = new Color3(0.2, 0.4, 1);
  let ballColor = new Color3(1, 0.84, 0);
  let groundTexturePath = "/assets/Pong/pong_mat1.jpg";
  let wallColorDiffuse = new Color3(0.05, 0.05, 0.3); // Couleur par défaut
  let wallColorEmissive = new Color3(0.1, 0.1, 0.4);

  switch (options.theme) {
    case 1: // Énergie
      paddleColor1 = new Color3(1, 0.3, 0.3);
      paddleColor2 = new Color3(1, 1, 0.3);
      ballColor = new Color3(0.3, 1, 0.3);
      groundTexturePath = "/assets/Pong/pong_mat3.jpg";
      wallColorDiffuse = new Color3(0.4, 0.1, 0.1);     // Rouge foncé
      wallColorEmissive = new Color3(0.8, 0.2, 0.2);    // Rouge lumineux
      break;
    case 2: // Nébuleuse
      paddleColor1 = new Color3(0.2, 0.6, 1);
      paddleColor2 = new Color3(0.8, 0.3, 1);
      ballColor = new Color3(0.7, 0.9, 1);
      groundTexturePath = "/assets/Pong/pong_mat2.jpg";
      wallColorDiffuse = new Color3(0.2, 0.3, 0.5);     // Bleu profond
      wallColorEmissive = new Color3(0.3, 0.4, 0.7);    // Bleu lumineux
      break;
    default: // Classique
      // Garde les couleurs définies par défaut
      break;
  }


  let tournamentContext = options.tournamentContext;

  // 🔁 Si on ne reçoit pas via options, on vérifie dans sessionStorage (fallback)
  if (!tournamentContext && isTournament) {
    const matchData = sessionStorage.getItem("currentMatch");
    if (matchData) {
      try {
        tournamentContext = JSON.parse(matchData);
        if (tournamentContext?.p1) {
          tournamentContext.p1.id = String(tournamentContext.p1.id);
        }
        if (tournamentContext?.p2) {
          tournamentContext.p2.id = String(tournamentContext.p2.id);
        }
  
      } catch (e) {
        console.warn("Erreur parsing currentMatch:", e);
      }
    }
  }
  
  // 2105 추가
  const opponentIsAI = !tournamentContext && isAI;


  const scoreBoard = document.getElementById("scoreBoard");
  const announce = document.getElementById("announce");

  // NEW NAME CONTAINERS

const style = document.createElement('style');
style.textContent = `
  .player-box {
    position: absolute;
    top: 30px; /* ⬆ More padding from the top */
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 100;
  }

  .player-box.left {
    left: 30px; /* ⬅ More padding from left edge */
  }

  .player-box.right {
    right: 30px; /* ➡ More padding from right edge */
  }

  .player-avatar {
    width: 96px;  /* ⬆ Bigger */
    height: 96px; /* ⬆ Bigger */
    border-radius: 9999px;
    object-fit: cover;
    border: 4px solid white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4); /* Stronger shadow */
  }

  .player-name {
    margin-top: 10px;
    font-size: 1.25rem; /* ⬆ Larger text */
    font-weight: 700;
    color: white;
    text-align: center;
    text-shadow: 0 2px 6px rgba(0,0,0,0.6); /* Better contrast */
  }
`;
document.head.appendChild(style);


const canvasContainer = canvas.parentElement!;
canvasContainer.style.position = 'relative';

// Profile picture fallback logic
const userImage = sessionStorage.getItem("profilePicture") || "/assets/profile-pictures/default.jpg";
const userName = sessionStorage.getItem("username") || "You";

const opponentImage = isAI
  ? "/assets/guest-avatars/bigstar.jpg"
  : "/assets/guest-avatars/moon.jpg";
const opponentName = isAI ? "AI" : t('player.guest');

// USER box (⟵ now on the LEFT)
const playerBox = document.createElement('div');
playerBox.className = 'player-box left';

const playerAvatar = document.createElement('img');
playerAvatar.className = 'player-avatar';
playerAvatar.src = tournamentContext?.p1?.avatar || userImage;

const playerLabel = document.createElement('div');
playerLabel.className = 'player-name';
playerLabel.textContent = tournamentContext?.p1?.username || userName;

playerBox.appendChild(playerAvatar);
playerBox.appendChild(playerLabel);

// OPPONENT box (⟶ now on the RIGHT)
const opponentBox = document.createElement('div');
opponentBox.className = 'player-box right';

const opponentAvatar = document.createElement('img');
opponentAvatar.className = 'player-avatar';
opponentAvatar.src = tournamentContext?.p2?.avatar || opponentImage;

const opponentLabel = document.createElement('div');
opponentLabel.className = 'player-name';
opponentLabel.textContent = tournamentContext?.p2?.username || opponentName;

opponentBox.appendChild(opponentAvatar);
opponentBox.appendChild(opponentLabel);

// Add to canvas container
canvasContainer.appendChild(playerBox);
canvasContainer.appendChild(opponentBox);


  // END OF NAME CONTAINERS


  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0, 0, 0, 1.0);

  // 2205 추가
  // 현재 경기 ID
  let gameId: number | null = null;

  async function startMatch() {
    const token = sessionStorage.getItem("token");

    let user_id: number | undefined;
    let opponent_id: number;

    if (tournamentContext) {
      const p1 = tournamentContext.p1;
      const p2 = tournamentContext.p2;

      console.log("[TYPE CHECK] p1.id =", p1.id, typeof p1.id); // 

      // user_id 결정
      // user_id = p1.source === 'friend'
      //   ? Number(p1.id)
      //   : getGuestNumericId(String(p1.id)); // guest일 경우 고유 음수 ID 부여

     // guest일 때만 getGuestNumericId 적용
      user_id = p1.source === 'guest'
      ? getGuestNumericId(p1.id)
      : Number(p1.id);

      // opponent_id 결정
      opponent_id = p2.source === 'guest'
        ? getGuestNumericId(p2.id)
        : Number(p2.id);

    } else {
      // 일반 모드 (1vs1, AI)
      user_id = Number(sessionStorage.getItem("userId"));
      opponent_id = isAI ? 2 : 3;
    }

    const body = user_id !== undefined
      ? { user_id, opponent_id }
      : { opponent_id }; // 게스트 vs 게스트일 때 user_id 생략

    console.log("[START MATCH] user_id:", user_id);
    console.log("[START MATCH] opponent_id:", opponent_id);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(user_id !== undefined && user_id >= 0 && token
          ? { Authorization: `Bearer ${token}` }
          : {})
      };
    
      const response = await fetch("/api/match/start", {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });
    
      const data = await response.json();
      gameId = data.gameId;
      console.log("[MATCH STARTED]", { gameId, user_id, opponent_id });
    } catch (err) {
      console.error("❌ Error starting match:", err);
    }
  }

  await startMatch();  
// 1705 일단 여기 위에까지 추가임 \\

// ----- 24 added ---- \\
async function endMatch(score1: number, score2: number) {
  if (!gameId) {
    console.warn("[END MATCH] gameId가 null이므로 요청 중단됨");
    return;
  }

  let user_id: number | undefined;
  let opponent_id: number;

  if (tournamentContext) {
    const p1 = tournamentContext.p1;
    const p2 = tournamentContext.p2;
    user_id = p1.source === 'friend' ? Number(p1.id) : getGuestNumericId(p1.id);
    opponent_id = p2.source === 'friend' ? Number(p2.id) : getGuestNumericId(p2.id);
  } else {
    user_id = Number(sessionStorage.getItem("userId"));
    opponent_id = isAI ? 2 : 3;
  }

  const isGuestVsGuest = user_id < 0 && opponent_id < 0;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = sessionStorage.getItem("token");
  if (!isGuestVsGuest && token) headers["Authorization"] = `Bearer ${token}`;

  const payload = {
    gameId,
    user_id,
    opponent_id,
    score1,
    score2
  };

  console.log("[END MATCH] 요청 전 payload 확인:", payload);

  try {
    const res = await fetch("/api/match/end", {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    console.log("[MATCH ENDED RESPONSE]", result);

    if (!res.ok) {
      console.error("[END MATCH] 서버 응답 실패", res.status, result);
    }
  } catch (err) {
    console.error("❌ Error ending match (exception):", err);
  }
}
// ----- ^ 24 added ^ ---- \\

  const SCORE_LIMIT = options.scoreToWin;
  let scorePlayer = 0;
  let scoreIA = 0;
  let gameOver = false;

  function resizeCanvas() {
    if (canvas.parentElement) {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      engine.resize();
    }
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const camera = new ArcRotateCamera("camera", 0, Math.PI / 4.5, 12, Vector3.Zero(), scene);
  camera.setPosition(new Vector3(0, 8, -6));
  camera.attachControl(canvas, true);
  camera.inputs.clear();

  new HemisphericLight("hemiLight", new Vector3(0, 1, 0), scene);
  const dirLight = new DirectionalLight("dirLight", new Vector3(-1, -3, -1), scene);
  dirLight.position = new Vector3(0, 6, -4);
  dirLight.intensity = 0.6;

  const shadowGen = new ShadowGenerator(1024, dirLight);
  shadowGen.useExponentialShadowMap = true;

  const glow = new GlowLayer("glow", scene);
  glow.intensity = 0.6;

  const paddleMat1 = new StandardMaterial("paddleMat1", scene);
  paddleMat1.diffuseColor = paddleColor1;
  paddleMat1.emissiveColor = paddleColor1;

  const paddleMat2 = new StandardMaterial("paddleMat2", scene);
  paddleMat2.diffuseColor = paddleColor2;
  paddleMat2.emissiveColor = paddleColor2;

  const ballMat = new StandardMaterial("ballMat", scene);
  ballMat.diffuseColor = ballColor;
  ballMat.emissiveColor = ballColor;

  const groundMat = new StandardMaterial("groundMat", scene);
  groundMat.diffuseTexture = new Texture(groundTexturePath, scene);
  groundMat.specularColor = new Color3(0, 0, 0);

  const ground = MeshBuilder.CreateGround("ground", { width: 9.6, height: 6 }, scene);
  ground.material = groundMat;

  const paddle1 = MeshBuilder.CreateBox("paddle1", { width: 0.2, height: 0.4, depth: 1 }, scene);
  paddle1.position.set(-4.6, 0.2, 0);
  paddle1.material = paddleMat1;

  const paddle2 = MeshBuilder.CreateBox("paddle2", { width: 0.2, height: 0.4, depth: 1 }, scene);
  paddle2.position.set(4.6, 0.2, 0);
  paddle2.material = paddleMat2;

  paddle1.scaling.z = options.paddleSize;
  paddle2.scaling.z = options.paddleSize;

  const ball = MeshBuilder.CreateSphere("ball", { diameter: 0.3 }, scene);
  ball.position.set(0, 0.2, 0);
  ball.material = ballMat;

  [paddle1, paddle2, ball].forEach(mesh => shadowGen.addShadowCaster(mesh));

  const trail = new ParticleSystem("trail", 200, scene);
  trail.particleTexture = new Texture("https://playground.babylonjs.com/textures/flare.png", scene);
  trail.emitter = ball;
  trail.minSize = 0.08;
  trail.maxSize = 0.15;
  trail.minLifeTime = 0.2;
  trail.maxLifeTime = 0.5;
  trail.emitRate = 200;
  trail.direction1 = new Vector3(-1, 0, -1);
  trail.direction2 = new Vector3(1, 0, 1);
  trail.color1 = new Color4(1, 0.9, 0.2, 1);
  trail.color2 = new Color4(1, 1, 0.4, 1);
  trail.gravity = Vector3.Zero();
  trail.start();

  const halo = MeshBuilder.CreateSphere("halo", { diameter: 0.5 }, scene);
  const haloMat = new StandardMaterial("haloMat", scene);
  haloMat.emissiveColor = new Color3(1, 0.84, 0);
  haloMat.alpha = 0.2;
  halo.material = haloMat;
  halo.parent = ball;

  const wallMaterial = new StandardMaterial("wallMaterial", scene);
  wallMaterial.diffuseColor = wallColorDiffuse;
  wallMaterial.emissiveColor = wallColorEmissive;

  const topWall = MeshBuilder.CreateBox("topWall", { width: 9.6, height: 0.2, depth: 0.2 }, scene);
  topWall.position.set(0, 0.1, -3.1);
  topWall.material = wallMaterial;

  const bottomWall = MeshBuilder.CreateBox("bottomWall", { width: 9.6, height: 0.2, depth: 0.2 }, scene);
  bottomWall.position.set(0, 0.1, 3.1);
  bottomWall.material = wallMaterial;

  const leftWall = MeshBuilder.CreateBox("leftWall", { width: 0.2, height: 0.2, depth: 6.4 }, scene);
  leftWall.position.set(-4.8, 0.1, 0);
  leftWall.material = wallMaterial;

  const rightWall = MeshBuilder.CreateBox("rightWall", { width: 0.2, height: 0.2, depth: 6.4 }, scene);
  rightWall.position.set(4.8, 0.1, 0);
  rightWall.material = wallMaterial;

  let ballDir = new Vector3(0, 0, 0);

  type IAProfile = {
  errorRange: number;
  reactionDelayMin: number;
  reactionDelayMax: number;
  adaptation: number;
  };

  const iaProfiles: { [key: string]: IAProfile } = {
    cautious: { errorRange: 0.15, reactionDelayMin: 4, reactionDelayMax: 7, adaptation: 0.9 },
    balanced: { errorRange: 0.07, reactionDelayMin: 3, reactionDelayMax: 5, adaptation: 1.05 },
    aggressive: { errorRange: 0.03, reactionDelayMin: 2, reactionDelayMax: 3, adaptation: 1.3 },
  };

  function interpolateProfiles(p1: IAProfile, p2: IAProfile, t: number): IAProfile {
    return {
      errorRange: p1.errorRange * (1 - t) + p2.errorRange * t,
      reactionDelayMin: Math.round(p1.reactionDelayMin * (1 - t) + p2.reactionDelayMin * t),
      reactionDelayMax: Math.round(p1.reactionDelayMax * (1 - t) + p2.reactionDelayMax * t),
      adaptation: p1.adaptation * (1 - t) + p2.adaptation * t,
    };
  }

  let currentProfile = iaProfiles.balanced; // Par défaut

  let iaOffset = 0;
  let iaNextReactionIn = 0;
  let iaVelocity = 0;

  const paddleSpeed = options.speed * 0.045;
  type KeyPressInfo = {
  isDown: boolean;
  timestamp: number;
};
  //2305 Gestion des touches
  const keyState: { [key: string]: KeyPressInfo } = {};

  window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if (!keyState[key]?.isDown) {
      keyState[key] = { isDown: true, timestamp: Date.now() };
    }
  });

  window.addEventListener("keyup", (e) => {
    const key = e.key.toLowerCase();
    keyState[key] = { isDown: false, timestamp: 0 };
  });

  function getDynamicSpeed(key: string, baseSpeed: number): number {
    const state = keyState[key];
    if (!state || !state.isDown) return 0;

    const heldTime = Date.now() - state.timestamp;

    if (heldTime > 700) return baseSpeed * 1.6;
    if (heldTime > 300) return baseSpeed * 1.3;
    return baseSpeed;
  }


  function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  function resetBall() {
    if (gameOver) return;

    ballDir.set(0, 0, 0); // Stoppe la balle pendant le rebours
    ball.position.set(0, 0.2, 0);

    countdownBeforeServe(() => {
      const directionX = Math.random() > 0.5 ? 1 : -1;
      const angleDeg = (Math.random() * 10 + 5) /* ATTENTTION -> endroit pour ajuster l'angle départ de la balle */ 
          * (Math.random() > 0.5 ? 1 : -1); // entre -15° et +15°
      const angleRad = (angleDeg * Math.PI) / 180;
      const baseSpeed = options.speed * 0.01;

      ballDir = new Vector3(
        baseSpeed * Math.cos(angleRad) * directionX,
        0,
        baseSpeed * Math.sin(angleRad)
      );
    });
  }


  function countdownBeforeServe(callback: () => void) {
  if (gameOver) return;
  let count = 2;
  announce!.textContent = t('pong.resume_in', { seconds: count });
  announce!.style.display = "block";

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      announce!.textContent = t('pong.resume_in', { seconds: count });
    } else {
      clearInterval(interval);
      announce!.style.display = "none";
      callback();
      iaOffset = (Math.random() - 0.5) * 0.5; // aléa entre -0.25 et 0.25

    }
  }, 1000);
  }


  function resetGame() {
    scorePlayer = 0;
    scoreIA = 0;
    gameOver = false;
    scoreBoard!.textContent = `${scorePlayer} - ${scoreIA}`;
    announce!.style.display = "none";
    returnButton.style.display = "none";
    
    // Remove any existing winner overlay
    const existingOverlay = canvas.parentElement?.querySelector('.winner-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
    
    resetBall();
  }

  // Function to create and show the winner screen overlay
  function showWinnerScreen(winnerName: string) {
    // Find the canvas container (should be the parent element)
    const canvasContainer = canvas.parentElement;
    if (!canvasContainer) {
      // Fallback to the old method if container not found
      announce!.textContent = t('pong.winner', { name: winnerName });
      announce!.style.display = "block";
      returnButton.style.display = "block";
      return;
    }

    // Create the overlay similar to memory game
    const overlay = document.createElement('div');
    overlay.className = 'winner-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: white;
      font-weight: bold;
      z-index: 1000;
    `;
    
    // Create winner announcement content
  const winnerText = document.createElement('div');
  winnerText.textContent = t('pong.winner', { name: winnerName });
  winnerText.style.cssText = `
    font-size: 48px;
    font-weight: bold;
    text-align: center;
    color: white;
    margin-bottom: 10px;
  `;

  const scoreText = document.createElement('div');
  scoreText.textContent = t('pong.score', { you: scorePlayer, opponent: scoreIA });
  scoreText.style.cssText = `
    font-size: 24px;
    text-align: center;
    color: white;
    margin-bottom: 30px;
  `;


    // Create return button for the overlay
    const overlayReturnButton = document.createElement('button');
    overlayReturnButton.textContent = t('versus.backToModes');
    overlayReturnButton.style.cssText = `
      background-color: #d97706; /* Darker amber for contrast */
      color: white;
      font-weight: 700;          /* Bold text */
      padding: 12px 24px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-size: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: background-color 0.2s;
    `;


    
    overlayReturnButton.onmouseover = () => {
      overlayReturnButton.style.backgroundColor = '#facc15'; // slightly brighter yellow
    };
    overlayReturnButton.onmouseout = () => {
      overlayReturnButton.style.backgroundColor = '#fbbf24';
    };

    
    // Store the original button's event listeners
    const originalButton = returnButton;
    
    // FIXED: Get all event listeners and the onclick handler
    overlayReturnButton.onclick = (e) => {
      console.log('Overlay button clicked');
      
      // Clean up the overlay first
      overlay.remove();
      
      // Try multiple approaches to trigger the original button
      try {
        // Method 1: Direct onclick call
        if (originalButton.onclick) {
          console.log('Calling original onclick');
          originalButton.onclick.call(originalButton, e as any);
          return;
        }
        
        // Method 2: Dispatch click event
        console.log('Dispatching click event');
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        originalButton.dispatchEvent(clickEvent);
        
        // Method 3: Direct click() call
        originalButton.click();
        
      } catch (error) {
        console.error('Error triggering return button:', error);
        // Fallback: try to navigate manually if we know the URL
        console.log('Attempting fallback navigation');
        if (window.location.pathname.includes('/pong')) {
          window.location.href = '/game-modes';
        }
      }
    };

    overlay.appendChild(winnerText);
    overlay.appendChild(scoreText);
    overlay.appendChild(overlayReturnButton);

    // Add the overlay to the canvas container
    canvasContainer.style.position = 'relative'; // Make sure container is positioned
    canvasContainer.appendChild(overlay);

    // Hide the original return button and announce
    returnButton.style.display = "none";
    announce!.style.display = "none";
  }

  //1705 추가
  async function checkGameOver() {
    if (scorePlayer >= SCORE_LIMIT || scoreIA >= SCORE_LIMIT) {
      gameOver = true;
      const isWin = scorePlayer > scoreIA;
      let winnerName = "Unknown";
  
      // 서버에 match 기록 저장
      await endMatch(scorePlayer, scoreIA);
  
      // 승자 이름 결정
      if (tournamentContext) {
        winnerName = isWin ? tournamentContext.p1.username : tournamentContext.p2.username;
      } else {
        const currentMatchData = sessionStorage.getItem("currentMatch");
        if (currentMatchData) {
          const { p1, p2, nextPhase } = JSON.parse(currentMatchData);
          winnerName = isWin ? p1.username : p2.username;
  
          sessionStorage.setItem(
            "matchWinner",
            JSON.stringify({ winner: isWin ? p1 : p2, nextPhase })
          );
        } else {
          const userId = Number(sessionStorage.getItem("userId"));
          const opponentId = isAI ? 2 : 3;
          const winnerId = isWin ? userId : opponentId;
  
          if (winnerId === 2) winnerName = "AI";
          else if (winnerId === 3) winnerName = "Guest";
          else winnerName = sessionStorage.getItem("username") || "Player 1";
        }
      }

    // 🎨 Affichage visuel
    showWinnerScreen(winnerName);

    // 🔁 IA dynamique
    if (opponentIsAI) {
      const scoreDiff = scorePlayer - scoreIA;
      currentProfile = scoreDiff >= 2
        ? iaProfiles.aggressive
        : scoreDiff <= -2
        ? iaProfiles.cautious
        : iaProfiles.balanced;
    }

    // // 💾 Enregistrement du match
    // if (gameId !== null) {
    //   let user_id: number | undefined;
    //   let opponent_id: number;

    //   if (tournamentContext) {
    //     const p1 = tournamentContext.p1;
    //     const p2 = tournamentContext.p2;
    //     user_id = p1.source === 'friend' ? Number(p1.id) : getGuestNumericId(p1.id);
    //     opponent_id = p2.source === 'friend' ? Number(p2.id) : getGuestNumericId(p2.id);
    //   } else {
    //     user_id = Number(sessionStorage.getItem("userId")) ;
    //     opponent_id = isAI ? 2 : 3;
    //   }

    //   const isGuestVsGuest = user_id < 0 && opponent_id < 0;
    //   const headers: Record<string, string> = {
    //     "Content-Type": "application/json"
    //   };
    //   const token = sessionStorage.getItem("token");
    //   if (!isGuestVsGuest && token) {
    //     headers["Authorization"] = `Bearer ${token}`;
    //   }

    //   try {
    //     const res = await fetch("/api/match/end", {
    //       method: "POST",
    //       headers,
    //       body: JSON.stringify({
    //         gameId,
    //         user_id,
    //         opponent_id,
    //         score1: scorePlayer,
    //         score2: scoreIA
    //       })
    //     });
    //     const result = await res.json();
    //     console.log("[MATCH ENDED]", result);
    //   } catch (err) {
    //     console.error("❌ Error ending match:", err);
    //   }
    // }

    // 🏆 Redirection tournoi
    if (tournamentContext) {
      const winner = isWin ? tournamentContext.p1 : tournamentContext.p2;
      sessionStorage.setItem("matchWinner", JSON.stringify({
        winner: {
          ...winner,
          id: String(winner.id)
        },
        nextPhase: tournamentContext.nextPhase,
        tournamentId: tournamentContext.tournamentId
      }));
      // 2405 아래 2줄 추가
      const matchDoneKey = `match_done_${tournamentContext.p1.id}::${tournamentContext.p2.id}`;
      sessionStorage.setItem(matchDoneKey, "true");

      setTimeout(() => {
        window.location.href = `/bracket?id=${tournamentContext.tournamentId}`;
      }, 2000);
    }
  }
}

  // 여기까지 \\


  resetBall();
  // MERGE? 여기 어케 해야하지?? 이 부분 내 코드에서는 주석 제거 되어있음 A VOIR
  // window.addEventListener("keydown", (e) => {
  //   if (e.key.toLowerCase() === "r" && gameOver) {
  //     resetGame();
  //     return;
  //   }

  //   if (gameOver) return;

  //   if (e.key === "s" && paddle1.position.z > -2.4) paddle1.position.z -= paddleSpeed;
  //   if (e.key === "w" && paddle1.position.z < 2.4) paddle1.position.z += paddleSpeed;

  //   if (!isAI) {
  //     if (e.key === "ArrowDown" && paddle2.position.z > -2.4) paddle2.position.z -= paddleSpeed;
  //     if (e.key === "ArrowUp" && paddle2.position.z < 2.4) paddle2.position.z += paddleSpeed;
  //   }
  // });

  scene.onBeforeRenderObservable.add(() => {
    if (gameOver) return;
    if (!gameOver) 
    {
      const p1Up = getDynamicSpeed("w", paddleSpeed);
      const p1Down = getDynamicSpeed("s", paddleSpeed);
      const p2Up = getDynamicSpeed("arrowup", paddleSpeed);
      const p2Down = getDynamicSpeed("arrowdown", paddleSpeed);

      if (p1Down && paddle1.position.z > -2.4) paddle1.position.z -= p1Down;
      if (p1Up && paddle1.position.z < 2.4) paddle1.position.z += p1Up;

      if (!isAI) {
        if (p2Down && paddle2.position.z > -2.4) paddle2.position.z -= p2Down;
        if (p2Up && paddle2.position.z < 2.4) paddle2.position.z += p2Up;
      }
    }

    if (isAI) {
      const diff = scoreIA - scorePlayer;
      const maxDiff = SCORE_LIMIT;
      const t = clamp((diff + maxDiff) / (2 * maxDiff), 0, 1);
      currentProfile = interpolateProfiles(iaProfiles.aggressive, iaProfiles.cautious, t);
    }

    if (isAI && ballDir.length() > 0) {
      if (iaNextReactionIn <= 0) {
        const hesitateChance = 0.05; // 5% de chance de ne pas réagir du tout
        if (Math.random() < hesitateChance && Math.abs(ball.position.x) > 2) {
          iaNextReactionIn = 6; // fait "perdre du temps" à l'IA
          return;
        }
        // IA réagit maintenant
        const dx = paddle2.position.x - ball.position.x;
        const timeToReach = Math.abs(dx / ballDir.x);
        const predictedZ = ball.position.z + (ballDir.z * timeToReach);

        const dz = predictedZ + iaOffset - paddle2.position.z;

        const error = (Math.random() - 0.5) * currentProfile.errorRange;
        const speedFactor = clamp(1 - Math.abs(ball.position.x) / 6, 0.4, 1);
        const maxStep = paddleSpeed * 0.5 * speedFactor * currentProfile.adaptation;

        // Appliquer accélération/inertie
        const desiredVelocity = clamp(dz + error, -maxStep, maxStep);
        const acceleration = 0.04;
        iaVelocity += clamp(desiredVelocity - iaVelocity, -acceleration, acceleration);
        iaVelocity = clamp(iaVelocity, -maxStep, maxStep);

        paddle2.position.z += iaVelocity;
        paddle2.position.z = clamp(paddle2.position.z, -2.4, 2.4);

        // Prochaine réaction dans X frames
        iaNextReactionIn = Math.floor(
          Math.random() * (currentProfile.reactionDelayMax - currentProfile.reactionDelayMin + 1)
        ) + currentProfile.reactionDelayMin;
      } else {
        iaNextReactionIn--;
      }
    }

    ball.position.addInPlace(ballDir);

    if (ball.position.z >= 2.9 || ball.position.z <= -2.9) ballDir.z *= -1;

    const hitP1 = ball.position.x <= paddle1.position.x + 0.15 && Math.abs(ball.position.z - paddle1.position.z) <= 0.6;
    const hitP2 = ball.position.x >= paddle2.position.x - 0.15 && Math.abs(ball.position.z - paddle2.position.z) <= 0.6;

    const adjustBounce = (paddle: Mesh, isLeft: boolean) => {
      // distance entre le centre de la raquette et la balle
      const dz = ball.position.z - paddle.position.z;

      // normalisation : si dz est proche de 0.5, max effet ; si proche de 0, peu d'effet
      const normalizedZ = clamp(dz / (paddle.scaling.y * 0.5), -1, 1);

      const speed = ballDir.length();
      const angleFactor = 0.8; // plus élevé = plus d'effet

      const newAngle = normalizedZ * angleFactor;
      const directionX = isLeft ? 1 : -1;

      const angleRad = Math.atan2(newAngle, 1);
      ballDir = new Vector3(
        directionX * speed * Math.cos(angleRad),
        0,
        speed * Math.sin(angleRad)
      );

      // repositionner la balle juste à côté de la raquette pour éviter les collisions multiples
      ball.position.x = isLeft ? paddle.position.x + 0.3 : paddle.position.x - 0.3;
    };

    if (hitP1) {
      adjustBounce(paddle1, true);
    } else if (hitP2) {
      adjustBounce(paddle2, false);
    }


    if (ball.position.x > 4.8) {
      scorePlayer++;
      // const label = opponentIsAI ? "AI" : "Player 2";
      const label = opponentIsAI ? "AI" : tournamentContext?.p2.username || "Player 2"; 
      console.log(`[GAME DEBUG] Point for Player Score: ${scorePlayer} - ${scoreIA}`);
      scoreBoard!.textContent = `${scorePlayer} - ${scoreIA}`;
      checkGameOver();
      if (!gameOver) resetBall();
    } else if (ball.position.x < -4.8) {
      scoreIA++;
      // const label = opponentIsAI ? "AI" : "Player 2";
      const label = opponentIsAI ? "AI" : tournamentContext?.p2.username || "Player 2"; 
      console.log(`[GAME DEBUG] Point for ${label}! Score: ${scorePlayer} - ${scoreIA}`);
      scoreBoard!.textContent = `${scorePlayer} - ${scoreIA}`;
      checkGameOver();
      if (!gameOver) resetBall();
    }
  });

  engine.runRenderLoop(() => scene.render());

  return {
    engine,
    scene,
    cleanup: () => {
      if (!gameOver)
        console.log("[CLEANUP] 게임이 정상 종료되지 않고 중단됨!");
      console.log("!!!!! CLEANUP FUNCTION CALLED !!!!!");
      scene.onBeforeRenderObservable.clear();
      engine.stopRenderLoop();
      scene.dispose();
      engine.dispose();
      console.log("[PONG CLEANUP] Engine and scene disposed.");
    }
  };
  
}
