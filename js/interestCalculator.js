class InterestCalculator {
  static compute({ unknown, capital, ratePercent, timeYears, interest }) {
    const rateDecimal = ratePercent / 100;
    if (unknown === 'interest') {
      return capital * rateDecimal * timeYears;
    }
    if (unknown === 'capital') {
      return interest / (rateDecimal * timeYears);
    }
    if (unknown === 'rate') {
      return (interest / (capital * timeYears)) * 100;
    }
    if (unknown === 'time') {
      return interest / (capital * rateDecimal);
    }
    throw new Error('Incógnita no soportada');
  }
}

export default InterestCalculator;
