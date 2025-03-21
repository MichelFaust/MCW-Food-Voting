import styled from "styled-components";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

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
  margin-bottom: 20px;
  text-align: center;
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

const Image = styled.img`
  width: 300px;
  height: auto;
  margin-bottom: 20px;
  border-radius: 10px;
  object-fit: cover;
`;

const Vote = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const selectedName = params.get("name") || "Unbekannt";
  const role = params.get("role") || "student";

  const [selectedSmiley, setSelectedSmiley] = useState<number | null>(null);
  const [selectedAdjustments, setSelectedAdjustments] = useState<string[]>([]);

  const smileys = ["😡", "😟", "😊", "😍"];
  const adjustments = ["Weniger salzig", "Salziger", "Weniger würzig", "Würziger", "Weniger scharf", "Schärfer", "Gut so"];

  const toggleAdjustment = (adjustment: string) => {
    setSelectedAdjustments((prev) =>
      prev.includes(adjustment) ? prev.filter((item) => item !== adjustment) : [...prev, adjustment]
    );
  };

  const foodName = localStorage.getItem("foodName") || "Aktuelles Gericht";
  const foodImage = localStorage.getItem("foodImage") || "";

  const submitVote = async () => {
    if (selectedSmiley === null) {
      alert("Bitte wähle eine Bewertung!");
      return;
    }

    try {
      const response = await fetch("http://192.168.2.43:3001/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedName,
          role,
          rating: selectedSmiley,
          adjustments: selectedAdjustments,
        }),
      });

      if (response.ok) {
        alert("Deine Bewertung wurde gespeichert!");
        navigate("/");
      } else {
        alert("Fehler beim Speichern deiner Bewertung.");
      }
    } catch (error) {
      console.error("Fehler:", error);
      alert("Server nicht erreichbar.");
    }
  };

  return (
    <Container>
      <Title>
        Hallo {selectedName}, bewerte das Essen:
        <br />
        <strong>{foodName}</strong>
      </Title>
      {foodImage && <Image src={foodImage} alt="Gericht" />}

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

      <DoneButton onClick={submitVote}>Done ✅</DoneButton>
      <BackButton to={`/voting?role=${role}`}>⬅️ Zurück</BackButton>
    </Container>
  );
};

export default Vote;
