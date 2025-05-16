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
};

export async function createPongScene(
  canvas: HTMLCanvasElement,
  options: PongOptions,
  returnButton: HTMLButtonElement // bouton reçu depuis l'extérieur
): Promise<any> {
  const isAI = options.mode === 'ai';

  // 🎨 Définir les styles selon le thème choisi
  let paddleColor1 = new Color3(0.6, 0.2, 0.8);
  let paddleColor2 = new Color3(0.2, 0.4, 1);
  let ballColor = new Color3(1, 0.84, 0);
  let groundTexturePath = "/assets/background/mat_wallpaper.jpg";

  switch (options.theme) {
    case 1: // Énergie
      paddleColor1 = new Color3(1, 0.3, 0.3);
      paddleColor2 = new Color3(1, 1, 0.3);
      ballColor = new Color3(0.3, 1, 0.3);
      groundTexturePath = "/assets/background/sun_energy.jpg";
      break;
    case 2: // Nébuleuse
      paddleColor1 = new Color3(0.2, 0.6, 1);
      paddleColor2 = new Color3(0.8, 0.3, 1);
      ballColor = new Color3(0.7, 0.9, 1);
      groundTexturePath = "/assets/background/new_moon.jpg";
      break;
    default: // Classique
      // Garde les couleurs définies par défaut
      break;
  }

  const scoreBoard = document.getElementById("scoreBoard");
  const announce = document.getElementById("announce");

  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0, 0, 0, 1.0);

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
  wallMaterial.diffuseColor = new Color3(0.05, 0.05, 0.3);
  wallMaterial.emissiveColor = new Color3(0.1, 0.1, 0.4); // pour un effet lumineux

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

  // MeshBuilder.CreateBox("topWall", { width: 9.6, height: 0.2, depth: 0.2 }, scene).position.set(0, 0.1, -3.1);
  // MeshBuilder.CreateBox("bottomWall", { width: 9.6, height: 0.2, depth: 0.2 }, scene).position.set(0, 0.1, 3.1);
  // MeshBuilder.CreateBox("leftWall", { width: 0.2, height: 0.2, depth: 6.4 }, scene).position.set(-4.8, 0.1, 0);
  // MeshBuilder.CreateBox("rightWall", { width: 0.2, height: 0.2, depth: 6.4 }, scene).position.set(4.8, 0.1, 0);

  let ballDir = new Vector3(0, 0, 0);
  let targetZ = 0;
  let iaVelocityZ = 0;

  const paddleSpeed = options.speed * 0.04;

  function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  function resetBall() {
    ballDir.set(0, 0, 0); // Stoppe la balle pendant le rebours
    ball.position.set(0, 0.2, 0);

    countdownBeforeServe(() => {
      const directionX = Math.random() > 0.5 ? 1 : -1;
      const directionZ = Math.random() > 0.5 ? 1 : -1;
      const baseSpeed = options.speed * 0.01;

      ballDir = new Vector3(
        baseSpeed * directionX,
        0,
        baseSpeed * 0.6 * directionZ
      );
    });
  }

  function countdownBeforeServe(callback: () => void) {
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

  function checkGameOver() {
    if (scorePlayer >= SCORE_LIMIT) {
      gameOver = true;
      announce!.textContent = "Victoire !";
      announce!.style.display = "block";
      returnButton.style.display = "block"; // 👈 Affiche le bouton
    } else if (scoreIA >= SCORE_LIMIT) {
      gameOver = true;
      announce!.textContent = "Défaite...";
      announce!.style.display = "block";
      returnButton.style.display = "block"; // 👈 Affiche le bouton
    }
  }

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

    ball.position.addInPlace(ballDir);

    if (ball.position.z >= 2.9 || ball.position.z <= -2.9) ballDir.z *= -1;

    const hitP1 = ball.position.x <= paddle1.position.x + 0.15 && Math.abs(ball.position.z - paddle1.position.z) <= 0.6;
    const hitP2 = ball.position.x >= paddle2.position.x - 0.15 && Math.abs(ball.position.z - paddle2.position.z) <= 0.6;

    if (hitP1) {
      ballDir.x *= -1;
      ball.position.x = paddle1.position.x + 0.3;
    } else if (hitP2) {
      ballDir.x *= -1;
      ball.position.x = paddle2.position.x - 0.3;
    }

    if (ball.position.x > 4.8) {
      scorePlayer++;
      scoreBoard!.textContent = `${scorePlayer} - ${scoreIA}`;
      resetBall();
      checkGameOver();
    } else if (ball.position.x < -4.8) {
      scoreIA++;
      scoreBoard!.textContent = `${scorePlayer} - ${scoreIA}`;
      resetBall();
      checkGameOver();
    }
  });

  engine.runRenderLoop(() => scene.render());

  return {
    engine,
    scene
  };
}

