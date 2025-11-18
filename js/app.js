import InterestCalculator from './interestCalculator.js';
import CompoundCalculator from './compoundCalculator.js';
import LoanSimulator from './loanSimulator.js';

const form = document.getElementById('interest-form');
const feedback = document.getElementById('feedback');
const resetBtn = document.getElementById('reset-btn');

const compoundForm = document.getElementById('compound-form');
const compoundFeedback = document.getElementById('compound-feedback');
const compoundReset = document.getElementById('compound-reset');

const loanForm = document.getElementById('loan-form');
const loanFeedback = document.getElementById('loan-feedback');
const loanResults = document.getElementById('loan-results');
const loanMethodLabel = document.getElementById('loan-method-label');
const loanSummary = document.getElementById('loan-summary');
const loanTbody = document.getElementById('loan-tbody');
const loanReset = document.getElementById('loan-reset');

function clearFeedback(node) {
  node.textContent = '';
  node.className = 'feedback';
}

function showFeedback(node, message, type = 'info') {
  node.textContent = message;
  node.className = `feedback feedback--${type}`;
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
    showFeedback(feedback, error, 'error');
    return;
  }

  let computed;
  try {
    computed = InterestCalculator.compute({ unknown, capital, ratePercent, timeYears, interest });
  } catch (err) {
    showFeedback(feedback, 'Ocurrió un problema al calcular. Revisa los datos ingresados.', 'error');
    return;
  }

  const tolerance = Math.max(0.0001, Math.abs(computed) * 0.005);
  const isCorrect = Math.abs(computed - userResult) <= tolerance;

  const summary = buildSummary({ unknown, computed });
  if (isCorrect) {
    showFeedback(feedback, `¡Bien! Tu resultado está dentro del margen esperado. ${summary}`, 'success');
  } else {
    const diff = Math.abs(computed - userResult).toFixed(4);
    showFeedback(feedback, `El resultado no coincide. ${summary}. Diferencia observada: ${diff}.`, 'error');
  }
}

function validateCompound({ capital, ratePercent, timeYears, frequency, amount, unknown, userResult }) {
  if (!unknown) {
    return 'Selecciona la incógnita que deseas calcular.';
  }
  if (userResult === null) {
    return 'Ingresa el valor que calculaste para la incógnita.';
  }
  if (!Number.isFinite(frequency) || frequency <= 0) {
    return 'La capitalización por año debe ser un número entero positivo.';
  }

  const requirements = {
    amount: [capital, ratePercent, timeYears, frequency],
    interest: [capital, ratePercent, timeYears, frequency],
    capital: [amount, ratePercent, timeYears, frequency],
    rate: [capital, amount, timeYears, frequency],
    time: [capital, amount, ratePercent, frequency],
  };

  const missingKnown = requirements[unknown].some((value) => value === null);
  if (missingKnown) {
    return 'Completa todos los valores conocidos con números positivos.';
  }

  return '';
}

function handleCompoundSubmit(event) {
  event.preventDefault();

  const capital = parsePositiveNumber(compoundForm['c-capital'].value);
  const ratePercent = parsePositiveNumber(compoundForm['c-rate'].value);
  const timeYears = parsePositiveNumber(compoundForm['c-time'].value);
  const frequency = parsePositiveNumber(compoundForm['c-frequency'].value);
  const amount = parsePositiveNumber(compoundForm['c-amount'].value);
  const unknown = compoundForm['c-unknown'].value;
  const userResult = parsePositiveNumber(compoundForm['c-user-result'].value);

  const error = validateCompound({ capital, ratePercent, timeYears, frequency, amount, unknown, userResult });
  if (error) {
    showFeedback(compoundFeedback, error, 'error');
    return;
  }

  let computed;
  try {
    computed = CompoundCalculator.compute({ unknown, capital, ratePercent, timeYears, frequency, amount });
  } catch (err) {
    showFeedback(compoundFeedback, 'Ocurrió un problema al calcular. Revisa los datos ingresados.', 'error');
    return;
  }

  const tolerance = Math.max(0.0001, Math.abs(computed) * 0.005);
  const isCorrect = Math.abs(computed - userResult) <= tolerance;
  const labelMap = {
    amount: 'Monto (M)',
    interest: 'Interés (I)',
    capital: 'Capital (C)',
    rate: 'Tasa (i)',
    time: 'Tiempo (n)',
  };
  const unit = unknown === 'rate' ? '%' : '';
  const formatted = unknown === 'rate' ? computed.toFixed(4) : computed.toFixed(2);

  if (isCorrect) {
    showFeedback(compoundFeedback, `¡Bien! ${labelMap[unknown]} esperado: ${formatted}${unit}.`, 'success');
  } else {
    const diff = Math.abs(computed - userResult).toFixed(4);
    showFeedback(compoundFeedback, `El resultado no coincide. ${labelMap[unknown]} esperado: ${formatted}${unit}. Diferencia observada: ${diff}.`, 'error');
  }
}

function clearLoanResults() {
  loanResults.hidden = true;
  loanMethodLabel.textContent = '';
  loanSummary.textContent = '';
  loanTbody.innerHTML = '';
}

function renderLoanResults({ schedule, method, amount, ratePercent, years, frequency }) {
  const totalInterest = schedule.reduce((acc, row) => acc + row.interest, 0);
  const totalPayments = schedule.length;

  loanMethodLabel.textContent = method === 'francesa' ? 'Tabla francesa' : 'Tabla alemana';
  loanSummary.textContent = `C = ${amount.toFixed(2)}, i = ${ratePercent.toFixed(4)}% anual, n = ${years} años, m = ${frequency} pagos/año. Total interés: ${totalInterest.toFixed(2)}.`;

  loanTbody.innerHTML = schedule
    .map(({ period, payment, principal, interest, balance }) => {
      const [pay, prin, int, bal] = [payment, principal, interest, balance].map((value) => value.toFixed(2));
      return `<tr><td>${period}</td><td>${pay}</td><td>${prin}</td><td>${int}</td><td>${bal}</td></tr>`;
    })
    .join('');

  loanResults.hidden = false;
  showFeedback(loanFeedback, `Se generaron ${totalPayments} pagos con la tabla seleccionada.`, 'success');
}

function handleLoanSubmit(event) {
  event.preventDefault();

  const amount = parsePositiveNumber(loanForm['l-amount'].value);
  const ratePercent = parsePositiveNumber(loanForm['l-rate'].value);
  const years = parsePositiveNumber(loanForm['l-years'].value);
  const frequency = parsePositiveNumber(loanForm['l-frequency'].value);
  const method = loanForm['l-method'].value;

  clearLoanResults();

  if ([amount, ratePercent, years, frequency].some((value) => value === null)) {
    showFeedback(loanFeedback, 'Completa todos los valores con números positivos.', 'error');
    return;
  }

  if (!method) {
    showFeedback(loanFeedback, 'Selecciona el tipo de tabla a utilizar.', 'error');
    return;
  }

  let schedule;
  try {
    schedule = LoanSimulator.buildSchedule({ amount, ratePercent, years, frequency, method });
  } catch (err) {
    showFeedback(loanFeedback, 'Ocurrió un problema al generar la tabla. Revisa los datos ingresados.', 'error');
    return;
  }

  renderLoanResults({ schedule, method, amount, ratePercent, years, frequency });
}

form.addEventListener('submit', handleSubmit);
resetBtn.addEventListener('click', () => clearFeedback(feedback));

compoundForm.addEventListener('submit', handleCompoundSubmit);
compoundReset.addEventListener('click', () => clearFeedback(compoundFeedback));

loanForm.addEventListener('submit', handleLoanSubmit);
loanReset.addEventListener('click', () => {
  clearFeedback(loanFeedback);
  clearLoanResults();
});
