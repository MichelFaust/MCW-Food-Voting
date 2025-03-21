import styled from "styled-components";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  max-width: 800px;
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
  const role = params.get("role") || "student";

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
    guest: JSON.parse(localStorage.getItem("guestList") || "[]")
  };

  const [votedNames, setVotedNames] = useState<string[]>([]);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const res = await axios.get("http://192.168.2.43:3001/api/votes");
        const names = res.data.map((vote: any) => vote.name);
        setVotedNames(names);
      } catch (err) {
        console.error("Fehler beim Abrufen der Stimmen:", err);
      }
    };

    fetchVotes(); // Erstmal sofort abrufen
    const interval = setInterval(fetchVotes, 3000); // dann alle 3 Sekunden

    return () => clearInterval(interval);
  }, []);

  const handleSelectName = (name: string) => {
    if (!votedNames.includes(name)) {
      navigate(`/vote?name=${name}&role=${role}`);
    }
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
