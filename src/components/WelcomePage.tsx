import "./WelcomePage.css";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonPage,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { eyeOutline } from "ionicons/icons";
import React from "react";
import { useHistory } from "react-router-dom";

interface ContainerProps {}

const WelcomePage: React.FC<ContainerProps> = () => {
  const history = useHistory();

  const goToTermsPage = () => {
    history.push("./Terms");
  };

  return (
    <IonPage id="container">
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Welcome to the VisionAI App </IonCardTitle>
        </IonCardHeader>

        <IonCardContent>
          An Artificial Intelligence Based Near Vision Tester. Providing
          accurate and reliable at home vision testing.
        </IonCardContent>
        <IonButton onClick={goToTermsPage}>
          Continue
          <IonIcon slot="end" icon={eyeOutline}></IonIcon>
        </IonButton>
      </IonCard>
    </IonPage>
  );
};

export default WelcomePage;
