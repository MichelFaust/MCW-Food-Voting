import { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

// Styled Components für das Layout
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
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const Table = styled.table`
  width: 80%;
  max-width: 600px;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: #2d3748;
  color: white;
  border-radius: 8px;
  overflow: hidden;
`;

const Th = styled.th`
  background-color: #4a5568;
  padding: 12px;
  text-align: left;
`;

const Td = styled.td`
  padding: 10px;
  border-bottom: 1px solid #4a5568;
`;

const BackButton = styled.button`
  margin-top: 20px;
  padding: 10px 15px;
  background-color: #4a5568;
  color: white;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background-color: #5a6780;
  }
`;

const Results = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const savedResults = JSON.parse(localStorage.getItem("votingResults") || "[]");
    setResults(savedResults);
  }, []);

  return (
    <Container>
      <Title>📊 Abstimmungsergebnisse</Title>
      
      {results.length > 0 ? (
        <Table>
          <thead>
            <tr>
              <Th>Gericht</Th>
              <Th>Stimmen</Th>
              <Th>Durchschnitt</Th>
              <Th>Würzung</Th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <Td>{result.foodName}</Td>
                <Td>{result.totalVotes}</Td>
                <Td>{result.averageRating.toFixed(2)}</Td>
                <Td>{result.adjustments.join(", ") || "Keine"}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>⚠️ Keine Ergebnisse vorhanden!</p>
      )}

      <BackButton onClick={() => navigate("/admin")}>⬅️ Zurück</BackButton>
    </Container>
  );
};

export default Results;
