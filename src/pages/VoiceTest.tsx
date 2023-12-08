import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { FaceMesh } from "@mediapipe/face_mesh";
import * as cam from "@mediapipe/camera_utils";
import { useHistory } from "react-router-dom";
import { IonContent, IonPage, IonButton, IonText, IonIcon } from "@ionic/react";
import Header from "../components/Header/Header";
import { PiBirdBold, PiButterflyLight } from "react-icons/pi";
import { CiApple } from "react-icons/ci";
import { GiSittingDog } from "react-icons/gi";
import { FaCarSide, FaCat, FaHorse } from "react-icons/fa";
import { WiTrain } from "react-icons/wi";

const generateRandomString = () => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";
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

const VoiceTest: React.FC = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const history = useHistory();
  const [recognition, setRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [buttonPressCount, setButtonPressCount] = useState(0);

  // States from PreTest
  const [distanceFromCamera, setDistanceFromCamera] = useState(0);

  // States from VisionTest
  const [randomString, setRandomString] = useState(
    generateRandomString().map((c) => ({ letter: c, recognized: false }))
  );
  const [fontSize, setFontSize] = useState(70);

  // Generate initial random string for VisionTest

  // Function to handle FaceMesh results (from PreTest)
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

  // Adjust VisionTest states based on distanceFromCamera
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

          setRandomString((currentString) =>
            currentString.map((obj) => {
              // Check if the recognized transcript matches the character
              if (transcript.includes(obj.letter.letter)) {
                return { ...obj, recognized: true };
              }
              return obj;
            })
          );
        }
      };

      setRecognition(webkitRecognition);
    } else {
      alert(
        "Your browser does not support the Web Speech API. Please use Chrome or Safari."
      );
    }
    // Simple example: Adjust font size based on distance
    const newFontSize = 70 + distanceFromCamera * 5; // Example calculation
    setFontSize(newFontSize);
  }, [distanceFromCamera]);
  const startListening = () => {
    if (recognition) {
      recognition.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const increaseFontSize = () => {
    setFontSize(fontSize + 2);
  };

  const decreaseFontSize = () => {
    setFontSize(fontSize - 2);
  };

  const updateRandomString = () => {
    const newCount = buttonPressCount + 1;
    setButtonPressCount(newCount);

    if (newCount === 6) {
      history.push("./Results");
    } else {
      // Call generateRandomString and update randomString state
      setRandomString(
        generateRandomString().map((c) => ({
          letter: { letter: c.letter, recognized: false },
          recognized: false,
        }))
      );
    }
  };

  return (
    <IonPage>
      <Header headerText="Vision Test" />
      <IonContent className="ion-padding">
        <Webcam ref={webcamRef} />
        <canvas ref={canvasRef} />

        <IonText className="testText" style={{ fontSize: fontSize }}>
          {randomString.map((obj, index) => (
            <span
              key={index}
              style={{ color: obj.recognized ? "green" : "black" }}
            >
              {obj.letter.letter} {/* Corrected this line */}
            </span>
          ))}
        </IonText>
        <IonButton onClick={startListening} disabled={isListening}>
          Start Speech Recognition
        </IonButton>
        <IonButton onClick={stopListening} disabled={!isListening}>
          Stop Speech Recognition
        </IonButton>
        <IonButton expand="full" onClick={increaseFontSize}>
          Increase Font Size
        </IonButton>
        <IonButton expand="full" onClick={decreaseFontSize}>
          Decrease Font Size
        </IonButton>
        <IonButton expand="full" onClick={updateRandomString}>
          Next
        </IonButton>
        <IonText style={{ textAlign: "center" }}>
          Vision Test: {buttonPressCount}/5
        </IonText>
        <IonIcon name="home-outline"></IonIcon>
        <IonIcon name="flower-outline"></IonIcon>
        <PiButterflyLight />
        <IonIcon name="umbrella-outline"></IonIcon>
        <CiApple />
        <GiSittingDog />
        <PiBirdBold />
        <FaCat />
        <FaHorse />
        <WiTrain />
        <FaCarSide />
      </IonContent>
    </IonPage>
  );
};

export default VoiceTest;
