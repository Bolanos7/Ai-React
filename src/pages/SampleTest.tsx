import { FaceMesh } from "@mediapipe/face_mesh";
import * as Facemesh from "@mediapipe/face_mesh";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import React, { useRef, useEffect } from "react";
import { useHistory } from "react-router-dom";

const SampleTest: React.FC = () => {
  // function SampleTest() {
  const history = useHistory();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  var camera = null;
  const connect = window.drawConnectors;

  //setting heigh and width of the canvas by giving the webcam video height and width
  function onResults(results) {
    canvasRef.current.width = webcamRef.current.video.videoWidth;
    canvasRef.current.height = webcamRef.current.video.videoHeight;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.save();

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    if (results.multiFaceLandmarks) {
      for (const landmarks of results.multiFaceLandmarks) {
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_TESSELATION, {
          color: "#C0C0C070",
          lineWidth: 1,
        });
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYE, {
          color: "#FF3030",
          lineWidth: 1,
        });
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYEBROW, {
          color: "#FF3030",
          lineWidth: 1,
        });
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_EYE, {
          color: "#30FF30",
          lineWidth: 1,
        });
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_EYEBROW, {
          color: "#30FF30",
          lineWidth: 1,
        });
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_FACE_OVAL, {
          color: "#E0E0E0",
          lineWidth: 1,
        });
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_LIPS, {
          color: "#E0E0E0",
          lineWidth: 1,
        });
      }
    }
  }

  useEffect(() => {
    const faceMesh = new FaceMesh({
      // The URL string is dynamically
      // created by embedding the file parameter within a base URL: https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}.
      // The ${file} within the template literal is a placeholder that gets replaced with the actual value of the file parameter when the function is called.
      locateFile: (file) => {
        console.log("Requested file:", file); // Add this line to debug
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      // if you are 50% sure there is a face, then draw the connectors.
      //change the number to change the accuracy
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      selfieMode: true,
    });

    faceMesh.onResults(onResults);

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await faceMesh.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  });

  return (
    <div className="TestSample">
      <Webcam
        hidden={true}
        ref={webcamRef}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 9,
          width: 640,
          height: 480,
        }}
      />

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 9,
          width: 640,
          height: 480,
        }}
      ></canvas>
    </div>
  );
};

export default SampleTest;
