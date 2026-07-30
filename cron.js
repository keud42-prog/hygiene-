const cron = require('node-cron');

// L'etat des taches quotidiennes se reinitialise tout seul a 04h00
// (calcule a partir des validations depuis 04h00), SANS rien supprimer :
// l'historique reste intact pour un controle. Ce job trace juste le changement
// de journee (et servira plus tard a envoyer un recap quotidien si tu veux).
function demarrerTaches() {
  cron.schedule(
    '0 4 * * *',
    () => console.log('🔄 Nouvelle journee HACCP —', new Date().toISOString()),
    { timezone: process.env.TZ || 'Europe/Paris' }
  );
  console.log('⏰ Cron 04h00 arme (fuseau', process.env.TZ || 'Europe/Paris', ')');
}

module.exports = { demarrerTaches };
