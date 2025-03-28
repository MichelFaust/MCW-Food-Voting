import styled from "styled-components";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100vw;
  height: 100vh;
  background-color: #1a202c;
  color: white;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;

  @media (max-width: 500px) {
    font-size: 20px;
  }
`;

const SmileyGrid = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 20px;
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

  @media (max-width: 500px) {
    font-size: ${({ selected }) => (selected ? "40px" : "32px")};
    &:hover {
      font-size: 40px;
    }
  }
`;

const ButtonGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  max-width: 600px;
  margin-top: 10px;
`;

const Button = styled.button<{ selected: boolean }>`
  padding: 8px 12px;
  text-align: center;
  background-color: ${({ selected }) => (selected ? "#4a5568" : "#2d3748")};
  color: white;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background-color: #4a5568;
  }

  @media (max-width: 500px) {
    font-size: 14px;
    padding: 6px 10px;
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

  @media (max-width: 500px) {
    font-size: 16px;
    padding: 10px 16px;
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

  @media (max-width: 500px) {
    font-size: 16px;
    padding: 8px 12px;
  }
`;

const Image = styled.img`
  width: 300px;
  height: auto;
  margin-bottom: 20px;
  border-radius: 10px;
  object-fit: cover;

  @media (max-width: 500px) {
    width: 90%;
  }
`;

const Vote = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const selectedName = params.get("name") || "Unbekannt";
  const role = params.get("role") || "student";

  const apiUrl = `http://${window.location.hostname}:3001`;

  const [selectedSmiley, setSelectedSmiley] = useState<number | null>(null);
  const [selectedAdjustments, setSelectedAdjustments] = useState<string[]>([]);
  const [foodName, setFoodName] = useState("Aktuelles Gericht");
  const [foodImage, setFoodImage] = useState("");

  const smileys = ["😡", "😟", "😊", "😍"];
  const adjustments = [
    "Weniger salzig",
    "Salziger",
    "Weniger würzig",
    "Würziger",
    "Weniger scharf",
    "Schärfer",
    "Gut so",
  ];

  useEffect(() => {
    const fetchFoodData = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/food`);
        const data = await res.json();
        if (data) {
          setFoodName(data.name || "Aktuelles Gericht");
          setFoodImage(data.image || "");
        }
      } catch (error) {
        console.error("Fehler beim Laden des Gerichts:", error);
      }
    };

    fetchFoodData();
  }, [apiUrl]);

  const toggleAdjustment = (adjustment: string) => {
    setSelectedAdjustments((prev) =>
      prev.includes(adjustment)
        ? prev.filter((item) => item !== adjustment)
        : [...prev, adjustment]
    );
  };

  const submitVote = async () => {
    if (selectedSmiley === null) {
      alert("Bitte wähle eine Bewertung!");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/vote`, {
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
