import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

import React from "react";
import IonIcon from "@reacticons/ionicons";
import "./Home.css";
import WelcomePage from "../components/Welcome/WelcomePage";
import Header from "../components/Header/Header";

const Home: React.FC = () => {
  return (
    <IonPage>
      <WelcomePage />
    </IonPage>
  );
};

export default Home;
