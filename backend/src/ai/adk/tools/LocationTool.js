export class LocationTool {
  static async execute({ latitude, longitude, address }) {
    const lat = latitude || 11.0168;
    const lng = longitude || 76.9558;
    const rawAddress = (address || '').toLowerCase();

    let ward = 'Ward 72 - RS Puram';
    let zone = 'Central Zone';
    let district = 'Coimbatore';
    let municipality = 'Coimbatore Municipal Corporation';
    let landmark = 'RS Puram Main Junction';

    if (rawAddress.includes('gandhipuram')) {
      ward = 'Ward 54 - Gandhipuram';
      zone = 'Central Zone';
      landmark = 'Gandhipuram Central Bus Stand';
    } else if (rawAddress.includes('peelamedu') || rawAddress.includes('avinashi')) {
      ward = 'Ward 38 - Peelamedu';
      zone = 'East Zone';
      landmark = 'Avinashi Road Signal';
    } else if (rawAddress.includes('saravanampatti')) {
      ward = 'Ward 22 - Saravanampatti';
      zone = 'North Zone';
      landmark = 'IT Park Junction';
    } else if (rawAddress.includes('singanallur')) {
      ward = 'Ward 62 - Singanallur';
      zone = 'South Zone';
      landmark = 'Singanallur Lake Corner';
    }

    return {
      district,
      municipality,
      ward,
      zone,
      landmark,
      formattedAddress: address || `${landmark}, ${ward}, ${district}`,
      confidence: 0.98,
    };
  }
}

export default LocationTool;
