import React, { useState, useEffect, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { IonContent, IonPage, IonButton, IonText } from "@ionic/react";
import Header from "../components/Header/Header";
import "./LetterTest.css";
import Button from "../components/Button/Button";
import Webcam from "react-webcam";
import { FaceMesh } from "@mediapipe/face_mesh";
import * as cam from "@mediapipe/camera_utils";
import { PiButterflyLight } from "react-icons/pi";
import { CiApple } from "react-icons/ci";
import { GiSittingDog } from "react-icons/gi";
import { PiBirdBold } from "react-icons/pi";
import { FaCat, FaHorse, FaCarSide } from "react-icons/fa";
import { FaSailboat } from "react-icons/fa6";
import { WiTrain } from "react-icons/wi";
import IonIcon from "@reacticons/ionicons";

interface LocationState {
  testMode?: string;
  wearGlasses?: string;
  eyeToExamine?: string;
  numberOfCharacters?: number;
}

const keywordIconMap = {
  house: <IonIcon name="home-outline" />,
  flower: <IonIcon name="flower-outline" />,
  butterfly: <PiButterflyLight />,
  umbrella: <IonIcon name="umbrella-outline" />,
  apple: <CiApple />,
  dog: <GiSittingDog />,
  bird: <PiBirdBold />,
  cat: <FaCat />,
  horse: <FaHorse />,
  train: <WiTrain />,
  boat: <FaSailboat />,
  car: <FaCarSide />,
};

const ShapeTest: React.FC = () => {
  const location = useLocation<LocationState>();
  const { testMode, eyeToExamine, numberOfCharacters } = location.state || {};
  const history = useHistory();
  const [fontSize, setFontSize] = useState(5);
  const [recognition, setRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [recognizedKeywords, setRecognizedKeywords] = useState(
    new Set<string>()
  );
  const [iconsToShow, setIconsToShow] = useState([]);
  const [buttonPressCount, setButtonPressCount] = useState(0);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [distanceFromCamera, setDistanceFromCamera] = useState(0);

  useEffect(() => {
    const chars = numberOfCharacters !== undefined ? numberOfCharacters : 5;
    setIconsToShow(selectRandomIcons(chars));
  }, [numberOfCharacters]);

  const onResults = (results) => {
    if (results.multiFaceLandmarks) {
      for (const landmarks of results.multiFaceLandmarks) {
        const leftEye = landmarks[130];
        const rightEye = landmarks[359];
        const eyeDistance = Math.sqrt(
          Math.pow(rightEye.x - leftEye.x, 2) +
            Math.pow(rightEye.y - leftEye.y, 2)
        );
        const calculatedDistance = 1 / eyeDistance;
        setDistanceFromCamera(calculatedDistance);
      }
    }
  };

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
        "#JSGF V1.0; grammar keywords; public <keyword> = house | flower | butterfly | umbrella | apple | dog | bird | cat | horse | train | boat | car;";
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
          setRecognizedKeywords((prev) => new Set(prev).add(transcript));
        }

        if (allKeywordsRecognized()) {
          updateRandomIcons(); // Automatically update icons when all are recognized
        }
      };

      setRecognition(webkitRecognition);
    } else {
      alert(
        "Your browser does not support the Web Speech API. Please use Chrome or Safari."
      );
    }
  }, [iconsToShow]); // Depend on iconsToShow

  useEffect(() => {
    if (allKeywordsRecognized()) {
      updateRandomIcons();
    }
  }, [recognizedKeywords]);

  const updateRandomIcons = () => {
    let newCount = buttonPressCount + 1;
    setButtonPressCount(newCount);

    if (newCount >= 5) {
      setButtonPressCount(0);
      history.push("./Results", { testMode, eyeToExamine, numberOfCharacters });
    } else {
      setRecognizedKeywords(new Set());
      setIconsToShow(selectRandomIcons(numberOfCharacters || 5));
    }
  };

  const isKeywordRecognized = (keyword) =>
    recognizedKeywords.has(keyword.toUpperCase());

  const allKeywordsRecognized = () => {
    return iconsToShow.every((iconObject) =>
      recognizedKeywords.has(iconObject.keyword.toUpperCase())
    );
  };

  useEffect(() => {
    const newFontSize = 10 + distanceFromCamera * 5;
    setFontSize(newFontSize);
  }, [distanceFromCamera]);

  const selectRandomIcons = (numChars) => {
    const allKeywords = Object.keys(keywordIconMap);
    const shuffled = allKeywords.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numChars).map((keyword) => ({
      keyword,
      icon: keywordIconMap[keyword],
    }));
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
      <IonContent className="ion-padding">
        <Webcam ref={webcamRef} className="hidden-webcam" />
        <canvas ref={canvasRef} />
        <div className="imageContainer">
          {iconsToShow.map(({ keyword, icon }, index) => (
            <IonText
              key={index}
              className="testImages"
              style={{
                fontSize: fontSize,
                color: isKeywordRecognized(keyword) ? "green" : "black",
              }}
            >
              {icon}
            </IonText>
          ))}
        </div>
      </IonContent>
      <IonText style={{ textAlign: "center" }}>
        Vision Test: {buttonPressCount}/5
      </IonText>
      <IonButton expand="full" onClick={toggleListening}>
        {isListening ? "Stop Speech Recognition" : "Start Speech Recognition"}
      </IonButton>
      <IonButton expand="full" onClick={updateRandomIcons}>
        Next
      </IonButton>
      <IonButton expand="full" onClick={endTest}>
        End Test
      </IonButton>
    </IonPage>
  );
};

export default ShapeTest;
