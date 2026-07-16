// Script de uso único: asigna el custom claim { isAdmin: true } a una cuenta puntual
// de Firebase Authentication, para que las reglas de Firestore puedan distinguir
// "cualquiera que inició sesión" de "el admin real".
//
// Uso:
//   node scripts/setAdminClaim.js correo@delAdmin.com
//
// Requiere serviceAccountKey.json en la raíz del proyecto (ver README de esta carpeta
// o el mensaje de la consola para saber cómo descargarlo).

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';

const email = process.argv[2];
if (!email) {
  console.error('Uso: node scripts/setAdminClaim.js correo@delAdmin.com');
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(new URL('../serviceAccountKey.json', import.meta.url)));

const app = initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth(app);
const user = await auth.getUserByEmail(email);
await auth.setCustomUserClaims(user.uid, { isAdmin: true });

console.log(`Listo: ${email} (uid: ${user.uid}) ahora tiene el claim isAdmin = true.`);
console.log('Importante: cerrá sesión y volvé a iniciar sesión en la app para que el nuevo token la incluya.');
