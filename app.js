let R, C, world, agentR, agentC, kb, inferCount, visited, percepts, safe, danger, gameOver, autoInterval;

function cell(r, c) { return r + '_' + c; }
function inBounds(r, c) { return r >= 0 && r < R && c >= 0 && c < C; }
function neighbors(r, c) {
  return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(([a,b]) => inBounds(a,b));
}

function resolutionRefutation(queryClauses) {
  const clauses = [...buildCNF(), ...queryClauses];
  const seen = new Set(clauses.map(clauseKey));

  while (true) {
    const newClauses = [];
    for (let i = 0; i < clauses.length; i++) {
      for (let j = i + 1; j < clauses.length; j++) {
        const resolvents = resolve(clauses[i], clauses[j]);
        for (const r of resolvents) {
          if (r.length === 0) return true;
          const k = clauseKey(r);
          if (!seen.has(k)) {
            seen.add(k);
            newClauses.push(r);
          }
        }
      }
    }
    if (newClauses.length === 0) return false;
    clauses.push(...newClauses);
  }
}

function buildCNF() {
  const clauses = [];
  for (const k of Object.keys(kb)) {
    const [r, c] = k.split('_').map(Number);
    const { breeze, stench } = kb[k];
    const nbrs = neighbors(r, c);

    if (breeze) {
      clauses.push(nbrs.map(([nr,nc]) => 'P_'+nr+'_'+nc));
    } else {
      for (const [nr, nc] of nbrs) clauses.push(['-P_'+nr+'_'+nc]);
    }

    if (stench) {
      clauses.push(nbrs.map(([nr,nc]) => 'W_'+nr+'_'+nc));
    } else {
      for (const [nr, nc] of nbrs) clauses.push(['-W_'+nr+'_'+nc]);
    }

    clauses.push(['-P_'+r+'_'+c]);
    clauses.push(['-W_'+r+'_'+c]);
  }
  return clauses;
}

function resolve(c1, c2) {
  const results = [];
  for (const lit of c1) {
    const neg = lit.startsWith('-') ? lit.slice(1) : '-' + lit;
    if (c2.includes(neg)) {
      const resolvent = [
        ...c1.filter(l => l !== lit),
        ...c2.filter(l => l !== neg)
      ];
      const unique = [...new Set(resolvent)];
      const isTautology = unique.some(l => unique.includes(l.startsWith('-') ? l.slice(1) : '-'+l));
      if (!isTautology) results.push(unique);
    }
  }
  return results;
}

function clauseKey(clause) { return [...clause].sort().join('|'); }

function isSafeByResolution(r, c) {
  const noPit = resolutionRefutation([['P_'+r+'_'+c]]);
  const noWumpus = resolutionRefutation([['W_'+r+'_'+c]]);
  return noPit && noWumpus;
}

function initGame() {
  clearInterval(autoInterval); autoInterval = null;
  R = +document.getElementById('rows').value;
  C = +document.getElementById('cols').value;

  world = Array.from({length: R}, () =>
    Array.from({length: C}, () => ({ pit: false, wumpus: false, gold: false }))
  );

  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      if (!(r === 0 && c === 0) && Math.random() < 0.2)
        world[r][c].pit = true;

  let wr, wc;
  do { wr = Math.floor(Math.random() * R); wc = Math.floor(Math.random() * C); }
  while (wr === 0 && wc === 0);
  world[wr][wc].wumpus = true;

  let gr, gc;
  do { gr = Math.floor(Math.random() * R); gc = Math.floor(Math.random() * C); }
  while (gr === 0 && gc === 0);
  world[gr][gc].gold = true;

  agentR = 0; agentC = 0;
  kb = {};
  inferCount = 0;
  visited = new Set();
  safe = new Set(); safe.add(cell(0,0));
  danger = new Set();
  percepts = [];
  gameOver = false;

  document.getElementById('stepBtn').disabled = false;
  document.getElementById('autoBtn').disabled = false;
  document.getElementById('autoBtn').textContent = 'Auto';
  document.getElementById('log').innerHTML = '';
  document.getElementById('status').textContent = '—';

  visit(agentR, agentC);
  render();
}

function visit(r, c) {
  visited.add(cell(r, c));
  safe.add(cell(r, c));

  let b = false, s = false;
  for (const [nr, nc] of neighbors(r, c)) {
    if (world[nr][nc].pit) b = true;
    if (world[nr][nc].wumpus) s = true;
  }

  kb[cell(r, c)] = { breeze: b, stench: s };
  percepts = [];
  if (b) percepts.push('Breeze');
  if (s) percepts.push('Stench');

  logMsg(`Visited (${r},${c}) → ${percepts.length ? percepts.join(', ') : 'Clear'}`);

  if (world[r][c].pit || world[r][c].wumpus) {
    gameOver = true;
    document.getElementById('status').textContent = world[r][c].pit ? '💀 Fell in pit' : '💀 Eaten by Wumpus';
    document.getElementById('stepBtn').disabled = true;
    document.getElementById('autoBtn').disabled = true;
    clearInterval(autoInterval);
  } else if (world[r][c].gold) {
    gameOver = true;
    document.getElementById('status').textContent = '🏆 Gold Found!';
    document.getElementById('stepBtn').disabled = true;
    document.getElementById('autoBtn').disabled = true;
    clearInterval(autoInterval);
    logMsg('Gold found! Agent wins!');
  }
}

function infer() {
  inferCount++;
  const candidates = new Set();
  for (const vc of visited) {
    const [vr, vc2] = vc.split('_').map(Number);
    for (const [nr, nc] of neighbors(vr, vc2)) {
      if (!visited.has(cell(nr, nc))) candidates.add(cell(nr, nc));
    }
  }

  for (const k of candidates) {
    const [r, c] = k.split('_').map(Number);
    if (safe.has(k) || danger.has(k)) continue;

    if (isSafeByResolution(r, c)) {
      safe.add(k);
      logMsg(`KB proves (${r},${c}) is SAFE`);
    } else {
      if (checkMustBeDanger(r, c)) {
        danger.add(k);
        logMsg(`KB infers (${r},${c}) is DANGEROUS`);
      }
    }
  }
}

function checkMustBeDanger(r, c) {
  for (const k of Object.keys(kb)) {
    const [kr, kc] = k.split('_').map(Number);
    const { breeze, stench } = kb[k];
    if (!breeze && !stench) continue;
    const nbrs = neighbors(kr, kc);
    const unknownNbrs = nbrs.filter(([nr, nc]) =>
      !visited.has(cell(nr, nc)) && !safe.has(cell(nr, nc))
    );
    if (unknownNbrs.length === 1 && unknownNbrs[0][0] === r && unknownNbrs[0][1] === c)
      return true;
  }
  return false;
}

function step() {
  if (gameOver) return;
  infer();

  const seen = new Set();
  const safeMoves = [];
  for (const vc of visited) {
    const [vr, vc2] = vc.split('_').map(Number);
    for (const [nr, nc] of neighbors(vr, vc2)) {
      const k = cell(nr, nc);
      if (!visited.has(k) && safe.has(k) && !danger.has(k) && !seen.has(k)) {
        safeMoves.push([nr, nc]);
        seen.add(k);
      }
    }
  }

  if (safeMoves.length > 0) {
    safeMoves.sort(([r1,c1],[r2,c2]) =>
      (Math.abs(r1-agentR)+Math.abs(c1-agentC)) - (Math.abs(r2-agentR)+Math.abs(c2-agentC))
    );
    [agentR, agentC] = safeMoves[0];
  } else {
    const risky = neighbors(agentR, agentC).filter(([nr, nc]) =>
      !visited.has(cell(nr, nc)) && !danger.has(cell(nr, nc))
    );
    if (risky.length === 0) {
      logMsg('Agent stuck — no moves available');
      document.getElementById('status').textContent = 'Stuck';
      return;
    }
    logMsg(`No safe moves — taking risky move to (${risky[0][0]},${risky[0][1]})`);
    [agentR, agentC] = risky[0];   // First-come-first-served from neighbor order
  }

  visit(agentR, agentC);
  render();
}

function toggleAuto() {
  if (autoInterval) {
    clearInterval(autoInterval); autoInterval = null;
    document.getElementById('autoBtn').textContent = 'Auto';
  } else {
    document.getElementById('autoBtn').textContent = 'Stop';
    autoInterval = setInterval(() => {
      if (gameOver) { clearInterval(autoInterval); return; }
      step();
    }, 600);
  }
}

function render() {
  const grid = document.getElementById('grid');
  grid.style.gridTemplateColumns = `repeat(${C}, 1fr)`;
  grid.innerHTML = '';

  for (let r = R - 1; r >= 0; r--) {
    for (let c = 0; c < C; c++) {
      const k = cell(r, c);
      const div = document.createElement('div');
      div.className = 'cell';
      const isAgent = (r === agentR && c === agentC);

      if (danger.has(k)) div.classList.add('danger');
      else if (safe.has(k)) div.classList.add('safe');
      else div.classList.add('unknown');
      if (isAgent) div.classList.add('agent');

      let icon = '';
      if (isAgent) {
        icon = '🤖';
      } else if (gameOver && (world[r][c].pit || world[r][c].wumpus || world[r][c].gold)) {
        if (world[r][c].pit) icon = '🕳️';
        if (world[r][c].wumpus) icon = '👹';
        if (world[r][c].gold) icon = '🏆';
      } else if (!visited.has(k)) {
        icon = danger.has(k) ? '⚠️' : '?';
      } else {
        const p = kb[k] || {};
        if (p.breeze && p.stench) icon = '💨😤';
        else if (p.breeze) icon = '💨';
        else if (p.stench) icon = '😤';
        else icon = '✓';
      }

      div.innerHTML = `<span class="icon">${icon}</span><span class="coords">(${r},${c})</span>`;
      grid.appendChild(div);
    }
  }

  document.getElementById('infer-count').textContent = inferCount;
  document.getElementById('visit-count').textContent = visited.size;
  document.getElementById('percept-list').textContent = percepts.length ? percepts.join(', ') : 'None';
  if (!gameOver) document.getElementById('status').textContent = `At (${agentR},${agentC})`;
}

function logMsg(msg) {
  const log = document.getElementById('log');
  const d = document.createElement('div');
  d.textContent = msg;
  log.prepend(d);
}

initGame();