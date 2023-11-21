import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

import React from "react";
import "./Home.css";
import WelcomePage from "../components/WelcomePage";

const Home: React.FC = () => {
  return (
    //fix CSS by giving ionPage a class name.  Like the commented out line below
    // <IonPage id="container">

    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>AI Vision APP</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">AI-Vision-App</IonTitle>
          </IonToolbar>
        </IonHeader>
        <WelcomePage />
      </IonContent>
    </IonPage>
  );
};

export default Home;
