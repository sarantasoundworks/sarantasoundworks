// functions/api/firebase-config.js

export async function onRequestGet(context) {
  const { env } = context;

  // Tüm kritik verileri Cloudflare Environment Variables'dan çekiyoruz
  const config = {
    apiKey: env.FIREBASE_API_KEY,
    authDomain: `${env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: env.FIREBASE_PROJECT_ID,
    storageBucket: `${env.FIREBASE_PROJECT_ID}.firebasestorage.app`,
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID, // Bunu da ekle
    appId: env.FIREBASE_APP_ID,
    measurementId: env.FIREBASE_MEASUREMENT_ID // Varsa bunu da ekle
  };

  return new Response(JSON.stringify(config), {
    headers: { 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*" // Güvenlik için sadece kendi domainini de yazabilirsin
    }
  });
}
