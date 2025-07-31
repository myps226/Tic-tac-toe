import './App.css';
import { useState, useEffect } from "react";

function Square({ value, onSquareClick, disabled }) {
  return (
    <button className="square" onClick={onSquareClick} disabled={disabled}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, isAITurn }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i] || isAITurn) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else if (squares.every(square => square !== null)) {
    status = "It's a draw!";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
    if (isAITurn) {
      status += " (AI is thinking...)";
    }
  }

  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} disabled={isAITurn} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} disabled={isAITurn} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} disabled={isAITurn} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} disabled={isAITurn} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} disabled={isAITurn} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} disabled={isAITurn} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} disabled={isAITurn} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} disabled={isAITurn} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} disabled={isAITurn} />
      </div>
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [gameMode, setGameMode] = useState('human'); // 'human' or 'ai'
  const [aiPlayer, setAiPlayer] = useState('O'); // 'X' or 'O'
  
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  const isAITurn = gameMode === 'ai' && 
                   !calculateWinner(currentSquares) && 
                   currentSquares.some(square => square === null) &&
                   ((aiPlayer === 'X' && xIsNext) || (aiPlayer === 'O' && !xIsNext));

  // AI move effect
  useEffect(() => {
    if (isAITurn) {
      const timer = setTimeout(() => {
        const aiMove = findBestMove(currentSquares, aiPlayer);
        if (aiMove !== null) {
          const nextSquares = currentSquares.slice();
          nextSquares[aiMove] = aiPlayer;
          handlePlay(nextSquares);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isAITurn, currentSquares, aiPlayer]);

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function resetGame() {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = "Go to move #" + move;
    } else {
      description = "Go to game start";
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-controls">
        <h2>Tic Tac Toe</h2>
        <div className="mode-selector">
          <label>
            <input
              type="radio"
              value="human"
              checked={gameMode === 'human'}
              onChange={(e) => {
                setGameMode(e.target.value);
                resetGame();
              }}
            />
            Human vs Human
          </label>
          <label>
            <input
              type="radio"
              value="ai"
              checked={gameMode === 'ai'}
              onChange={(e) => {
                setGameMode(e.target.value);
                resetGame();
              }}
            />
            Human vs AI
          </label>
        </div>
        {gameMode === 'ai' && (
          <div className="ai-settings">
            <label>
              AI plays as:
              <select
                value={aiPlayer}
                onChange={(e) => {
                  setAiPlayer(e.target.value);
                  resetGame();
                }}
              >
                <option value="O">O (AI goes second)</option>
                <option value="X">X (AI goes first)</option>
              </select>
            </label>
          </div>
        )}
        <button className="reset-button" onClick={resetGame}>
          New Game
        </button>
      </div>
      <div className="game-board">
        <Board 
          xIsNext={xIsNext} 
          squares={currentSquares} 
          onPlay={handlePlay}
          isAITurn={isAITurn}
        />
      </div>
      <div className="game-info">
        <h3>Move History</h3>
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

// AI Functions
function findBestMove(squares, aiPlayer) {
  const availableMoves = squares
    .map((square, index) => square === null ? index : null)
    .filter(index => index !== null);
  
  if (availableMoves.length === 0) return null;
  
  let bestMove = availableMoves[0];
  let bestScore = aiPlayer === 'X' ? -Infinity : Infinity;
  
  for (let move of availableMoves) {
    const newSquares = squares.slice();
    newSquares[move] = aiPlayer;
    
    const score = minimax(newSquares, 0, false, aiPlayer);
    
    if (aiPlayer === 'X' && score > bestScore) {
      bestScore = score;
      bestMove = move;
    } else if (aiPlayer === 'O' && score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  
  return bestMove;
}

function minimax(squares, depth, isMaximizing, aiPlayer) {
  const winner = calculateWinner(squares);
  const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';
  
  if (winner === aiPlayer) return 10 - depth;
  if (winner === humanPlayer) return depth - 10;
  if (squares.every(square => square !== null)) return 0;
  
  const availableMoves = squares
    .map((square, index) => square === null ? index : null)
    .filter(index => index !== null);
  
  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let move of availableMoves) {
      const newSquares = squares.slice();
      newSquares[move] = aiPlayer;
      const score = minimax(newSquares, depth + 1, false, aiPlayer);
      bestScore = Math.max(bestScore, score);
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let move of availableMoves) {
      const newSquares = squares.slice();
      newSquares[move] = humanPlayer;
      const score = minimax(newSquares, depth + 1, true, aiPlayer);
      bestScore = Math.min(bestScore, score);
    }
    return bestScore;
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
