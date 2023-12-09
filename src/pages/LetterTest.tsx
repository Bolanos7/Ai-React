import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { IonContent, IonPage, IonButton, IonText } from "@ionic/react";
import Header from "../components/Header/Header";
import IonIcon from "@reacticons/ionicons";
import { useLocation } from "react-router-dom";
import "./LetterTest.css";
import Button from "../components/Button/Button";
import Webcam from "react-webcam";
import { FaceMesh } from "@mediapipe/face_mesh";
import * as cam from "@mediapipe/camera_utils";

interface LocationState {
  testMode?: string;
  // wearGlasses?: string;
  eyeToExamine?: string;
}

const generateRandomString = () => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomString = [];
  let usedIndices = new Set();

  while (randomString.length < 5) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      randomString.push({ letter: alphabet[randomIndex], recognized: false });
    }
  }

  return randomString;
};

const LetterTest: React.FC = () => {
  const location = useLocation<LocationState>();
  const { testMode, eyeToExamine } = location.state || {};
  const history = useHistory();
  const [randomString, setRandomString] = useState(generateRandomString());
  const [buttonPressCount, setButtonPressCount] = useState(0);
  const [fontSize, setFontSize] = useState(70);
  const [recognition, setRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [distanceFromCamera, setDistanceFromCamera] = useState(0);

  const onResults = (results) => {
    if (results.multiFaceLandmarks) {
      for (const landmarks of results.multiFaceLandmarks) {
        // Example calculation using eye landmarks
        const leftEye = landmarks[130];
        const rightEye = landmarks[359];
        const eyeDistance = Math.sqrt(
          Math.pow(rightEye.x - leftEye.x, 2) +
            Math.pow(rightEye.y - leftEye.y, 2)
        );

        // Simple calculation assuming a fixed eye distance
        // You might need a more complex calculation based on your setup
        const calculatedDistance = 1 / eyeDistance; // Simplified for example
        setDistanceFromCamera(calculatedDistance);
      }
    }
  };

  // Setup for FaceMesh and Camera from PreTest
  useEffect(() => {
    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      selfieMode: true,
    });

    faceMesh.onResults(onResults);

    if (webcamRef.current) {
      const camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await faceMesh.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const webkitRecognition = new window.webkitSpeechRecognition();
      const speechRecognitionList = new window.webkitSpeechGrammarList();
      const grammar =
        "#JSGF V1.0; grammar lettersAndNumbers; public <letterOrNumber> = (A | B | C | D | ... | Z | 0 | 1 | 2 | ... | 9);";
      speechRecognitionList.addFromString(grammar, 1);

      webkitRecognition.grammars = speechRecognitionList;
      webkitRecognition.maxAlternatives = 1;
      webkitRecognition.continuous = true;
      webkitRecognition.interimResults = true;
      webkitRecognition.lang = "en-US";

      webkitRecognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript
            .trim()
            .toUpperCase();
          console.log("Transcript:", transcript); // Log everything picked up by the microphone

          // Check if the recognized transcript matches any character in randomString
          setRandomString((currentString) =>
            currentString.map((obj) =>
              obj.letter === transcript ? { ...obj, recognized: true } : obj
            )
          );
        }
      };

      setRecognition(webkitRecognition);
    } else {
      alert(
        "Your browser does not support the Web Speech API. Please use Chrome or Safari."
      );
    }
    const newFontSize = 70 + distanceFromCamera * 5; // Example calculation
    setFontSize(newFontSize);
  }, [distanceFromCamera]);

  const increaseFontSize = () => {
    setFontSize(fontSize + 2);
  };

  const decreaseFontSize = () => {
    setFontSize(fontSize - 2);
  };

  const updateRandomIcons = () => {
    const newCount = buttonPressCount + 1;
    setButtonPressCount(newCount);

    if (newCount > 5) {
      setButtonPressCount(0);
      history.push("./Results", { testMode, eyeToExamine });
    } else {
      setButtonPressCount(newCount);
      setRandomString(generateRandomString());
    }
  };

  const endTest = () => {
    history.push("./Results", { testMode, eyeToExamine });
  };

  const toggleListening = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
      setIsListening(!isListening);
    }
  };

  return (
    <IonPage>
      <Header headerText="Vision Test" />
      <IonContent className="ion-padding" scrollY={false}>
        <Webcam ref={webcamRef} className="hidden-webcam" />

        <canvas ref={canvasRef} />
        <IonText className="testText" style={{ fontSize: fontSize }}>
          {randomString.map((obj, index) => (
            <span
              key={index}
              style={{ color: obj.recognized ? "green" : "black" }}
            >
              {obj.letter}
            </span>
          ))}
        </IonText>

        <IonButton expand="full" onClick={toggleListening}>
          {isListening ? "Stop Speech Recognition" : "Start Speech Recognition"}
        </IonButton>
        <IonButton expand="full" onClick={increaseFontSize}>
          Increase Font Size
        </IonButton>
        <IonButton expand="full" onClick={decreaseFontSize}>
          Decrease Font Size
        </IonButton>

        <div className="test-button">
          <Button buttonText="Next" onClickAction={updateRandomIcons} />
        </div>

        <div className="test-button">
          <Button buttonText="End Test" onClickAction={endTest} />
        </div>

        <IonText style={{ textAlign: "center" }}>
          Vision Test: {buttonPressCount}/5
        </IonText>
      </IonContent>
    </IonPage>
  );
};

export default LetterTest;
