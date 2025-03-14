import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";

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

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Flexible Spalten */
  gap: 10px; /* Abstand zwischen Buttons */
  max-width: 800px; /* Begrenzte Breite für bessere Übersicht */
  width: 100%;
  justify-content: center;
`;

const Button = styled.button`
  padding: 12px;
  text-align: center;
  background-color: #2d3748;
  color: white;
  font-size: 18px;
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

const Voting = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const role = params.get("role") || "student"; // Standard: student

  // Alphabetisch sortierte Namen
  const namesList = {
    student: [
      "Amalia", "Amelie", "Analena", "Aylin", "Benedikt", "Ben", "Caroline", "Dylan",
      "Elena", "Elli", "Emily", "Emilian", "Emilio", "Emma", "Enya", "Frida",
      "Florian", "Frederik", "Hanna", "Henry", "Ilse", "Jannes", "Jannis", "Jill",
      "Jovan", "Julian", "Justus", "Kayla", "Kacper", "Lars", "Leo", "Leonard",
      "Linus", "Ludwig", "Luise", "Luna", "Luna Fay", "Malik", "Marlene", "Marie",
      "Marius", "Mats", "Maximilian", "Mia", "Mia O.", "Michel", "Mike", "Nilay",
      "Pauline", "Phil", "Richard", "Sasha", "Sofia", "Sonja", "Tim", "Valerian"
    ],
    teacher: ["Alex", "Anasthasia", "Aide", "Barbara", "Benedikt", "Büsra", "Colin", "Daniela", "Elif", "Sibylle", "Sybille", "Raj"],
    guest: ["Noch niemand"]
  };

  const names = namesList[role] || namesList.student; // Falls etwas schiefgeht, Default zu Studenten

  return (
    <Container>
      <Title>Wähle deinen Namen</Title>
      <ButtonGrid>
        {names.map((name, index) => (
          <Button key={index} onClick={() => (window.location.href = "/vote")}>
            {name}
          </Button>
        ))}
      </ButtonGrid>
      <BackButton to="/">⬅️ Zurück</BackButton>
    </Container>
  );
};

export default Voting;
