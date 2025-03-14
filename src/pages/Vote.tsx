import styled from "styled-components";
import { useState } from "react";
import { Link } from "react-router-dom";

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
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const SmileyContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
`;

const Smiley = styled.button<{ selected: boolean }>`
  font-size: 40px;
  background: none;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
  color: ${(props) => (props.selected ? "yellow" : "white")};

  &:hover {
    transform: scale(1.2);
  }
`;

const SeasoningContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
`;

const ButtonGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
`;

const SeasoningButton = styled.button<{ selected: boolean }>`
  padding: 10px 15px;
  border-radius: 8px;
  background-color: ${(props) => (props.selected ? "#4a5568" : "#2d3748")};
  color: white;
  border: none;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background-color: #4a5568;
  }
`;

const SubmitButton = styled.button<{ enabled: boolean }>`
  margin-top: 20px;
  padding: 12px 20px;
  font-size: 18px;
  font-weight: bold;
  background-color: ${(props) => (props.enabled ? "#4a5568" : "#2d3748")};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: ${(props) => (props.enabled ? "pointer" : "not-allowed")};
  transition: background 0.3s;

  &:hover {
    background-color: ${(props) => (props.enabled ? "#4a5568" : "#2d3748")};
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
  const [selectedSmiley, setSelectedSmiley] = useState<number | null>(null);
  const [selectedSeasonings, setSelectedSeasonings] = useState<string[]>([]);

  const smileys = ["😡", "☹️", "😐", "🙂", "😃"];
  const seasonings = ["Weniger salzig", "Salziger", "Weniger würzig", "Würziger", "Weniger scharf", "Schärfer", "Gut so"];

  const toggleSeasoning = (option: string) => {
    setSelectedSeasonings((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  const handleSubmit = () => {
    if (selectedSmiley !== null) {
      alert(`Bewertung: ${smileys[selectedSmiley]}\nWürzungswünsche: ${selectedSeasonings.join(", ")}`);
    }
  };

  return (
    <Container>
      <Title>Bewerte das Essen</Title>

      {/* Smiley-Bewertung */}
      <SmileyContainer>
        {smileys.map((smiley, index) => (
          <Smiley key={index} selected={selectedSmiley === index} onClick={() => setSelectedSmiley(index)}>
            {smiley}
          </Smiley>
        ))}
      </SmileyContainer>

      {/* Würzungsoptionen */}
      <SeasoningContainer>
        <h2>Würzungsanpassung</h2>
        <ButtonGrid>
          {seasonings.map((option, index) => (
            <SeasoningButton
              key={index}
              selected={selectedSeasonings.includes(option)}
              onClick={() => toggleSeasoning(option)}
            >
              {option}
            </SeasoningButton>
          ))}
        </ButtonGrid>
      </SeasoningContainer>

      {/* Bestätigungs-Button */}
      <SubmitButton enabled={selectedSmiley !== null} onClick={handleSubmit}>
        Bewertung abschicken
      </SubmitButton>

      {/* Zurück-Button */}
      <BackButton to="/">⬅️ Zurück</BackButton>
    </Container>
  );
};

export default Vote;
