import { useEffect, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import axios from "axios";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background-color: #1a202c;
  color: white;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 32px;
  margin-bottom: 30px;
  text-align: center;
`;

const Dropdown = styled.select`
  padding: 10px;
  font-size: 16px;
  margin-bottom: 20px;
  border-radius: 6px;
  border: none;
  background-color: #2d3748;
  color: white;
`;

const ResultBox = styled.div`
  background-color: #2d3748;
  border-radius: 12px;
  padding: 25px;
  width: 90%;
  max-width: 400px;
  text-align: left;
`;

const StatLine = styled.p`
  font-size: 20px;
  margin: 10px 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
`;

const ExportButton = styled.button`
  padding: 10px 14px;
  background-color: #4a5568;
  color: white;
  font-weight: bold;
  font-size: 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background-color: #5a6780;
  }
`;

const BackButton = styled(Link)`
  margin-top: 30px;
  padding: 10px 18px;
  background-color: #4a5568;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;

  &:hover {
    background-color: #5a6780;
  }
`;

const Results = () => {
  const apiUrl = `http://${window.location.hostname}:3001`;
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [exportType, setExportType] = useState<"csv" | "xlsx" | "json">("xlsx");
  const [results, setResults] = useState<{
    total: number;
    ratings: Record<string, number>;
    percentages: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    const fetchDates = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/vote-dates`);
        setAvailableDates(res.data || []);
        if (res.data.length > 0) setSelectedDate(res.data[0]);
      } catch (err) {
        console.error("Fehler beim Abrufen der Daten:", err);
      }
    };

    fetchDates();
  }, [apiUrl]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!selectedDate) return;
      try {
        const res = await axios.get(`${apiUrl}/api/results?date=${selectedDate}`);
        setResults(res.data);
      } catch (err) {
        console.error("Fehler beim Abrufen der Ergebnisse:", err);
        setResults(null);
      }
    };

    fetchResults();
  }, [selectedDate, apiUrl]);

  const exportDay = () => {
    if (!selectedDate || !exportType) return;
    const link = document.createElement("a");
    link.href = `${apiUrl}/api/export?date=${selectedDate}&type=${exportType}`;
    link.download = `votes_${selectedDate}.${exportType}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAll = () => {
    if (!exportType) return;
    const link = document.createElement("a");
    link.href = `${apiUrl}/api/export-all?type=${exportType}`;
    link.download = `votes_full_export.${exportType}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container>
      <Title>📊 Ergebnisse</Title>

      <Dropdown value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
        {availableDates.map((date) => (
          <option key={date} value={date}>
            📅 {date}
          </option>
        ))}
      </Dropdown>

      {results ? (
        <ResultBox>
          <StatLine>Gesamt-Stimmen: <strong>{results.total}</strong></StatLine>
          {Object.entries(results.ratings).map(([smiley, count]) => (
            <StatLine key={smiley}>
              {smiley} {count} Stimmen ({results.percentages[smiley]}%)
            </StatLine>
          ))}
        </ResultBox>
      ) : (
        <p>Keine Ergebnisse für den gewählten Tag.</p>
      )}

      <Dropdown value={exportType} onChange={(e) => setExportType(e.target.value as any)}>
        <option value="xlsx">📗 Excel (.xlsx)</option>
        <option value="csv">📄 CSV (.csv)</option>
        <option value="json">🧾 JSON (.json)</option>
      </Dropdown>

      <ButtonGroup>
        <ExportButton onClick={exportDay}>📤 Aktuellen Tag exportieren</ExportButton>
        <ExportButton onClick={exportAll}>📦 Alle Daten exportieren</ExportButton>
      </ButtonGroup>

      <BackButton to="/admin">⬅️ Zurück zum Admin-Panel</BackButton>
    </Container>
  );
};

export default Results;
