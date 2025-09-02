  
    (function() {
      const exprEl = document.getElementById('expr');
      const resultEl = document.getElementById('result');
      const keys = document.querySelectorAll('.key');

      let expression = '';   // user expression as a string
      let lastWasOperator = false;

      // Utility: show expression (or 0)
      function renderExpr() {
        exprEl.textContent = expression || '0';
      }
      function renderResult(value) {
        resultEl.textContent = (value === '' || value === undefined) ? '0' : String(value);
      }

      // Insert a character (digit / dot / operator)
      function insertChar(ch) {
        // prevent multiple leading zeros like "00" (unless after decimal)
        if (/^\d$/.test(ch)) {
          // ok to append digit
          expression += ch;
          lastWasOperator = false;
        } else if (ch === '.') {
          // prevent multiple dots in the current number
          const parts = expression.split(/[\+\-\*\/]/);
          const last = parts[parts.length - 1] || '';
          if (!last.includes('.')) {
            // if empty, prepend 0
            expression += (last === '' ? '0.' : '.');
            lastWasOperator = false;
          }
        } else {
          // operator (+ - * /)
          if (expression === '' && ch === '-') {
            // allow unary minus at start
            expression = '-';
            lastWasOperator = true;
            return;
          }
          if (lastWasOperator) {
            // replace previous operator with new operator
            expression = expression.slice(0, -1) + ch;
          } else {
            expression += ch;
            lastWasOperator = true;
          }
        }
        renderExpr();
        tryComputePreview();
      }

      // Percent: convert last number to percentage (e.g. 50 -> 0.5)
      function percent() {
        // find last number
        const match = expression.match(/(\d+(\.\d+)?|\.\d+)$/);
        if (!match) return;
        const numText = match[0];
        const num = parseFloat(numText);
        const replaced = (num / 100).toString();
        expression = expression.slice(0, match.index) + replaced;
        renderExpr();
        tryComputePreview();
      }

      // Backspace
      function backspace() {
        if (!expression) return;
        expression = expression.slice(0, -1);
        // update operator flag
        lastWasOperator = /[+\-*/]$/.test(expression);
        renderExpr();
        tryComputePreview();
      }

      // Clear
      function clearAll() {
        expression = '';
        lastWasOperator = false;
        renderExpr();
        renderResult('0');
      }

      // Safely evaluate expression
      function safeEval(expr) {
        // Allow only digits, operators, decimal points, and parentheses
        if (!/^[0-9+\-*/().\s]+$/.test(expr)) {
          throw new Error('Invalid characters');
        }
        // Prevent sequences like "**" or "*/" etc.
        if (/(\*\*|\/\/|--|\+\+|[+\-*/]{2,})/.test(expr.replace(/\s+/g, ''))) {
          // we'll still try, but bail out to avoid nonsense
          throw new Error('Malformed expression');
        }
        // Use Function to evaluate (safer than eval in some contexts)
        // Note: all calculation happens in the browser — do not use for untrusted remote input.
        // Parentheses supported.
        return Function('"use strict"; return (' + expr + ')')();
      }

      // Try computing a preview result without throwing to user
      function tryComputePreview() {
        if (!expression) { renderResult('0'); return; }
        try {
          // if last char is operator, skip (incomplete)
          if (/[+\-*/]$/.test(expression)) {
            renderResult('');
            return;
          }
          const val = safeEval(expression);
          // display nicely (avoid long floats)
          const display = (typeof val === 'number' && !Number.isInteger(val)) ? Number(val.toFixed(10)) : val;
          renderResult(display);
        } catch (e) {
          // ignore preview errors
          renderResult('');
        }
      }

      // Equals (final evaluation)
      function computeEquals() {
        if (!expression) return;
        try {
          // avoid trailing operator
          if (/[+\-*/]$/.test(expression)) expression = expression.slice(0, -1);

          const val = safeEval(expression);
          const display = (typeof val === 'number' && !Number.isInteger(val)) ? Number(val.toFixed(10)) : val;
          renderResult(display);
          expression = String(display);
          lastWasOperator = false;
          renderExpr();
        } catch (e) {
          renderResult('Error');
        }
      }

      // Button wiring
      keys.forEach(btn => {
        btn.addEventListener('click', () => {
          const v = btn.getAttribute('data-value');
          const action = btn.getAttribute('data-action');

          if (action === 'clear') { clearAll(); return; }
          if (action === 'back') { backspace(); return; }
          if (action === 'percent') { percent(); return; }
          if (action === 'equals') { computeEquals(); return; }

          if (v) insertChar(v);
        });
      });

      // Keyboard support
      window.addEventListener('keydown', (ev) => {
        const key = ev.key;
        if ((key >= '0' && key <= '9') || key === '.') {
          insertChar(key);
          ev.preventDefault();
          return;
        }
        if (key === 'Enter' || key === '=') {
          computeEquals();
          ev.preventDefault();
          return;
        }
        if (key === 'Backspace') {
          backspace();
          ev.preventDefault();
          return;
        }
        if (key === 'Escape' || key.toLowerCase() === 'c') {
          clearAll();
          ev.preventDefault();
          return;
        }
        if (key === '+' || key === '-' || key === '*' || key === '/') {
          insertChar(key);
          ev.preventDefault();
          return;
        }
        if (key === '%') {
          percent();
          ev.preventDefault();
          return;
        }
      });

      // Initial render
      clearAll();
    })();
  