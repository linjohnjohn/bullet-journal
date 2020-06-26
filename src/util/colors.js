export const THEME_COLORS = {
    ROSE: 'ROSE',
    NASSAU: 'NASSAU',
    BANANA: 'BANANA',
    ATLANTIS: 'ATLANTIS',
    FOREST: 'FOREST',
    ROYAL: 'ROYAL',
}

export const setColorTheme = (colorTheme) => {
    const [hue1, hue2, hue3] = generateHues(colorTheme);

  
    document.documentElement.style.setProperty('--hue0', hue1);
    document.documentElement.style.setProperty('--hue1', hue1);
    document.documentElement.style.setProperty('--hue2', hue2);
    document.documentElement.style.setProperty('--hue3', hue3);
    document.documentElement.style.setProperty('--hue4', hue3);
  }
  
export const generateHues = (colorTheme) => {
    let colorConfig = [40, -1];
    if (colorTheme === THEME_COLORS.NASSAU) {
      colorConfig = [190, -1]
    } else if (colorTheme === THEME_COLORS.BANANA) {
      colorConfig = [40, 1]
    } else if (colorTheme === THEME_COLORS.ATLANTIS) {
      colorConfig = [180, 1]
    } else if (colorTheme === THEME_COLORS.FOREST) {
      colorConfig = [80, 1]
    } else if (colorTheme === THEME_COLORS.ROYAL) {
      colorConfig = [270, 1]
    }
    const [ baseHue, sign ] = colorConfig;


    const hue1 = (baseHue + sign * 20) % 360;
    const hue2 = (baseHue + sign * 30) % 360
    const hue3 = (baseHue + sign * 40) % 360;
    return [hue1, hue2, hue3]
}