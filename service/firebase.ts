import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyASVxhmee29D-U2mcOf3VHdOk9oz2E_KXU",
  authDomain: "cadastro-os.firebaseapp.com",
  databaseURL: "https://cadastro-os-default-rtdb.firebaseio.com",
  projectId: "cadastro-os",
  storageBucket: "cadastro-os.firebasestorage.app",
  messagingSenderId: "990995344011",
  appId: "1:990995344011:web:4246598f0c912cf814c28e"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const realtimeDb = getDatabase(app);

export { auth, realtimeDb };
