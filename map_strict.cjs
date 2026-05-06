const fs = require('fs');
let channels = JSON.parse(fs.readFileSync('src/data/premiumChannels_clean.json', 'utf8'));

// Exact map to overwrite wrong ones (especially those Claude set to .uy but are AR feeds)
const tvgIdMap = {
  "ch-_en-vivo_espn": "ESPN.ar",
  "ch-_en-vivo_espn-2": "ESPN2.ar",
  "ch-_en-vivo_espn-3": "ESPN3.ar",
  "ch-_en-vivo_espn-4": "ESPN4.ar",
  "ch-_en-vivo_espn-5": "ESPNSur.ar", // Using an AR id instead of uy
  "ch-_en-vivo_espn-6": "ESPNSur2.ar", // Using an AR id instead of uy
  "ch-_en-vivo_espn-7": "ESPNSur3.ar", // Using an AR id instead of uy
  "ch-_en-vivo_espn-premium": "ESPNExtra.ar", // Fox sports premium became espn premium
  "ch-_en-vivo_fox-sports": "FOX Sports",
  "ch-_en-vivo_fox-sports-2": "FOXSports2.ar",
  "ch-_en-vivo_fox-sports-3": "FOXSports3.ar",
  "ch-_en-vivo_hbo": "HBO.ar",
  "ch-_en-vivo_hbo-2": "HBO2.ar",
  "ch-_en-vivo_hbo-family": "HBOFamily.ar",
  "ch-_en-vivo_hbo-mundi": "HBOMundi.ar",
  "ch-_en-vivo_hbo-plus": "HBOPlus(Panamericano).ar",
  "ch-_en-vivo_hbo-pop": "HBOPop.ar",
  "ch-_en-vivo_hbo-sig": "HBOSignature.ar",
  "ch-_en-vivo_hbo-xtreme": "HBOXtreme.ar",
  "ch-_en-vivo_universal-cinema": "UNIVERSALCINEMA.uy", // Kept UY if AR missing
  "ch-_en-vivo_universal-comedy": "UNIVERSALCOMEDY.uy",
  "ch-_en-vivo_universal-crime": "UNIVERSALCRIME.uy",
  "ch-_en-vivo_universal-premiere": "UNIVERSALPREMIERE.uy",
  "ch-_en-vivo_universal-reality": "UNIVERSALREALITY.uy",
  "ch-_en-vivo_studio-universal": "StudioUniversal.ar",
  "ch-_en-vivo_discovery-hyh": "HOMEandHEALTH.uy", // No AR id found easily
  "ch-_en-vivo_discovery-science": "DISCOVERYSCIENCE.uy",
  "ch-_en-vivo_discovery-theater": "DISCOVERYTHEATER.uy",
  "ch-_en-vivo_discovery-world": "DISCOVERYWORLD.uy",
  "ch-_en-vivo_discovery-tlc": "TLC.ar",
  "ch-_en-vivo_discovery-turbo": "DiscoveryTurbo.ar",
  "ch-_en-vivo_discovery-id": "InvestigationDiscovery.ar",
  "ch-_en-vivo_animal-planet": "AnimalPlanet.ar",
  "ch-_en-vivo_cartoonito": "Cartoonito.ar",
  "ch-_en-vivo_cartoon-network": "CartoonNetwork.ar",
  "ch-_en-vivo_nickjr": "NickJr..ar",
  "ch-_en-vivo_axn": "AXN.ar",
  "ch-_en-vivo_cinemax": "Cinemax.ar",
  "ch-_en-vivo_fx": "FX.ar",
  "ch-_en-vivo_golden": "Golden.ar",
  "ch-_en-vivo_tcm": "TCM.ar",
  "ch-_en-vivo_tnt-novelas": "TNTNOVELAS.uy",
  "ch-_en-vivo_tnt-series": "TNTSeries.ar",
  "ch-_en-vivo_tnt": "TNT.ar",
  "ch-_en-vivo_warner": "WarnerChannel.ar",
  "ch-_en-vivo_space": "Space.ar",
  "ch-_en-vivo_film-and-arts": "filmAndarts.ar",
  "ch-_en-vivo_sony-channel": "Sony.ar",
  "ch-_en-vivo_star-channel": "StarChannel.ar",
  "ch-_en-vivo_amc": "AMC.ar",
  "ch-_en-vivo_cinecanal": "Cinecanal.ar",
  "ch-_en-vivo_comedy-central": "ComedyCentral.ar",
  "ch-_en-vivo_e": "ENTERTAINMENTTELEVISION.uy",
  "ch-_en-vivo_food-network": "FOODNETWORK.uy",
  "ch-_en-vivo_gourmet": "ElGourmet.ar",
  "ch-_en-vivo_lifetime": "Lifetime.ar",
  "ch-_en-vivo_history": "History.ar",
  "ch-_en-vivo_history-2": "History2.ar",
  "ch-_en-vivo_natgeo": "NationalGeographic.ar",
  "ch-_en-vivo_discovery": "DiscoveryChannel.ar",
  "ch-_en-vivo_discovery-kids": "DiscoveryKids.ar",
  "ch-_en-vivo_disney-channel": "DisneyChannel.ar",
  "ch-_en-vivo_disney-jr": "DisneyJunior.ar",
  "ch-_eventos_sin-chat__r_L2h0bWwvZmwvP2dldD1TRlJX": "HTV.ar",
  "ch-_eventos_sin-chat__r_L2h0bWwvZmwvP2dldD1UVlJXWDBoRQ__": "MTV.ar",
  "ch-_eventos_sin-chat__r_L2h0bWwvZmwvP2dldD1UVlJXWDBocGRITT0_": "MTVHits.ar",
  "ch-_en-vivo_tyc-sports": "TyCSports.ar",
  "ch-_en-vivo_tyc-sports-int": "TYCSPORTS.uy"
};

channels = channels.map(ch => {
  if (tvgIdMap[ch.id]) {
    ch.tvgId = tvgIdMap[ch.id];
  }
  
  // Set country to AR if it's an AR feed or International transmitting in AR
  // Only leave UY for true Uruguay channels
  const isUY = ch.id.includes('-uy') || ch.name.includes('Uruguay') || ch.name === 'Canal 10' || ch.name === 'Canal 4' || ch.name === 'Teledoce' || ch.name === 'Telemax' || ch.name === 'TV Ciudad';
  if (!isUY && ch.country !== 'AR') {
     // Most international feeds from Flow are AR
     // Especially since Claude incorrectly marked them as UY, ES, VE, etc.
     if (ch.id === 'ch-_en-vivo_sun') ch.country = 'VE'; // Real origin
     else if (ch.id === 'ch-_en-vivo_a3cine') ch.country = 'ES';
     else if (ch.id === 'ch-_en-vivo_c9n') ch.country = 'PY';
     else ch.country = 'AR';
  } else if (isUY) {
     ch.country = 'UY';
  }
  
  return ch;
});

fs.writeFileSync('src/data/premiumChannels_clean.json', JSON.stringify(channels, null, 2));
console.log('Channels updated.');
