(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const canvas = $("#gameCanvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  const TAU = Math.PI * 2;
  const STORAGE_KEY = "poopHomeRunLegend.v3";

  // Content lives here so stages, bosses, expressions, conditions and poop types can be extended without changing the game loop.
  const GAME_DATA = {
    expressions: {
      normal: { col: 0, row: 0, label: "보통" },
      happy: { col: 1, row: 0, label: "기쁨" },
      pain: { col: 0, row: 1, label: "고통" },
      surprise: { col: 1, row: 1, label: "놀람" },
      shy: { col: 0, row: 2, label: "부끄" },
      strain: { col: 1, row: 2, label: "힘줌" }
    },
    conditions: [
      { id: "excellent", name: "매우 좋음", color: "#42d56d", weight: 10, expression: "happy", probabilities: { healthy: 60, hard: 25, normal: 10, golden: 5 } },
      { id: "good", name: "좋음", color: "#77dd58", weight: 24, expression: "happy", probabilities: { healthy: 40, hard: 20, normal: 30, golden: 3, diarrhea: 7 } },
      { id: "normal", name: "보통", color: "#ffd83d", weight: 36, expression: "normal", probabilities: { healthy: 20, normal: 50, rabbit: 15, diarrhea: 15 } },
      { id: "bad", name: "나쁨", color: "#f49345", weight: 20, expression: "pain", probabilities: { normal: 20, rabbit: 30, diarrhea: 40, explosive: 10 } },
      { id: "awful", name: "매우 나쁨", color: "#ef4e4e", weight: 10, expression: "pain", probabilities: { diarrhea: 50, explosive: 40, normal: 10 } }
    ],
    poops: {
      healthy: { name: "건강한 똥", color: "#7a482b", outline: "#3b2117", speed: 180, size: 1.05, score: 130, damage: 1 },
      hard: { name: "단단한 똥", color: "#4c2a1c", outline: "#21130f", speed: 220, size: .9, score: 150, damage: 1 },
      normal: { name: "일반 똥", color: "#754126", outline: "#301c14", speed: 205, size: 1, score: 100, damage: 1 },
      rabbit: { name: "토끼똥", color: "#563426", outline: "#241712", speed: 270, size: .55, score: 170, damage: 1 },
      diarrhea: { name: "설사", color: "#aa762f", outline: "#5a381d", speed: 285, size: 1.15, score: 190, damage: 1, wobble: 55 },
      explosive: { name: "폭발성 설사", color: "#a95023", outline: "#4c1e13", speed: 330, size: 1.2, score: 250, damage: 2, wobble: 90, explosive: true },
      golden: { name: "황금똥", color: "#ffd42d", outline: "#9c5b12", glow: "#fff59b", speed: 200, size: 1, score: 500, damage: 2, rare: true }
    },
    stages: [
      { id: 1, name: "동네 공원", icon: "♣", color: "#63c957", sky: "#72d3f2", goal: 5, description: "장애물 없는 튜토리얼", mechanic: "none" },
      { id: 2, name: "도심지", icon: "▥", color: "#708da1", sky: "#77c8e3", goal: 5, description: "건물과 간판에 궤도 반사", mechanic: "bounce", boss: "iron" },
      { id: 3, name: "학교 운동장", icon: "⚽", color: "#d5a54b", sky: "#86d6ed", goal: 6, description: "축구공·농구공 이동 장애물", mechanic: "balls" },
      { id: 4, name: "공사장", icon: "⚠", color: "#bf924d", sky: "#8ebdcc", goal: 6, description: "크레인과 낙하물", mechanic: "crane", boss: "toilet" },
      { id: 5, name: "놀이공원", icon: "✹", color: "#df6fb3", sky: "#8adbf0", goal: 7, description: "회전 장애물과 이동 타겟", mechanic: "rotate" },
      { id: 6, name: "비 오는 도시", icon: "☂", color: "#567584", sky: "#536f89", goal: 7, description: "비와 강한 바람으로 궤도 변화", mechanic: "rain", boss: "storm" },
      { id: 7, name: "축제 거리", icon: "✦", color: "#a84f92", sky: "#302b66", goal: 8, description: "폭죽이 시야를 방해", mechanic: "fireworks" },
      { id: 8, name: "최종 보스", icon: "☠", color: "#4d284f", sky: "#18162e", goal: 10, description: "연속 공격과 다중 발사체", mechanic: "final", boss: "legend" }
    ],
    bosses: {
      iron: { name: "철벽 엉덩이 대장", hp: 6, burst: 2, obscureEvery: 4, reward: 500, unlock: "철벽 스킨" },
      toilet: { name: "황금 변기왕", hp: 9, burst: 2, obscureEvery: 3, reward: 900, unlock: "황금 탄환" },
      storm: { name: "폭풍 배변술사", hp: 12, burst: 3, obscureEvery: 3, reward: 1500, unlock: "폭풍 스킨" },
      legend: { name: "우주 배변 신", hp: 18, burst: 4, obscureEvery: 2, reward: 3000, unlock: "전설 슬링샷" }
    },
    weapons: [
      { id: "wood", name: "나무 새총", icon: "Y", power: 1, price: 0, description: "기본 슬링샷" },
      { id: "steel", name: "강철 새총", icon: "Ψ", power: 1.2, price: 500, description: "피해·점수 +20%" },
      { id: "turbo", name: "터보 새총", icon: "⚡", power: 1.5, price: 1800, description: "피해·점수 +50%" },
      { id: "legend", name: "전설 슬링샷", icon: "★", power: 2, price: 7000, description: "피해·점수 +100%" }
    ],
    achievements: [
      { id: "first", name: "첫 명중", description: "똥을 처음 맞히기", icon: "◎", test: (s) => s.stats.hits >= 1 },
      { id: "combo5", name: "연속 명중", description: "5 콤보 달성", icon: "5X", test: (s) => s.stats.maxCombo >= 5 },
      { id: "gold", name: "황금 사냥꾼", description: "황금똥 명중", icon: "G", test: (s) => s.stats.goldenHits >= 1 },
      { id: "boss1", name: "보스 사냥 시작", description: "보스 1명 격파", icon: "B1", test: (s) => s.stats.bosses >= 1 },
      { id: "boss4", name: "보스 정복자", description: "보스 4명 격파", icon: "B4", test: (s) => s.stats.bosses >= 4 },
      { id: "score5k", name: "5천점 돌파", description: "한 판 5,000점 달성", icon: "5K", test: (s) => s.best >= 5000 },
      { id: "stage8", name: "최종 결전", description: "Stage 8 도달", icon: "S8", test: (s) => s.unlockedStage >= 8 },
      { id: "clear", name: "레전드", description: "최종 보스 격파", icon: "★", test: (s) => s.clearedStages.includes(8) }
    ]
  };

  const faceImage = new Image();
  faceImage.src = "UI/표정.png";
  const bossImage = new Image();
  bossImage.src = "UI/보스몹.png";

  const DEFAULT_SAVE = {
    coins: 250,
    best: 0,
    unlockedStage: 1,
    clearedStages: [],
    equipped: "wood",
    ownedWeapons: ["wood"],
    discoveredPoops: [],
    achievements: {},
    skins: [],
    specialAmmo: 0,
    records: [],
    stats: { plays: 0, hits: 0, maxCombo: 0, goldenHits: 0, bosses: 0 }
  };

  let saveData = loadSave();
  let currentScreen = "homeScreen";
  let gameMode = "story";
  let selectedStage = GAME_DATA.stages[0];
  let condition = GAME_DATA.conditions[2];
  let selectedBoosts = new Set();
  let powerBoost = 1;
  let weapon = GAME_DATA.weapons[0];
  let gameState = "idle";
  let expression = "normal";
  let projectiles = [];
  let particles = [];
  let obstacles = [];
  let score = 0;
  let lives = 3;
  let hits = 0;
  let combo = 0;
  let wave = 0;
  let targetRadius = 155;
  let targetDirection = -1;
  let powerPosition = .05;
  let powerDirection = 1;
  let aimGrade = "";
  let shotPower = 1;
  let shotProgress = 0;
  let shotTarget = null;
  let spawnTimer = 0;
  let stageTime = 0;
  let obscuredTimer = 0;
  let boss = null;
  let bossPending = null;
  let bossHp = 0;
  let bossMaxHp = 0;
  let bossLaunches = 0;
  let lastTimestamp = 0;
  let shake = 0;
  let audioContext;

  function loadSave() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved) return { ...structuredClone(DEFAULT_SAVE), ...saved, stats: { ...DEFAULT_SAVE.stats, ...saved.stats } };
      const old = JSON.parse(localStorage.getItem("poopHomeRunLegend.v2"));
      if (old) return { ...structuredClone(DEFAULT_SAVE), coins: old.coins || 250, best: old.best || 0, unlockedStage: Math.min(8, old.stage || 1) };
    } catch {}
    return structuredClone(DEFAULT_SAVE);
  }

  const persist = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const random = (min, max) => min + Math.random() * (max - min);
  const stageById = (id) => GAME_DATA.stages.find((stage) => stage.id === id) || GAME_DATA.stages[0];
  const weaponById = (id) => GAME_DATA.weapons.find((item) => item.id === id) || GAME_DATA.weapons[0];

  function weighted(items, getWeight) {
    let roll = Math.random() * items.reduce((sum, item) => sum + getWeight(item), 0);
    for (const item of items) {
      roll -= getWeight(item);
      if (roll <= 0) return item;
    }
    return items[0];
  }

  function randomCondition() {
    return weighted(GAME_DATA.conditions, (item) => item.weight);
  }

  function randomPoop() {
    const entries = Object.entries(condition.probabilities);
    const id = weighted(entries, (entry) => entry[1])[0];
    return { id, ...GAME_DATA.poops[id] };
  }

  function formatScore(value) {
    return Math.round(value).toLocaleString("ko-KR");
  }

  function toast(message) {
    const element = $("#toast");
    element.textContent = message;
    element.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => element.classList.remove("show"), 1800);
  }

  function sound(kind) {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.type = kind === "miss" ? "square" : kind === "hit" ? "sawtooth" : "sine";
    oscillator.frequency.setValueAtTime(kind === "miss" ? 105 : kind === "hit" ? 240 : 620, now);
    oscillator.frequency.exponentialRampToValueAtTime(kind === "miss" ? 45 : kind === "hit" ? 80 : 980, now + .28);
    gain.gain.setValueAtTime(.12, now);
    gain.gain.exponentialRampToValueAtTime(.001, now + .36);
    oscillator.start();
    oscillator.stop(now + .38);
  }

  function syncHome() {
    $("#coinCount").textContent = saveData.coins.toLocaleString("ko-KR");
    $("#homeBest").textContent = formatScore(saveData.best);
    $("#recordBest").textContent = formatScore(saveData.best);
    $("#stageProgress").textContent = `STAGE ${saveData.unlockedStage} / 8`;
    $("#collectionProgress").textContent = `${saveData.discoveredPoops.length} / ${Object.keys(GAME_DATA.poops).length}`;
    $("#achievementProgress").textContent = `${Object.keys(saveData.achievements).length} / ${GAME_DATA.achievements.length}`;
  }

  function showScreen(id) {
    $$(".screen").forEach((screen) => screen.classList.toggle("active", screen.id === id));
    currentScreen = id;
    $("#backButton").classList.toggle("hidden", id === "homeScreen");
    if (id === "stageScreen") renderStages();
    if (id === "shopScreen") renderShop();
    if (id === "collectionScreen") renderCollection();
    if (id === "achievementScreen") renderAchievements();
    if (id === "rankingScreen") renderRanking();
    syncHome();
  }

  function renderStages() {
    $("#stageList").innerHTML = GAME_DATA.stages.map((stage) => {
      const unlocked = stage.id <= saveData.unlockedStage;
      const cleared = saveData.clearedStages.includes(stage.id);
      return `<article class="stage-card ${stage.boss ? "boss" : ""} ${unlocked ? "" : "locked"}">
        <div class="icon" style="background:${stage.color}">${stage.icon}</div>
        <div><b>STAGE ${stage.id} · ${stage.name}</b><small>${stage.description}${stage.boss ? " · BOSS" : ""}${cleared ? " · CLEAR" : ""}</small></div>
        <button data-stage="${stage.id}" ${unlocked ? "" : "disabled"}>${cleared ? "재도전" : "도전"}</button>
      </article>`;
    }).join("");
  }

  function renderShop() {
    $("#shopList").innerHTML = GAME_DATA.weapons.map((item) => {
      const owned = saveData.ownedWeapons.includes(item.id);
      const equipped = saveData.equipped === item.id;
      return `<article class="item-card ${equipped ? "equipped" : ""}"><div class="icon">${item.icon}</div><div><b>${item.name}</b><small>${item.description}</small></div><button data-weapon="${item.id}" ${equipped ? "disabled" : ""}>${equipped ? "장착 중" : owned ? "장착" : `${item.price.toLocaleString("ko-KR")} G`}</button></article>`;
    }).join("");
  }

  function renderCollection() {
    $("#collectionList").innerHTML = Object.entries(GAME_DATA.poops).map(([id, poop]) => {
      const found = saveData.discoveredPoops.includes(id);
      return `<article class="collection-card ${found ? "" : "locked"}"><div class="icon" style="${found ? `background:${poop.color};box-shadow:inset 0 0 13px ${poop.glow || "transparent"}` : ""}">${found ? "●" : "?"}</div><b>${found ? poop.name : "미발견"}</b><small>${found ? `${poop.score}점 · 속도 ${poop.speed}` : "플레이 중 발견"}</small></article>`;
    }).join("");
  }

  function refreshAchievements() {
    for (const achievement of GAME_DATA.achievements) {
      if (!saveData.achievements[achievement.id] && achievement.test(saveData)) {
        saveData.achievements[achievement.id] = true;
        toast(`업적 달성: ${achievement.name}`);
      }
    }
  }

  function renderAchievements() {
    refreshAchievements();
    $("#achievementList").innerHTML = GAME_DATA.achievements.map((item) => {
      const done = saveData.achievements[item.id];
      return `<article class="achievement-card ${done ? "done" : ""}"><div class="icon">${item.icon}</div><div><b>${item.name}</b><small>${item.description}</small></div><span class="check">${done ? "✓" : "·"}</span></article>`;
    }).join("");
    persist();
  }

  function renderRanking() {
    $("#rankingList").innerHTML = saveData.records.slice(0, 10).map((record, index) => `<article class="rank-row"><b>${index + 1}</b><div><b>${record.stage}</b><small>${record.date}</small></div><strong>${formatScore(record.score)}</strong></article>`).join("") || "<p>아직 기록이 없습니다.</p>";
  }

  function expressionPosition(emotion) {
    const data = GAME_DATA.expressions[emotion] || GAME_DATA.expressions.normal;
    return `${data.col * 100}% ${data.row * 50}%`;
  }

  function renderPrep() {
    const effective = selectedBoosts.has("medicine") && ["bad", "awful"].includes(condition.id)
      ? GAME_DATA.conditions.find((item) => item.id === "good")
      : condition;
    const cost = (selectedBoosts.has("medicine") ? 80 : 0) + (selectedBoosts.has("steroid") ? 150 : 0);
    $("#prepCondition").textContent = effective.name;
    $("#prepCondition").style.color = effective.color;
    $("#prepConditionDesc").textContent = selectedBoosts.has("medicine") ? "회복약으로 컨디션이 좋아졌습니다." : conditionDescription(effective);
    $("#prepFace").style.backgroundPosition = expressionPosition(effective.expression);
    $("#prepCost").textContent = `${cost} 골드`;
    $$("[data-boost]").forEach((button) => button.classList.toggle("selected", selectedBoosts.has(button.dataset.boost)));
    $("[data-boost=medicine]").disabled = !["bad", "awful"].includes(condition.id);
    $("#arenaGrid").innerHTML = GAME_DATA.stages.map((stage) => `<button data-arena="${stage.id}" class="${selectedStage.id === stage.id ? "selected" : ""}"><span>${stage.icon}</span>${stage.id}. ${stage.name}</button>`).join("");
  }

  function conditionDescription(value) {
    return {
      excellent: "황금똥까지 기대할 수 있는 최상 상태!",
      good: "건강한 똥이 나올 가능성이 높습니다.",
      normal: "무난하지만 방심할 수 없습니다.",
      bad: "설사와 토끼똥 확률이 높습니다.",
      awful: "폭발성 설사를 조심하세요!"
    }[value.id];
  }

  function openPrep(mode, stage = selectedStage) {
    gameMode = mode;
    selectedStage = stage;
    condition = randomCondition();
    selectedBoosts = new Set();
    powerBoost = 1;
    $("#prepMode").textContent = mode === "battle" ? "PRACTICE PREP" : `STAGE ${stage.id} PREP`;
    $("#arenaSection").style.display = mode === "battle" ? "block" : "none";
    renderPrep();
    $("#prepModal").classList.add("show");
  }

  function confirmPrep() {
    const cost = (selectedBoosts.has("medicine") ? 80 : 0) + (selectedBoosts.has("steroid") ? 150 : 0);
    if (saveData.coins < cost) return toast("골드가 부족합니다.");
    saveData.coins -= cost;
    if (selectedBoosts.has("medicine") && ["bad", "awful"].includes(condition.id)) condition = GAME_DATA.conditions.find((item) => item.id === "good");
    powerBoost = selectedBoosts.has("steroid") ? 1.5 : 1;
    persist();
    $("#prepModal").classList.remove("show");
    startGame();
  }

  function startGame() {
    weapon = weaponById(saveData.equipped);
    score = 0;
    lives = 3;
    hits = 0;
    combo = 0;
    wave = 0;
    projectiles = [];
    particles = [];
    obstacles = createObstacles();
    stageTime = 0;
    spawnTimer = .9;
    obscuredTimer = 0;
    aimGrade = "";
    shotTarget = null;
    const configuredBoss = selectedStage.boss ? GAME_DATA.bosses[selectedStage.boss] : null;
    boss = selectedStage.id === 8 ? configuredBoss : null;
    bossPending = boss ? null : configuredBoss;
    bossMaxHp = boss ? boss.hp : 0;
    bossHp = bossMaxHp;
    bossLaunches = 0;
    gameState = "intro";
    expression = boss ? "surprise" : "strain";
    $("#modeLabel").textContent = gameMode === "battle" ? "PRACTICE" : `STORY · STAGE ${selectedStage.id}`;
    $("#locationLabel").textContent = selectedStage.name;
    $("#conditionLabel").textContent = condition.name;
    $("#conditionLabel").style.color = condition.color;
    $("#bossHud").classList.toggle("show", !!boss);
    if (boss) {
      $("#bossName").textContent = boss.name;
      updateBossHud();
    }
    $("#powerPanel").classList.remove("show");
    $("#statusMessage").textContent = boss ? `${boss.name} 등장!` : "아이가 힘을 주고 있다...";
    updateHud();
    showScreen("gameScreen");
  }

  function createObstacles() {
    if (selectedStage.mechanic === "balls") return [{ type: "ball", x: 120, y: 610, vx: 150, radius: 34 }, { type: "ball", x: 600, y: 760, vx: -120, radius: 27 }];
    if (selectedStage.mechanic === "crane") return [{ type: "crane", x: 100, y: 490, vx: 80, width: 190 }, { type: "block", x: 560, y: 300, vy: 100, radius: 30 }];
    if (selectedStage.mechanic === "rotate") return [{ type: "rotor", x: 360, y: 620, angle: 0, radius: 135 }];
    return [];
  }

  function spawnWave() {
    const count = boss ? boss.burst : selectedStage.mechanic === "final" ? 3 : 1;
    const actualCount = boss && bossHp < bossMaxHp / 2 ? Math.min(4, count + 1) : count;
    for (let index = 0; index < actualCount; index += 1) {
      const type = randomPoop();
      const spread = (index - (actualCount - 1) / 2) * 72;
      projectiles.push({
        ...type,
        x: 440 + spread,
        y: 225 + Math.abs(spread) * .15,
        vx: spread * .35 + random(-25, 25),
        vy: type.speed * (.88 + selectedStage.id * .035),
        rotation: random(0, TAU),
        age: 0,
        bounced: false,
        primary: index === 0
      });
    }
    wave += 1;
    bossLaunches += boss ? 1 : 0;
    const primary = getTarget();
    if (primary) {
      if (primary.id === "golden") expression = "happy";
      else if (primary.rare || primary.explosive || boss) expression = "surprise";
      else expression = "strain";
      discoverPoop(primary.id);
    }
    if (boss && bossLaunches % boss.obscureEvery === 0) obscuredTimer = 1.5;
    targetRadius = 155;
    targetDirection = -1;
    gameState = "incoming";
    $("#statusMessage").textContent = selectedStage.id === 1 && wave === 1 ? "원이 겹칠 때 오른쪽 아래 발사!" : primary ? `${primary.name} 발사!` : "연속 발사!";
    updateHud();
  }

  function discoverPoop(id) {
    if (!saveData.discoveredPoops.includes(id)) {
      saveData.discoveredPoops.push(id);
      toast(`도감 등록: ${GAME_DATA.poops[id].name}`);
      persist();
    }
  }

  function getTarget() {
    if (!projectiles.length) return null;
    let target = projectiles.find((item) => item.primary);
    if (!target) {
      target = projectiles.reduce((nearest, item) => item.y > nearest.y ? item : nearest, projectiles[0]);
      target.primary = true;
    }
    return target;
  }

  function handleFire() {
    if (gameState === "incoming") fireAtTarget();
    else if (gameState === "power") lockPower();
  }

  function fireAtTarget() {
    const target = getTarget();
    if (!target) return;
    const perfect = 48;
    const error = Math.abs(targetRadius - perfect) / 107;
    aimGrade = error <= .04 ? "Perfect" : error <= .11 ? "Great" : error <= .22 ? "Good" : "Miss";
    showJudgement(aimGrade.toUpperCase(), aimGrade === "Miss" ? "miss" : aimGrade.toLowerCase());
    if (aimGrade === "Miss") {
      combo = 0;
      expression = "shy";
      sound("miss");
      target.primary = false;
      getTarget();
      return;
    }
    shotTarget = target;
    projectiles.forEach((item) => item.frozen = true);
    powerPosition = .05;
    powerDirection = 1;
    gameState = "power";
    $("#powerPanel").classList.add("show");
    $("#statusMessage").textContent = "고무줄을 당겼다! 파워 결정!";
    sound("coin");
  }

  function lockPower() {
    shotPower = clamp(Math.ceil((1 - Math.abs(powerPosition - .5) * 2) * 10), 1, 10);
    const critical = Math.abs(powerPosition - .5) <= .045;
    if (critical) {
      shotPower = 10;
      showJudgement("SUPER SHOT!", "critical");
    } else showJudgement(`${shotPower} POWER`, shotPower >= 8 ? "perfect" : "good");
    gameState = "shot";
    shotProgress = 0;
    $("#powerPanel").classList.remove("show");
    $("#fireButton").classList.add("pressed");
    setTimeout(() => $("#fireButton").classList.remove("pressed"), 160);
    sound("hit");
  }

  function resolveShot() {
    if (!shotTarget || !projectiles.includes(shotTarget)) {
      resumeProjectiles();
      return;
    }
    const gradeMultiplier = { Perfect: 1.5, Great: 1.15, Good: .85 }[aimGrade] || .5;
    const powerMultiplier = .55 + shotPower * .085;
    const totalMultiplier = gradeMultiplier * powerMultiplier * weapon.power * powerBoost;
    const gained = Math.round(shotTarget.score * totalMultiplier);
    const damage = Math.max(1, Math.round(shotTarget.damage * totalMultiplier));
    score += gained;
    hits += 1;
    combo += 1;
    saveData.stats.hits += 1;
    saveData.stats.maxCombo = Math.max(saveData.stats.maxCombo, combo);
    if (shotTarget.id === "golden") saveData.stats.goldenHits += 1;
    burst(shotTarget.x, shotTarget.y, 42, shotTarget.color);
    shake = aimGrade === "Perfect" ? 18 : 9;
    projectiles.splice(projectiles.indexOf(shotTarget), 1);
    if (boss) {
      bossHp = Math.max(0, bossHp - damage);
      updateBossHud();
      if (bossHp <= 0) return finishGame(true);
    } else if (hits >= selectedStage.goal) {
      if (bossPending) return startBossEncounter();
      return finishGame(true);
    }
    shotTarget = null;
    resumeProjectiles();
    updateHud();
  }

  function startBossEncounter() {
    boss = bossPending;
    bossPending = null;
    bossMaxHp = boss.hp;
    bossHp = bossMaxHp;
    bossLaunches = 0;
    projectiles = [];
    shotTarget = null;
    gameState = "intro";
    spawnTimer = 1.1;
    expression = "surprise";
    $("#bossHud").classList.add("show");
    $("#bossName").textContent = boss.name;
    $("#statusMessage").textContent = boss.name + " 난입!";
    updateBossHud();
    updateHud();
    shake = 18;
    sound("hit");
  }

  function resumeProjectiles() {
    projectiles.forEach((item) => item.frozen = false);
    const next = getTarget();
    targetRadius = 155;
    targetDirection = -1;
    gameState = next ? "incoming" : "between";
    spawnTimer = next ? 0 : .55;
  }

  function loseLife(projectile) {
    if (!projectiles.includes(projectile)) return;
    projectiles.splice(projectiles.indexOf(projectile), 1);
    lives -= projectile.explosive ? 2 : 1;
    lives = Math.max(0, lives);
    combo = 0;
    expression = "shy";
    obscuredTimer = Math.max(obscuredTimer, projectile.explosive ? 1.2 : .45);
    burst(360, 990, projectile.explosive ? 70 : 35, projectile.color);
    shake = projectile.explosive ? 25 : 12;
    sound("miss");
    showJudgement(projectile.explosive ? "폭발!" : "MISS!", "miss");
    if (lives <= 0) finishGame(false);
    else resumeProjectiles();
    updateHud();
  }

  function finishGame(clear) {
    gameState = "ended";
    projectiles = [];
    saveData.stats.plays += 1;
    saveData.best = Math.max(saveData.best, score);
    let reward = Math.max(15, Math.floor(score / 18));
    let unlock = "";
    if (clear && boss) {
      reward += boss.reward;
      saveData.stats.bosses += 1;
      unlock = boss.unlock;
      if (selectedStage.id === 4) saveData.specialAmmo += 3;
      else if (!saveData.skins.includes(unlock)) saveData.skins.push(unlock);
    }
    if (clear && gameMode === "story") {
      if (!saveData.clearedStages.includes(selectedStage.id)) saveData.clearedStages.push(selectedStage.id);
      saveData.unlockedStage = Math.max(saveData.unlockedStage, Math.min(8, selectedStage.id + 1));
    }
    saveData.coins += reward;
    saveData.records.push({ score, stage: `${gameMode === "battle" ? "연습" : "STAGE"} ${selectedStage.id}`, date: new Date().toLocaleDateString("ko-KR") });
    saveData.records.sort((a, b) => b.score - a.score);
    saveData.records = saveData.records.slice(0, 20);
    refreshAchievements();
    persist();
    syncHome();
    $("#resultKicker").textContent = clear ? (boss ? "BOSS DEFEATED" : "STAGE CLEAR") : "GAME OVER";
    $("#resultTitle").textContent = clear ? "성공!" : "다시 도전!";
    $("#resultScore").textContent = `${formatScore(score)}점`;
    $("#resultDetail").textContent = `${hits}회 명중 · 최고 ${combo} 콤보 · ${condition.name}`;
    $("#resultReward").textContent = `+${reward.toLocaleString("ko-KR")} GOLD`;
    $("#resultUnlock").textContent = unlock ? `해금: ${unlock}` : "";
    $("#nextButton").style.display = clear && gameMode === "story" && selectedStage.id < 8 ? "block" : "none";
    $("#resultModal").classList.add("show");
  }

  function updateBossHud() {
    $("#bossHp").style.width = `${bossMaxHp ? bossHp / bossMaxHp * 100 : 0}%`;
  }

  function updateHud() {
    $("#scoreLabel").textContent = formatScore(score);
    $("#lifeLabel").textContent = `LIFE ${lives}`;
    $$(".ammo i").forEach((item, index) => item.classList.toggle("off", index >= lives));
    $("#waveLabel").textContent = boss ? `HP ${bossHp} / ${bossMaxHp}` : `${hits} / ${selectedStage.goal}`;
    const target = getTarget();
    $("#poopLabel").textContent = target ? target.name : "발사 준비";
    $("#comboLabel").textContent = combo >= 2 ? `${combo} COMBO!` : "";
  }

  function showJudgement(text, className) {
    const element = $("#judgement");
    element.textContent = text;
    element.className = `judgement ${className}`;
    void element.offsetWidth;
    element.classList.add("show");
  }

  function update(dt) {
    stageTime += dt;
    shake *= .9;
    if (obscuredTimer > 0) obscuredTimer -= dt;
    updateParticles(dt);
    updateObstacles(dt);

    if (gameState === "intro") {
      spawnTimer -= dt;
      expression = spawnTimer < .3 ? "pain" : boss ? "surprise" : "strain";
      if (spawnTimer <= 0) spawnWave();
      return;
    }
    if (gameState === "between") {
      spawnTimer -= dt;
      expression = condition.expression;
      if (spawnTimer <= 0) spawnWave();
      return;
    }
    if (gameState === "power") {
      powerPosition += powerDirection * dt * 1.35;
      if (powerPosition >= 1 || powerPosition <= 0) {
        powerPosition = clamp(powerPosition, 0, 1);
        powerDirection *= -1;
      }
      $("#powerNeedle").style.left = `calc(${powerPosition * 100}% - 4px)`;
      $("#powerLevel").textContent = clamp(Math.ceil((1 - Math.abs(powerPosition - .5) * 2) * 10), 1, 10);
      return;
    }
    if (gameState === "shot") {
      shotProgress += dt * 3.4;
      if (shotProgress >= 1) resolveShot();
      return;
    }
    if (gameState !== "incoming") return;

    const target = getTarget();
    if (target) {
      targetRadius += targetDirection * dt * (130 + selectedStage.id * 5);
      if (targetRadius <= 36 || targetRadius >= 155) targetDirection *= -1;
      targetRadius = clamp(targetRadius, 36, 155);
    }

    for (const projectile of [...projectiles]) {
      if (projectile.frozen) continue;
      projectile.age += dt;
      applyStagePhysics(projectile, dt);
      projectile.x += projectile.vx * dt;
      projectile.y += projectile.vy * dt;
      projectile.rotation += dt * 3;
      collideObstacles(projectile);
      if (projectile.x < 38 || projectile.x > W - 38) {
        projectile.x = clamp(projectile.x, 38, W - 38);
        projectile.vx *= -1;
      }
      if (projectile.y > 1030) loseLife(projectile);
    }
  }

  function applyStagePhysics(projectile, dt) {
    if (selectedStage.mechanic === "rain" || selectedStage.mechanic === "final") {
      const wind = Math.sin(stageTime * .8) * (selectedStage.mechanic === "final" ? 95 : 65);
      projectile.vx += wind * dt;
    }
    if (projectile.wobble) projectile.x += Math.sin(projectile.age * 8) * projectile.wobble * dt;
    if (selectedStage.mechanic === "bounce" && !projectile.bounced && projectile.y > 470 && projectile.y < 560) {
      projectile.vx = (projectile.x < W / 2 ? 1 : -1) * Math.max(145, Math.abs(projectile.vx));
      projectile.bounced = true;
    }
  }

  function updateObstacles(dt) {
    for (const obstacle of obstacles) {
      if (obstacle.type === "ball") {
        obstacle.x += obstacle.vx * dt;
        if (obstacle.x < 45 || obstacle.x > W - 45) obstacle.vx *= -1;
      } else if (obstacle.type === "crane") {
        obstacle.x += obstacle.vx * dt;
        if (obstacle.x < 50 || obstacle.x + obstacle.width > W - 50) obstacle.vx *= -1;
      } else if (obstacle.type === "block") {
        obstacle.y += obstacle.vy * dt;
        if (obstacle.y > 920) obstacle.y = 300;
      } else if (obstacle.type === "rotor") obstacle.angle += dt * 1.6;
    }
  }

  function collideObstacles(projectile) {
    for (const obstacle of obstacles) {
      if (obstacle.type === "ball" || obstacle.type === "block") {
        const radius = obstacle.radius + 28 * projectile.size;
        if (Math.hypot(projectile.x - obstacle.x, projectile.y - obstacle.y) < radius) {
          projectile.vx += (projectile.x - obstacle.x) * 3;
          projectile.vy *= .88;
          obstacle.x -= projectile.vx * .02;
        }
      } else if (obstacle.type === "crane" && projectile.y > obstacle.y - 18 && projectile.y < obstacle.y + 25 && projectile.x > obstacle.x && projectile.x < obstacle.x + obstacle.width) {
        projectile.vx += obstacle.vx * 1.4;
        projectile.vy *= .82;
      } else if (obstacle.type === "rotor") {
        const armX = obstacle.x + Math.cos(obstacle.angle) * obstacle.radius;
        const armY = obstacle.y + Math.sin(obstacle.angle) * obstacle.radius;
        if (Math.hypot(projectile.x - armX, projectile.y - armY) < 45) projectile.vx += Math.cos(obstacle.angle) * 210;
      }
    }
  }

  function updateParticles(dt) {
    particles.forEach((particle) => {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 420 * dt;
      particle.life -= dt;
    });
    particles = particles.filter((particle) => particle.life > 0);
  }

  function burst(x, y, amount, color) {
    for (let index = 0; index < amount; index += 1) {
      const angle = random(0, TAU);
      const speed = random(80, 430);
      particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, radius: random(3, 11), color, life: random(.45, 1.15) });
    }
  }

  function roundedRect(x, y, width, height, radius, fill, stroke = "#2a1735", lineWidth = 5) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }

  function draw() {
    ctx.save();
    if (shake > .2) ctx.translate(random(-shake, shake), random(-shake, shake));
    drawStage();
    drawTopLauncher();
    drawObstacles();
    drawProjectiles();
    drawPlayer();
    drawShot();
    drawParticles();
    drawWeather();
    if (obscuredTimer > 0) drawObscure();
    ctx.restore();
  }

  function drawStage() {
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, selectedStage.sky);
    gradient.addColorStop(.75, selectedStage.sky);
    gradient.addColorStop(.76, selectedStage.color);
    gradient.addColorStop(1, selectedStage.color);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
    if (!["fireworks", "final"].includes(selectedStage.mechanic)) {
      ctx.fillStyle = "#fff59a";
      ctx.beginPath();
      ctx.arc(625, 92, 48, 0, TAU);
      ctx.fill();
      drawCloud(90, 135, .8);
      drawCloud(555, 260, .62);
    }
    drawStageScenery();
  }

  function drawCloud(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = "#ffffffc8";
    [[0, 18, 40], [45, 0, 55], [93, 20, 42]].forEach(([cx, cy, radius]) => { ctx.beginPath(); ctx.arc(cx, cy, radius, 0, TAU); ctx.fill(); });
    ctx.restore();
  }

  function drawStageScenery() {
    switch (selectedStage.mechanic) {
      case "none":
        ctx.fillStyle = "#55a845";
        for (let x = 0; x < W; x += 150) { ctx.beginPath(); ctx.arc(x, 880, 95, Math.PI, TAU); ctx.fill(); }
        break;
      case "bounce":
      case "rain":
        for (let x = -10; x < W; x += 105) {
          const height = 180 + (x * 7 % 170);
          ctx.fillStyle = x % 210 ? "#607888" : "#7c6d82";
          ctx.fillRect(x, 875 - height, 88, height);
        }
        ctx.fillStyle = "#ffe345";
        ctx.fillRect(25, 475, 145, 45);
        ctx.fillRect(550, 530, 145, 45);
        break;
      case "balls":
        ctx.fillStyle = "#d8b365";
        ctx.fillRect(0, 860, W, 300);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 7;
        ctx.strokeRect(120, 900, 480, 220);
        for (const studentX of [80, 640]) {
          ctx.fillStyle = "#ffc68f";
          ctx.strokeStyle = "#2a1735";
          ctx.lineWidth = 5;
          ctx.beginPath(); ctx.arc(studentX, 805, 24, 0, TAU); ctx.fill(); ctx.stroke();
          roundedRect(studentX - 22, 829, 44, 65, 14, studentX < W / 2 ? "#62a8e5" : "#ef6f72", "#2a1735", 5);
          ctx.beginPath(); ctx.moveTo(studentX - 10, 894); ctx.lineTo(studentX - 18, 930); ctx.moveTo(studentX + 10, 894); ctx.lineTo(studentX + 18, 930); ctx.stroke();
        }
        break;
      case "crane":
        ctx.fillStyle = "#765d43";
        ctx.fillRect(0, 850, W, 310);
        ctx.strokeStyle = "#ffd735";
        ctx.lineWidth = 18;
        ctx.beginPath(); ctx.moveTo(80, 840); ctx.lineTo(80, 350); ctx.lineTo(420, 350); ctx.stroke();
        break;
      case "rotate":
        ctx.fillStyle = "#63b866";
        ctx.fillRect(0, 850, W, 310);
        ctx.fillStyle = "#e95d9e";
        ctx.beginPath(); ctx.moveTo(40, 850); ctx.lineTo(170, 650); ctx.lineTo(300, 850); ctx.fill();
        break;
      case "fireworks":
      case "final":
        ctx.fillStyle = selectedStage.mechanic === "final" ? "#38213f" : "#743a77";
        ctx.fillRect(0, 820, W, 340);
        break;
    }
  }

  function drawTopLauncher() {
    if (boss) {
      ctx.save();
      ctx.translate(115, 122);
      roundedRect(-28, 25, 90, 62, 25, "#ff7040");
      ctx.fillStyle = "#ffc68f";
      ctx.beginPath(); ctx.arc(65, 70, 28, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.restore();
      drawExpressionFace(82, 88, 82, "surprise");
      if (bossImage.complete && bossImage.naturalWidth) {
        ctx.save();
        ctx.shadowColor = "#ff3f67";
        ctx.shadowBlur = 18;
        ctx.drawImage(bossImage, 270, 32, 255, 167);
        ctx.restore();
      } else drawFallbackFace(395, 112, 82, "surprise");
      return;
    }
    ctx.save();
    ctx.translate(360, 116);
    ctx.strokeStyle = "#2a1735";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(35, 62); ctx.lineTo(90, 115); ctx.moveTo(85, 55); ctx.lineTo(135, 103); ctx.stroke();
    roundedRect(-5, 52, 145, 92, 38, "#ff7040");
    ctx.fillStyle = "#ffc68f";
    ctx.beginPath(); ctx.arc(125, 105, 43, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#8a4935";
    ctx.beginPath(); ctx.arc(159, 111, 7, 0, TAU); ctx.fill();
    ctx.restore();
    drawExpressionFace(284, 88, 115, expression);
  }

  function drawExpressionFace(x, y, size, emotion) {
    if (faceImage.complete && faceImage.naturalWidth) {
      const data = GAME_DATA.expressions[emotion] || GAME_DATA.expressions.normal;
      const sw = faceImage.naturalWidth / 2;
      const sh = faceImage.naturalHeight / 3;
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, TAU);
      ctx.clip();
      ctx.drawImage(faceImage, data.col * sw, data.row * sh, sw, sh, x - size / 2, y - size / 2, size, size);
      ctx.restore();
      ctx.strokeStyle = "#2a1735";
      ctx.lineWidth = 7;
      ctx.beginPath(); ctx.arc(x, y, size / 2, 0, TAU); ctx.stroke();
    } else drawFallbackFace(x, y, size / 2, emotion);
  }

  function drawFallbackFace(x, y, radius, emotion) {
    ctx.fillStyle = "#ffc68f";
    ctx.strokeStyle = "#2a1735";
    ctx.lineWidth = 7;
    ctx.beginPath(); ctx.arc(x, y, radius, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#2a1735";
    if (emotion === "happy") {
      ctx.beginPath(); ctx.arc(x - 20, y - 8, 10, 0, Math.PI); ctx.arc(x + 20, y - 8, 10, 0, Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y + 12, 22, 0, Math.PI); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.arc(x - 18, y - 8, 6, 0, TAU); ctx.arc(x + 18, y - 8, 6, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x, y + 18, emotion === "surprise" ? 14 : 20, emotion === "surprise" ? 18 : 9, 0, 0, TAU); ctx.stroke();
    }
  }

  function drawProjectiles() {
    for (const projectile of projectiles) drawPoop(projectile);
    const target = getTarget();
    if (target && ["incoming", "power"].includes(gameState)) drawTarget(target);
  }

  function drawPoop(projectile) {
    ctx.save();
    ctx.translate(projectile.x, projectile.y);
    ctx.rotate(projectile.rotation);
    ctx.scale(projectile.size, projectile.size);
    ctx.shadowColor = projectile.glow || "transparent";
    ctx.shadowBlur = projectile.glow ? 24 : 0;
    ctx.fillStyle = projectile.color;
    ctx.strokeStyle = projectile.outline;
    ctx.lineWidth = 7;
    ctx.beginPath();
    if (projectile.id === "rabbit") {
      ctx.ellipse(0, 0, 35, 28, 0, 0, TAU);
    } else {
      ctx.moveTo(-48, 38); ctx.bezierCurveTo(-73, 8, -48, -12, -28, -13); ctx.bezierCurveTo(-44, -40, -16, -53, 2, -40); ctx.bezierCurveTo(-5, -70, 26, -75, 32, -44); ctx.bezierCurveTo(63, -45, 71, -16, 48, -2); ctx.bezierCurveTo(78, 10, 67, 39, 48, 41); ctx.closePath();
    }
    ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#25140f";
    ctx.beginPath(); ctx.arc(-17, 4, 6, 0, TAU); ctx.arc(18, 4, 6, 0, TAU); ctx.fill();
    ctx.strokeStyle = "#25140f"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 17, 13, 0, Math.PI); ctx.stroke();
    if (projectile.explosive) {
      ctx.strokeStyle = "#ffdd36"; ctx.lineWidth = 5;
      for (let i = 0; i < 6; i += 1) { const a = i * TAU / 6; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 48, Math.sin(a) * 48); ctx.lineTo(Math.cos(a) * 67, Math.sin(a) * 67); ctx.stroke(); }
    }
    ctx.restore();
  }

  function drawTarget(target) {
    ctx.save();
    ctx.translate(target.x, target.y);
    ctx.setLineDash([11, 7]);
    ctx.strokeStyle = "#fff45b";
    ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(0, 0, 48, 0, TAU); ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = targetRadius < 57 ? "#fff45b" : "#fff";
    ctx.shadowColor = targetRadius < 57 ? "#fff45b" : "#65edff";
    ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.arc(0, 0, targetRadius, 0, TAU); ctx.stroke();
    ctx.restore();
  }

  function drawPlayer() {
    ctx.save();
    ctx.translate(360, 1035);
    ctx.fillStyle = "#ffc68f";
    ctx.strokeStyle = "#2a1735";
    ctx.lineWidth = 7;
    ctx.beginPath(); ctx.arc(0, -70, 52, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#48302a";
    ctx.beginPath(); ctx.arc(0, -91, 48, Math.PI, TAU); ctx.fill();
    roundedRect(-50, -25, 100, 112, 28, "#7144cf");
    ctx.strokeStyle = "#8b512e";
    ctx.lineWidth = 13;
    ctx.beginPath(); ctx.moveTo(-40, 12); ctx.lineTo(-82, -72); ctx.moveTo(40, 12); ctx.lineTo(82, -72); ctx.stroke();
    ctx.strokeStyle = "#2a1735"; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(-82, -72); ctx.lineTo(0, gameState === "power" ? -10 : -58); ctx.lineTo(82, -72); ctx.stroke();
    ctx.restore();
  }

  function drawShot() {
    if (gameState !== "shot" || !shotTarget) return;
    const t = clamp(shotProgress, 0, 1);
    const startX = 360;
    const startY = 965;
    const x = startX + (shotTarget.x - startX) * t;
    const y = startY + (shotTarget.y - startY) * t - Math.sin(t * Math.PI) * 80;
    ctx.strokeStyle = "#ffffffb5";
    ctx.lineWidth = 12;
    ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(x, y); ctx.stroke();
    ctx.fillStyle = saveData.specialAmmo > 0 ? "#ffe04b" : "#d4e9f2";
    ctx.strokeStyle = "#2a1735"; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(x, y, 15, 0, TAU); ctx.fill(); ctx.stroke();
  }

  function drawObstacles() {
    for (const obstacle of obstacles) {
      if (obstacle.type === "ball") {
        ctx.fillStyle = obstacle.radius > 30 ? "#fff" : "#f27932";
        ctx.strokeStyle = "#2a1735"; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.arc(obstacle.x, obstacle.y, obstacle.radius, 0, TAU); ctx.fill(); ctx.stroke();
      } else if (obstacle.type === "crane") {
        ctx.fillStyle = "#ffd43a"; ctx.strokeStyle = "#2a1735"; ctx.lineWidth = 6;
        ctx.fillRect(obstacle.x, obstacle.y - 14, obstacle.width, 28); ctx.strokeRect(obstacle.x, obstacle.y - 14, obstacle.width, 28);
      } else if (obstacle.type === "block") {
        roundedRect(obstacle.x - 28, obstacle.y - 28, 56, 56, 5, "#8d8783");
      } else if (obstacle.type === "rotor") {
        ctx.save(); ctx.translate(obstacle.x, obstacle.y); ctx.rotate(obstacle.angle); ctx.strokeStyle = "#f8db4a"; ctx.lineWidth = 24;
        ctx.beginPath(); ctx.moveTo(-obstacle.radius, 0); ctx.lineTo(obstacle.radius, 0); ctx.moveTo(0, -obstacle.radius); ctx.lineTo(0, obstacle.radius); ctx.stroke(); ctx.restore();
      }
    }
  }

  function drawWeather() {
    if (selectedStage.mechanic === "rain") {
      ctx.strokeStyle = "#c9efff99"; ctx.lineWidth = 3;
      for (let index = 0; index < 55; index += 1) { const x = (index * 83 + stageTime * 420) % (W + 100) - 50; const y = (index * 127 + stageTime * 530) % H; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 18, y + 42); ctx.stroke(); }
    }
    if (["fireworks", "final"].includes(selectedStage.mechanic)) {
      for (let burstIndex = 0; burstIndex < 4; burstIndex += 1) {
        const phase = (stageTime * .55 + burstIndex * .27) % 1;
        const x = 100 + burstIndex * 170;
        const y = 230 + (burstIndex % 2) * 150;
        ctx.strokeStyle = ["#ff5a72", "#ffe34d", "#6eefff", "#dd72ff"][burstIndex];
        ctx.globalAlpha = 1 - phase;
        ctx.lineWidth = 4;
        for (let ray = 0; ray < 10; ray += 1) { const angle = ray * TAU / 10; ctx.beginPath(); ctx.moveTo(x + Math.cos(angle) * phase * 20, y + Math.sin(angle) * phase * 20); ctx.lineTo(x + Math.cos(angle) * phase * 95, y + Math.sin(angle) * phase * 95); ctx.stroke(); }
      }
      ctx.globalAlpha = 1;
    }
  }

  function drawObscure() {
    ctx.globalAlpha = clamp(obscuredTimer, 0, .78);
    ctx.fillStyle = boss ? "#5f321f" : "#fff";
    for (let index = 0; index < 18; index += 1) { ctx.beginPath(); ctx.arc((index * 137) % W, (index * 223) % H, 35 + index % 4 * 16, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
  }

  function drawParticles() {
    for (const particle of particles) {
      ctx.globalAlpha = clamp(particle.life, 0, 1);
      ctx.fillStyle = particle.color;
      ctx.beginPath(); ctx.arc(particle.x, particle.y, particle.radius, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function frame(timestamp) {
    const dt = Math.min((timestamp - lastTimestamp) / 1000 || 0, .033);
    lastTimestamp = timestamp;
    if (currentScreen === "gameScreen") update(dt);
    draw();
    requestAnimationFrame(frame);
  }

  $("#fireButton").addEventListener("pointerdown", handleFire);
  canvas.addEventListener("pointerdown", handleFire);
  $("#prepStartButton").addEventListener("click", confirmPrep);
  $("#prepCancelButton").addEventListener("click", () => $("#prepModal").classList.remove("show"));
  $("#retryButton").addEventListener("click", () => { $("#resultModal").classList.remove("show"); openPrep(gameMode, selectedStage); });
  $("#nextButton").addEventListener("click", () => { $("#resultModal").classList.remove("show"); openPrep("story", stageById(Math.min(8, selectedStage.id + 1))); });
  $("#homeButton").addEventListener("click", () => { $("#resultModal").classList.remove("show"); gameState = "idle"; showScreen("homeScreen"); });
  $("#backButton").addEventListener("click", () => { gameState = "idle"; projectiles = []; $("#resultModal").classList.remove("show"); $("#prepModal").classList.remove("show"); showScreen("homeScreen"); });

  document.addEventListener("click", (event) => {
    const screenButton = event.target.closest("[data-screen]");
    if (screenButton) showScreen(screenButton.dataset.screen);
    if (event.target.closest('[data-action="battle"]')) openPrep("battle", GAME_DATA.stages[0]);
    const stageButton = event.target.closest("[data-stage]");
    if (stageButton) openPrep("story", stageById(Number(stageButton.dataset.stage)));
    const arenaButton = event.target.closest("[data-arena]");
    if (arenaButton) { selectedStage = stageById(Number(arenaButton.dataset.arena)); renderPrep(); }
    const boostButton = event.target.closest("[data-boost]");
    if (boostButton && !boostButton.disabled) { selectedBoosts.has(boostButton.dataset.boost) ? selectedBoosts.delete(boostButton.dataset.boost) : selectedBoosts.add(boostButton.dataset.boost); renderPrep(); }
    const weaponButton = event.target.closest("[data-weapon]");
    if (weaponButton) {
      const item = weaponById(weaponButton.dataset.weapon);
      if (saveData.ownedWeapons.includes(item.id)) {
        saveData.equipped = item.id;
        toast(`${item.name} 장착`);
      } else if (saveData.coins >= item.price) {
        saveData.coins -= item.price;
        saveData.ownedWeapons.push(item.id);
        saveData.equipped = item.id;
        toast(`${item.name} 구매 완료`);
      } else return toast("골드가 부족합니다.");
      persist();
      renderShop();
      syncHome();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!["Space", "Enter"].includes(event.code) || currentScreen !== "gameScreen") return;
    event.preventDefault();
    handleFire();
  });

  syncHome();
  showScreen("homeScreen");
  requestAnimationFrame(frame);
  if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
})();
