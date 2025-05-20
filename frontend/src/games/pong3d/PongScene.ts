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
  mode: 'local' | 'ai';
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

export async function createPongScene(
  canvas: HTMLCanvasElement,
  options: PongOptions,
  returnButton: HTMLButtonElement, // bouton reçu depuis l'extérieur
): Promise<any> {
  const isAI = options.mode === 'ai';

  // 🎨 Définir les styles selon le thème choisi
  let paddleColor1 = new Color3(0.6, 0.2, 0.8);
  let paddleColor2 = new Color3(0.2, 0.4, 1);
  let ballColor = new Color3(1, 0.84, 0);
  let groundTexturePath = "/assets/background/mat_wallpaper.jpg";
  let wallColorDiffuse = new Color3(0.05, 0.05, 0.3); // Couleur par défaut
  let wallColorEmissive = new Color3(0.1, 0.1, 0.4);

  switch (options.theme) {
    case 1: // Énergie
      paddleColor1 = new Color3(1, 0.3, 0.3);
      paddleColor2 = new Color3(1, 1, 0.3);
      ballColor = new Color3(0.3, 1, 0.3);
      groundTexturePath = "/assets/background/sun_energy.jpg";
      wallColorDiffuse = new Color3(0.4, 0.1, 0.1);     // Rouge foncé
      wallColorEmissive = new Color3(0.8, 0.2, 0.2);    // Rouge lumineux
      break;
    case 2: // Nébuleuse
      paddleColor1 = new Color3(0.2, 0.6, 1);
      paddleColor2 = new Color3(0.8, 0.3, 1);
      ballColor = new Color3(0.7, 0.9, 1);
      groundTexturePath = "/assets/background/new_moon.jpg";
      wallColorDiffuse = new Color3(0.2, 0.3, 0.5);     // Bleu profond
      wallColorEmissive = new Color3(0.3, 0.4, 0.7);    // Bleu lumineux
      break;
    default: // Classique
      // Garde les couleurs définies par défaut
      break;
  }
  let tournamentContext = options.tournamentContext;

  // 🔁 Si on ne reçoit pas via options, on vérifie dans sessionStorage (fallback)
  if (!tournamentContext) {
    const matchData = sessionStorage.getItem("currentMatch");
    if (matchData) {
      try {
        tournamentContext = JSON.parse(matchData);
      } catch (e) {
        console.warn(" Erreur parsing currentMatch:", e);
      }
    }
  }
  
  const scoreBoard = document.getElementById("scoreBoard");
  const announce = document.getElementById("announce");

  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0, 0, 0, 1.0);

  //1705 추가
  let gameId: number | null = null;

  async function startMatch() {
    const user_id = Number(sessionStorage.getItem("userId"));
    const opponent_id = isAI ? 2 : 3;
  
    // ✅ user_id 유효성 검사
    if (!user_id || isNaN(user_id)) {
      console.error("❗ user_id is missing or invalid in sessionStorage");
      return;
    }
  
    try {
      const response = await fetch("/api/match/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, opponent_id })
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

  paddle1.scaling.y = options.paddleSize;
  paddle2.scaling.y = options.paddleSize;

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
  let count = 5;
  announce!.textContent = `Reprise dans ${count}...`;
  announce!.style.display = "block";

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      announce!.textContent = `Reprise dans ${count}...`;
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
    resetBall();
  }

  //1705 추가
  async function checkGameOver() {
    if (scorePlayer >= SCORE_LIMIT || scoreIA >= SCORE_LIMIT) {
      gameOver = true;
  
      const isWin = scorePlayer > scoreIA;
      announce!.textContent = isWin ? "Victoire !" : "Défaite...";
      announce!.style.display = "block";
      returnButton.style.display = "block";
  
      if (isAI) {
        const scoreDiff = scorePlayer - scoreIA;
        if (scoreDiff >= 2) {
          currentProfile = iaProfiles.aggressive;
        } else if (scoreDiff <= -2) {
          currentProfile = iaProfiles.cautious;
        } else {
          currentProfile = iaProfiles.balanced;
        }
      }

      if (gameId !== null) {
        const user_id = Number(sessionStorage.getItem("userId"));
        const opponent_id = isAI ? 2 : 3;
  
        try {
          const res = await fetch("/api/match/end", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              gameId,
              user_id,
              opponent_id,
              score1: scorePlayer,
              score2: scoreIA
            })
          });
  
          const result = await res.json();
          console.log("[MATCH ENDED]", result);
        } catch (err) {
          console.error("[DEBUG GAME/PONG SCENE] Error ending match:", err);
        }
      }
      if (tournamentContext) {
        const winner = isWin ? tournamentContext.p1 : tournamentContext.p2;
      
        sessionStorage.setItem("matchWinner", JSON.stringify({
          winner,
          nextPhase: tournamentContext.nextPhase,
          tournamentId: tournamentContext.tournamentId
        }));
      
        setTimeout(() => {
          window.location.href = `/bracket?id=${tournamentContext.tournamentId}`;
        }, 2000);
      }
    }
  }  
  // 여기까지 \\


  resetBall();

  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "r" && gameOver) {
      resetGame();
      return;
    }

    if (gameOver) return;

    if (e.key === "s" && paddle1.position.z > -2.4) paddle1.position.z -= paddleSpeed;
    if (e.key === "w" && paddle1.position.z < 2.4) paddle1.position.z += paddleSpeed;

    if (!isAI) {
      if (e.key === "ArrowDown" && paddle2.position.z > -2.4) paddle2.position.z -= paddleSpeed;
      if (e.key === "ArrowUp" && paddle2.position.z < 2.4) paddle2.position.z += paddleSpeed;
    }
  });

  scene.onBeforeRenderObservable.add(() => {
    if (gameOver) return;

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
          iaNextReactionIn = 6; // fait "perdre du temps" à l’IA
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
      const angleFactor = 0.6; // plus élevé = plus d'effet

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
      console.log(`[GAME DEBUG] Point for Player Score: ${scorePlayer} - ${scoreIA}`);
      scoreBoard!.textContent = `${scorePlayer} - ${scoreIA}`;
      checkGameOver();
      if (!gameOver) resetBall();
    } else if (ball.position.x < -4.8) {
      scoreIA++;
      console.log(`[GAME DEBUG] Point for AI! Score: ${scorePlayer} - ${scoreIA}`);
      scoreBoard!.textContent = `${scorePlayer} - ${scoreIA}`;
      checkGameOver();
      if (!gameOver) resetBall();
    }
  });

  engine.runRenderLoop(() => scene.render());

  return {
    engine,
    scene
  };
}
