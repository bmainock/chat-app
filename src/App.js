import React, { useEffect, useRef, useState } from "react";
import "./App.css";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
//if/else keeps app from trying to reinitalize
if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyCo5_aVYDiYALcyOvpeWnaPMU4S3DS00Tg",
    authDomain: "reactproject-c759a.firebaseapp.com",
    projectId: "reactproject-c759a",
    storageBucket: "reactproject-c759a.appspot.com",
    messagingSenderId: "19381350396",
    appId: "1:19381350396:web:cfdbb50a9aa58618a70c79",
    measurementId: "G-9DN40W8WDC",
  });
}

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        {" "}
        Check out the log in at the bottom
        <SignOut />
      </header>
      <section> {user ? <ChatRoom /> : <SignIn />} </section>
    </div>
  );
}

function SignIn() {
  const signInWiGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };
  return (
    <button onClick={signInWiGoogle}> Sign in with your google account </button>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button onClick={() => auth.signOut()}> Sign out Button </button>
    )
  );
}

function ChatRoom() {
  //constant reminder to uppercase react hooks
  const autoScrolly = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(60); //limit the amount of chars for messages

  const [messages] = useCollectionData(query, { idField: "id" });
  const [formValue, setFormValue] = useState("");
  //async function arrow function
  const sendMessage = async (currentlyChatting) => {
    currentlyChatting.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    {
      /*resets text box back to empty*/
    }

    autoScrolly.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <section>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={autoScrolly}></div>
      </section>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(currentlyChatting) =>
            setFormValue(currentlyChatting.target.value)
          }
        />
        <button type="submit"> Full Send </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.iud ? "sent" : "received";

  return (
    <div className={"message ${messageClass}"}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  );
}

export default App;
