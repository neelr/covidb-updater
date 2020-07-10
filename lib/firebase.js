import admin from 'firebase-admin';
import cred from "../cred.json"

try {
    admin.initializeApp({
        credential: admin.credential.cert({
            ...cred
        }),
        databaseURL: 'https://covidb-a3df4.firebaseio.com/'
    });
} catch (error) {
    /*
     * We skip the "already exists" message which is
     * not an actual error when we're hot-reloading.
     */
    if (!/already exists/u.test(error.message)) {
        // eslint-disable-next-line no-console
        console.error('Firebase admin initialization error', error.stack);
    }
}

export default admin.database();