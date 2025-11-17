import InterestCalculator from './interestCalculator.js';

const form = document.getElementById('interest-form');
const feedback = document.getElementById('feedback');
const resetBtn = document.getElementById('reset-btn');

function clearFeedback() {
  feedback.textContent = '';
  feedback.className = 'feedback';
}

function showFeedback(message, type = 'info') {
  feedback.textContent = message;
  feedback.className = `feedback feedback--${type}`;
}

function parsePositiveNumber(value) {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function validateFields({ capital, ratePercent, timeYears, interest, unknown, formula, userResult }) {
  if (!unknown) {
    return 'Selecciona la incógnita que deseas calcular.';
  }
  if (!formula.trim()) {
    return 'Escribe la fórmula que vas a usar.';
  }
  if (userResult === null) {
    return 'Ingresa el valor que calculaste para la incógnita.';
  }

  const requirements = {
    capital: [interest, ratePercent, timeYears],
    rate: [capital, interest, timeYears],
    time: [capital, interest, ratePercent],
    interest: [capital, ratePercent, timeYears],
  };

  const missingKnown = requirements[unknown].some((value) => value === null);
  if (missingKnown) {
    return 'Completa todos los valores conocidos con números positivos.';
  }

  return '';
}

function buildSummary({ unknown, computed }) {
  const labelMap = {
    capital: 'Capital (C)',
    rate: 'Tasa (i)',
    time: 'Tiempo (n)',
    interest: 'Interés (I)',
  };
  const unit = unknown === 'rate' ? '%' : '';
  const formatted = unknown === 'rate' ? computed.toFixed(4) : computed.toFixed(2);
  return `${labelMap[unknown]} esperado: ${formatted}${unit}`;
}

function handleSubmit(event) {
  event.preventDefault();

  const capital = parsePositiveNumber(form.capital.value);
  const ratePercent = parsePositiveNumber(form.rate.value);
  const timeYears = parsePositiveNumber(form.time.value);
  const interest = parsePositiveNumber(form.interest.value);
  const unknown = form.unknown.value;
  const formula = form.formula.value || '';
  const userResult = parsePositiveNumber(form['user-result'].value);

  const error = validateFields({ capital, ratePercent, timeYears, interest, unknown, formula, userResult });
  if (error) {
    showFeedback(error, 'error');
    return;
  }

  let computed;
  try {
    computed = InterestCalculator.compute({ unknown, capital, ratePercent, timeYears, interest });
  } catch (err) {
    showFeedback('Ocurrió un problema al calcular. Revisa los datos ingresados.', 'error');
    return;
  }

  const tolerance = Math.max(0.0001, Math.abs(computed) * 0.005);
  const isCorrect = Math.abs(computed - userResult) <= tolerance;

  const summary = buildSummary({ unknown, computed });
  if (isCorrect) {
    showFeedback(`¡Bien! Tu resultado está dentro del margen esperado. ${summary}`, 'success');
  } else {
    const diff = Math.abs(computed - userResult).toFixed(4);
    showFeedback(`El resultado no coincide. ${summary}. Diferencia observada: ${diff}.`, 'error');
  }
}

form.addEventListener('submit', handleSubmit);
resetBtn.addEventListener('click', clearFeedback);
