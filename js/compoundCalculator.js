class CompoundCalculator {
  static compute({ unknown, capital, ratePercent, timeYears, frequency, amount }) {
    const rateDecimal = ratePercent / 100;
    const periods = timeYears * frequency;
    const growthFactor = 1 + rateDecimal / frequency;

    if (periods <= 0 || growthFactor <= 0) {
      throw new Error('Valores inválidos para el cálculo.');
    }

    if (unknown === 'amount') {
      return capital * Math.pow(growthFactor, periods);
    }

    if (unknown === 'interest') {
      return capital * (Math.pow(growthFactor, periods) - 1);
    }

    if (unknown === 'capital') {
      return amount / Math.pow(growthFactor, periods);
    }

    if (unknown === 'rate') {
      const base = Math.pow(amount / capital, 1 / periods);
      const rateDecimalResult = (base - 1) * frequency;
      return rateDecimalResult * 100;
    }

    if (unknown === 'time') {
      const ratio = amount / capital;
      return Math.log(ratio) / (frequency * Math.log(growthFactor));
    }

    throw new Error('Incógnita no soportada');
  }
}

export default CompoundCalculator;
