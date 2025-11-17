class LoanSimulator {
  static buildSchedule({ amount, ratePercent, years, frequency, method }) {
    const ratePerPeriod = ratePercent / 100 / frequency;
    const totalPayments = Math.round(years * frequency);

    if (!Number.isFinite(ratePerPeriod) || ratePerPeriod <= 0 || totalPayments <= 0) {
      throw new Error('Parámetros inválidos');
    }

    if (method === 'francesa') {
      return this.#buildFrenchSchedule({ amount, ratePerPeriod, totalPayments });
    }

    if (method === 'alemana') {
      return this.#buildGermanSchedule({ amount, ratePerPeriod, totalPayments });
    }

    throw new Error('Método no soportado');
  }

  static #buildFrenchSchedule({ amount, ratePerPeriod, totalPayments }) {
    const factor = Math.pow(1 + ratePerPeriod, totalPayments);
    const payment = amount * (ratePerPeriod * factor) / (factor - 1);
    let balance = amount;
    const schedule = [];

    for (let period = 1; period <= totalPayments; period += 1) {
      const interest = balance * ratePerPeriod;
      const principal = payment - interest;
      balance = Math.max(0, balance - principal);
      schedule.push({ period, payment, principal, interest, balance });
    }

    return schedule;
  }

  static #buildGermanSchedule({ amount, ratePerPeriod, totalPayments }) {
    const principalFixed = amount / totalPayments;
    let balance = amount;
    const schedule = [];

    for (let period = 1; period <= totalPayments; period += 1) {
      const interest = balance * ratePerPeriod;
      const payment = principalFixed + interest;
      balance = Math.max(0, balance - principalFixed);
      schedule.push({ period, payment, principal: principalFixed, interest, balance });
    }

    return schedule;
  }
}

export default LoanSimulator;
