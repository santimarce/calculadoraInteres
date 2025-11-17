import InterestCalculator from './interestCalculator.js';
import CompoundCalculator from './compoundCalculator.js';

function parsePositiveNumber(value) {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function clearFeedback(feedbackEl) {
  if (!feedbackEl) return;
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';
}

function showFeedback(feedbackEl, message, type = 'info') {
  if (!feedbackEl) return;
  feedbackEl.textContent = message;
  feedbackEl.className = `feedback feedback--${type}`;
}

// --- Interés simple ---
const simpleForm = document.getElementById('interest-form');
const simpleFeedback = document.getElementById('feedback');
const simpleResetBtn = document.getElementById('reset-btn');

function validateSimple({ capital, ratePercent, timeYears, interest, unknown, formula, userResult }) {
  if (!unknown) return 'Selecciona la incógnita que deseas calcular.';
  if (!formula.trim()) return 'Escribe la fórmula que vas a usar.';
  if (userResult === null) return 'Ingresa el valor que calculaste para la incógnita.';

  const requirements = {
    capital: [interest, ratePercent, timeYears],
    rate: [capital, interest, timeYears],
    time: [capital, interest, ratePercent],
    interest: [capital, ratePercent, timeYears],
  };

  const missingKnown = requirements[unknown].some((value) => value === null);
  if (missingKnown) return 'Completa todos los valores conocidos con números positivos.';

  return '';
}

function buildSimpleSummary({ unknown, computed }) {
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

function handleSimpleSubmit(event) {
  event.preventDefault();
  if (!simpleForm) return;

  const capital = parsePositiveNumber(simpleForm.capital.value);
  const ratePercent = parsePositiveNumber(simpleForm.rate.value);
  const timeYears = parsePositiveNumber(simpleForm.time.value);
  const interest = parsePositiveNumber(simpleForm.interest.value);
  const unknown = simpleForm.unknown.value;
  const formula = simpleForm.formula.value || '';
  const userResult = parsePositiveNumber(simpleForm['user-result'].value);

  const error = validateSimple({ capital, ratePercent, timeYears, interest, unknown, formula, userResult });
  if (error) return showFeedback(simpleFeedback, error, 'error');

  let computed;
  try {
    computed = InterestCalculator.compute({ unknown, capital, ratePercent, timeYears, interest });
  } catch (err) {
    return showFeedback(simpleFeedback, 'Ocurrió un problema al calcular. Revisa los datos ingresados.', 'error');
  }

  const tolerance = Math.max(0.0001, Math.abs(computed) * 0.005);
  const isCorrect = Math.abs(computed - userResult) <= tolerance;
  const summary = buildSimpleSummary({ unknown, computed });

  if (isCorrect) {
    showFeedback(simpleFeedback, `¡Bien! Tu resultado está dentro del margen esperado. ${summary}`, 'success');
  } else {
    const diff = Math.abs(computed - userResult).toFixed(4);
    showFeedback(simpleFeedback, `El resultado no coincide. ${summary}. Diferencia observada: ${diff}.`, 'error');
  }
}

if (simpleForm) {
  simpleForm.addEventListener('submit', handleSimpleSubmit);
  simpleResetBtn?.addEventListener('click', () => clearFeedback(simpleFeedback));
}

// --- Interés compuesto ---
const compoundForm = document.getElementById('compound-form');
const compoundFeedback = document.getElementById('compound-feedback');
const compoundResetBtn = document.getElementById('compound-reset');

function validateCompound({
  capital,
  ratePercent,
  timeYears,
  frequency,
  amount,
  unknown,
  formula,
  userResult,
}) {
  if (!unknown) return 'Selecciona la incógnita que deseas calcular.';
  if (!formula.trim()) return 'Escribe la fórmula que vas a usar.';
  if (userResult === null) return 'Ingresa el valor que calculaste para la incógnita.';

  const requirements = {
    capital: [amount, ratePercent, timeYears, frequency],
    rate: [amount, capital, timeYears, frequency],
    time: [amount, capital, ratePercent, frequency],
    amount: [capital, ratePercent, timeYears, frequency],
    interest: [capital, ratePercent, timeYears, frequency],
  };

  const missingKnown = requirements[unknown].some((value) => value === null);
  if (missingKnown) return 'Completa todos los valores conocidos con números positivos.';

  return '';
}

function buildCompoundSummary({ unknown, computed }) {
  const labelMap = {
    capital: 'Capital (C)',
    rate: 'Tasa (i)',
    time: 'Tiempo (n)',
    amount: 'Monto final (M)',
    interest: 'Interés (I)',
  };
  const unit = unknown === 'rate' ? '%' : '';
  let formatted = computed;
  if (unknown === 'rate') {
    formatted = computed.toFixed(4);
  } else if (unknown === 'time') {
    formatted = computed.toFixed(3);
  } else {
    formatted = computed.toFixed(2);
  }
  return `${labelMap[unknown]} esperado: ${formatted}${unit}`;
}

function handleCompoundSubmit(event) {
  event.preventDefault();
  if (!compoundForm) return;

  const capital = parsePositiveNumber(compoundForm['c-capital'].value);
  const ratePercent = parsePositiveNumber(compoundForm['c-rate'].value);
  const timeYears = parsePositiveNumber(compoundForm['c-time'].value);
  const frequency = parsePositiveNumber(compoundForm['c-frequency'].value);
  const amountInput = parsePositiveNumber(compoundForm['c-amount'].value);
  const interest = parsePositiveNumber(compoundForm['c-interest'].value);
  const amount = amountInput ?? (interest !== null && capital !== null ? capital + interest : null);
  const unknown = compoundForm['c-unknown'].value;
  const formula = compoundForm['c-formula'].value || '';
  const userResult = parsePositiveNumber(compoundForm['c-user-result'].value);

  const error = validateCompound({ capital, ratePercent, timeYears, frequency, amount, unknown, formula, userResult });
  if (error) return showFeedback(compoundFeedback, error, 'error');

  let computed;
  try {
    computed = CompoundCalculator.compute({ unknown, capital, ratePercent, timeYears, frequency, amount });
  } catch (err) {
    return showFeedback(compoundFeedback, 'Ocurrió un problema al calcular. Revisa los datos ingresados.', 'error');
  }

  const tolerance = Math.max(0.0001, Math.abs(computed) * 0.005);
  const isCorrect = Math.abs(computed - userResult) <= tolerance;
  const summary = buildCompoundSummary({ unknown, computed });

  if (isCorrect) {
    showFeedback(compoundFeedback, `¡Bien! Tu resultado está dentro del margen esperado. ${summary}`, 'success');
  } else {
    const diff = Math.abs(computed - userResult).toFixed(4);
    showFeedback(compoundFeedback, `El resultado no coincide. ${summary}. Diferencia observada: ${diff}.`, 'error');
  }
}

if (compoundForm) {
  compoundForm.addEventListener('submit', handleCompoundSubmit);
  compoundResetBtn?.addEventListener('click', () => clearFeedback(compoundFeedback));
}
