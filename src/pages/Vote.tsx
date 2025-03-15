import styled from "styled-components";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background-color: #1a202c;
  color: white;
  position: relative;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
`;

const FoodImage = styled.img`
  width: 300px;
  height: auto;
  border-radius: 10px;
  margin-bottom: 20px;
`;

const SmileyGrid = styled.div`
  display: flex;
  gap: 20px;
`;

const SmileyButton = styled.button<{ selected: boolean }>`
  font-size: ${({ selected }) => (selected ? "50px" : "40px")};
  background: none;
  border: none;
  cursor: pointer;
  transition: font-size 0.2s;

  &:hover {
    font-size: 50px;
  }
`;

const ButtonGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  max-width: 600px;
`;

const Button = styled.button<{ selected: boolean }>`
  padding: 8px 12px;
  text-align: center;
  background-color: ${({ selected }) => (selected ? "#4a5568" : "#2d3748")};
  color: white;
  font-size: 16px;
  font-weight: bold;
  text-decoration: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background-color: #4a5568;
  }
`;

const DoneButton = styled.button`
  margin-top: 20px;
  padding: 12px 20px;
  background-color: #2d3748;
  color: white;
  font-size: 18px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background-color: #4a5568;
  }
`;

const BackButton = styled(Link)`
  position: absolute;
  bottom: 20px;
  left: 20px;
  font-size: 18px;
  background-color: #2d3748;
  color: white;
  padding: 10px 15px;
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.3s;

  &:hover {
    background-color: #4a5568;
  }
`;

const Vote = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const selectedName = params.get("name") || "Unbekannt";

  // Smiley Auswahl
  const [selectedSmiley, setSelectedSmiley] = useState<number | null>(null);
  
  // Würzungsanpassung
  const [selectedAdjustments, setSelectedAdjustments] = useState<string[]>([]);

  // **Essen & Bild laden**
  const [foodName, setFoodName] = useState(localStorage.getItem("foodName") || "Gericht");
  const [foodImage, setFoodImage] = useState(localStorage.getItem("foodImage") || "");

  const smileys = ["😡", "😟", "😐", "😊", "😍"];
  const adjustments = ["Weniger salzig", "Salziger", "Weniger würzig", "Würziger", "Weniger scharf", "Schärfer", "Gut so"];

  // Funktion zur Auswahl des Würzungs-Buttons
  const toggleAdjustment = (adjustment: string) => {
    setSelectedAdjustments((prev) =>
      prev.includes(adjustment) ? prev.filter((item) => item !== adjustment) : [...prev, adjustment]
    );
  };

  // Funktion zum Speichern der Bewertung
  const submitVote = () => {
    if (selectedSmiley === null) {
      alert("Bitte wähle eine Bewertung!");
      return;
    }

    // Gespeicherte Namen abrufen und aktualisieren
    const votedNames = JSON.parse(localStorage.getItem("votedNames") || "[]");
    if (!votedNames.includes(selectedName)) {
      votedNames.push(selectedName);
      localStorage.setItem("votedNames", JSON.stringify(votedNames));
    }

    alert("Deine Bewertung wurde gespeichert!");
    navigate("/");
  };

  return (
    <Container>
      {/* Name + Essen-Name anzeigen */}
      <Title>Hallo {selectedName}, bewerte das Essen: {foodName}</Title>

      {/* Bild des Essens anzeigen, falls vorhanden */}
      {foodImage && <FoodImage src={foodImage} alt="Essen" />}

      {/* Smileys zur Bewertung */}
      <SmileyGrid>
        {smileys.map((smiley, index) => (
          <SmileyButton
            key={index}
            selected={selectedSmiley === index}
            onClick={() => setSelectedSmiley(index)}
          >
            {smiley}
          </SmileyButton>
        ))}
      </SmileyGrid>

      {/* Würzungsanpassung */}
      <Title>Würzungsanpassung</Title>
      <ButtonGrid>
        {adjustments.map((adjustment, index) => (
          <Button
            key={index}
            selected={selectedAdjustments.includes(adjustment)}
            onClick={() => toggleAdjustment(adjustment)}
          >
            {adjustment}
          </Button>
        ))}
      </ButtonGrid>

      {/* Abschließen Button */}
      <DoneButton onClick={submitVote}>Done ✅</DoneButton>

      {/* Zurück-Button */}
      <BackButton to={`/voting?role=${params.get("role")}`}>⬅️ Zurück</BackButton>
    </Container>
  );
};

export default Vote;
