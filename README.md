<<<<<<< HEAD
# Wompus
# Wompus
<!DOCTYPE html>

<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Wumpus World Agent - README</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      background: #f4f6f8;
      color: #222;
      line-height: 1.6;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    code {
      background: #e8eaed;
      padding: 2px 6px;
      border-radius: 4px;
    }
    pre {
      background: #1e1e1e;
      color: #ddd;
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
    }
    .box {
      background: white;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
  </style>
</head>
<body>

<h1>Wumpus World Agent</h1>

<div class="box">
  <h2>Overview</h2>
  <p>
    This project implements an intelligent agent for the Wumpus World environment.
    The agent uses logical reasoning with CNF (Conjunctive Normal Form) and
    Resolution to safely navigate the grid and find the gold.
  </p>
</div>

<div class="box">
  <h2>Features</h2>
  <ul>
    <li>Grid-based Wumpus World simulation</li>
    <li>Knowledge Base with percept tracking</li>
    <li>CNF conversion for logical reasoning</li>
    <li>Resolution-based inference engine</li>
    <li>Safe and dangerous cell detection</li>
    <li>Step-by-step and automatic gameplay</li>
  </ul>
</div>

<div class="box">
  <h2>Project Structure</h2>
  <ul>
    <li><code>index.html</code> - Main UI</li>
    <li><code>app.js</code> - Game logic and inference engine</li>
    <li><code>styles.css</code> - Styling</li>
  </ul>
</div>

<div class="box">
  <h2>How It Works</h2>

  <h3>1. Knowledge Base</h3>
  <p>
    Each visited cell stores percepts:
    <code>breeze</code> and <code>stench</code>.
  </p>

  <h3>2. CNF Conversion</h3>
  <p>Rules are converted into CNF clauses:</p>

  <pre>
Breeze  → (P1 ∨ P2 ∨ ...)
No Breeze → ¬P1 ∧ ¬P2 ∧ ...

Stench → (W1 ∨ W2 ∨ ...)
No Stench → ¬W1 ∧ ¬W2 ∧ ...
  </pre>

  <h3>3. Resolution</h3>
  <p>
    The agent uses resolution refutation to determine whether a cell is safe.
    If a contradiction is found, the assumption is false.
  </p>

  <h3>4. Decision Making</h3>
  <ul>
    <li>Move to safe cells first</li>
    <li>If no safe move, take calculated risk</li>
    <li>Stop if no moves available</li>
  </ul>
</div>

<div class="box">
  <h2>How to Run</h2>
  <ol>
    <li>Open <code>index.html</code> in browser</li>
    <li>Or host using GitHub Pages</li>
    <li>Click <b>New Game</b></li>
    <li>Use <b>Step</b> or <b>Auto</b> mode</li>
  </ol>
</div>

<div class="box">
  <h2>Concepts Used</h2>
  <ul>
    <li>Artificial Intelligence</li>
    <li>Knowledge-Based Agents</li>
    <li>First Order Logic</li>
    <li>CNF Conversion</li>
    <li>Resolution Algorithm</li>
  </ul>
</div>

<div class="box">
  <h2>Author</h2>
  <p>
    Muhammad Faizan<br>
    BS Computer Science
  </p>
</div>

</body>
</html>
=======
<h1>Wumpus World Agent</h1>

<p>
An intelligent agent that explores a Wumpus World grid using logical reasoning.  
It uses percepts like breeze and stench to infer safe paths and avoid danger.
</p>

<h2>What it does</h2>
<ul>
  <li>Explores a grid world step by step</li>
  <li>Uses logic (CNF + resolution) to detect safe cells</li>
  <li>Avoids pits and Wumpus while searching for gold</li>
</ul>

<h2>How to run</h2>
<ul>
  <li>Open index.html in a browser</li>
  <li>Click New Game and use Step or Auto</li>
  <li>Watch the agent learn and move intelligently</li>
</ul>

<h2>Tech used</h2>
<ul>
  <li>HTML, CSS, JavaScript</li>
  <li>Knowledge based agent design</li>
  <li>CNF and resolution inference</li>
</ul>

<p>
Author: Muhammad Faizan (BS Computer Science)
</p>
>>>>>>> 56b8ebb (Final ReadMe)
