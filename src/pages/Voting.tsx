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

const Button = styled.button<{ voted: boolean }>`
  padding: 12px;
  text-align: center;
  background-color: ${({ voted }) => (voted ? "#8b0000" : "#2d3748")};
  color: ${({ voted }) => (voted ? "#ffffff" : "white")};
  font-size: 18px;
  font-weight: bold;
  text-decoration: none;
  border: none;
  border-radius: 8px;
  cursor: ${({ voted }) => (voted ? "not-allowed" : "pointer")};
  transition: background 0.3s;

  &:hover {
    background-color: ${({ voted }) => (voted ? "#8b0000" : "#4a5568")};
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
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const role = params.get("role") || "student"; // Standard: student

  // Zustand für Gäste aus dem Admin-Bereich
  const [guestList, setGuestList] = useState<string[]>([]);
  const [votedNames, setVotedNames] = useState<string[]>([]);

  useEffect(() => {
    // Hol die gespeicherten Namen aus Local Storage
    const storedNames = JSON.parse(localStorage.getItem("votedNames") || "[]");
    setVotedNames(storedNames);

    // Hol die gespeicherten Gäste aus Local Storage
    const storedGuests = JSON.parse(localStorage.getItem("guestList") || "[]");
    setGuestList(storedGuests);
  }, []);

  const handleSelectName = (name: string) => {
    if (!votedNames.includes(name)) {
      navigate(`/vote?name=${name}&role=${role}`);
    }
  };

  // Alphabetisch sortierte Namen inkl. Gäste (Gäste werden nur angezeigt, wenn es welche gibt!)
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
    guest: guestList.length > 0 ? guestList : []
  };

  const names = namesList[role] || namesList.student;

  return (
    <Container>
      <Title>Wähle deinen Namen</Title>
      <ButtonGrid>
        {names.map((name, index) => (
          <Button
            key={index}
            voted={votedNames.includes(name)}
            onClick={() => handleSelectName(name)}
            disabled={votedNames.includes(name)}
          >
            {name}
          </Button>
        ))}
      </ButtonGrid>
      <BackButton to="/">⬅️ Zurück</BackButton>
    </Container>
  );
};

export default Voting;
