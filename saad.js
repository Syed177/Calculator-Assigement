 const display = document.getElementById('display');

    function appendValue(value) {
      display.value += value;
    }

    function clearDisplay() {
      display.value = '';
    }

    function calculate() {
      try {
        const result = eval(display.value);
        console.log("Result:", result); // logs to console
        display.value = result;
      } catch (error) {
        console.error("Invalid expression", error);
        display.value = 'Error';
      }
    }

    // Make buttons styled consistently
    document.querySelectorAll('.btn').forEach(btn => {
      btn.classList.add(
        'p-3','rounded-lg','bg-gray-600','hover:bg-gray-500','font-bold','text-lg'
      );
    });